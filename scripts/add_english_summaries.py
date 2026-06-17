#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any

DEFAULT_DAILY_PATH = Path("web/data/papers.json")
DEFAULT_CONFERENCE_PATH = Path("web/data/conference_papers.json")
SUMMARY_FIELDS = ["problem", "method", "innovation", "evidence", "limitations", "why_relevant"]


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data: dict[str, Any]) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def llm_enabled() -> bool:
    return bool(os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("DEEPSEEK_API_KEY"))


def llm_headers(api_key: str) -> dict[str, str]:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "User-Agent": "paper-daily-english-summary/1.0",
    }


def call_openai_compatible(prompt: str) -> dict[str, Any]:
    api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("DEEPSEEK_API_KEY") or ""
    base_url = os.getenv("LLM_BASE_URL", "")
    if not base_url:
        base_url = "https://api.deepseek.com/v1" if os.getenv("DEEPSEEK_API_KEY") else "https://api.openai.com/v1"
    model = os.getenv("LLM_MODEL", "deepseek-chat" if os.getenv("DEEPSEEK_API_KEY") else "gpt-4o-mini")
    endpoint = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "temperature": 0.15,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": "You are a precise scientific-paper analysis and translation assistant. Return valid JSON only; no Markdown.",
            },
            {"role": "user", "content": prompt},
        ],
    }
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers=llm_headers(api_key),
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    content = data["choices"][0]["message"]["content"]
    return json.loads(content)


def clean_text(value: Any) -> str:
    return str(value or "").strip()


def has_english_summary(paper: dict[str, Any]) -> bool:
    summary = paper.get("english_summary")
    if not isinstance(summary, dict):
        return False
    return any(clean_text(summary.get(field)) for field in SUMMARY_FIELDS)


def has_source_summary(paper: dict[str, Any]) -> bool:
    chinese = paper.get("chinese_summary")
    if isinstance(chinese, dict) and any(clean_text(chinese.get(field)) for field in SUMMARY_FIELDS):
        return True
    return bool(clean_text(paper.get("summary")))


def build_prompt(paper: dict[str, Any]) -> str:
    best = paper.get("best_match") or {}
    chinese = paper.get("chinese_summary") or {}
    matches = paper.get("matches") or []
    return f"""
Convert the following paper-analysis record into a clean English structured summary.

Rules:
1. Do not mechanically translate awkward Chinese phrasing. Rewrite in natural academic English.
2. Keep the analysis faithful to the abstract and the existing Chinese analysis. Do not invent results not supported by the abstract.
3. If the existing Chinese analysis contains useful method/innovation/evidence/limitation details, preserve them in English.
4. If evidence is insufficient, say so directly.
5. The relevance field must be in English and should explain why the paper matches the configured research interests.
6. Return JSON only.

Paper metadata:
Title: {clean_text(paper.get('title'))}
Authors: {', '.join(paper.get('authors', [])[:8])}
Source: {clean_text(paper.get('source'))}
Categories: {', '.join(paper.get('categories', []))}
Abstract: {clean_text(paper.get('summary'))}

Best match:
Topic: {clean_text(best.get('topic_name'))}
Score: {best.get('score')}
Level: {clean_text(best.get('level'))}
Chinese/basic reason: {clean_text(best.get('llm_reason') or best.get('reason'))}
All match reasons: {json.dumps(matches[:5], ensure_ascii=False)}

Existing Chinese structured summary:
problem: {clean_text(chinese.get('problem'))}
method: {clean_text(chinese.get('method'))}
innovation: {clean_text(chinese.get('innovation'))}
evidence: {clean_text(chinese.get('evidence'))}
limitations: {clean_text(chinese.get('limitations'))}
why_relevant: {clean_text(chinese.get('why_relevant'))}

Output schema:
{{
  "problem": "English, 1-2 sentences. State the problem or scope precisely.",
  "method": "English, 1-3 sentences. Summarize the method, mechanism, review structure, or system design.",
  "innovation": "English. Concrete contribution or novelty; for reviews, state the synthesis value.",
  "evidence": "English. Evidence, experiments, theory, benchmarks, or a statement that the abstract does not provide direct evidence.",
  "limitations": "English. Limitations or what needs full-text verification.",
  "why_relevant": "English. Why it matches the configured research directions.",
  "reason_en": "Short English match reason for the card footer."
}}
""".strip()


def fallback_english_summary(paper: dict[str, Any]) -> dict[str, str]:
    best = paper.get("best_match") or {}
    abstract = clean_text(paper.get("summary"))
    return {
        "problem": abstract or "No sufficiently detailed abstract is available from the source.",
        "method": "Open the paper for method details.",
        "innovation": "The title or abstract is insufficient for reliable innovation extraction.",
        "evidence": "Evidence should be checked in the original paper.",
        "limitations": "No structured English summary is available; this entry falls back to the original abstract.",
        "why_relevant": clean_text(best.get("llm_reason") or best.get("reason")) or "The paper text matches the configured research interests.",
    }


def summarize_paper_english(paper: dict[str, Any]) -> tuple[dict[str, str], str]:
    if not llm_enabled():
        return fallback_english_summary(paper), ""
    data = call_openai_compatible(build_prompt(paper))
    summary = {field: clean_text(data.get(field)) for field in SUMMARY_FIELDS}
    for field in SUMMARY_FIELDS:
        if not summary[field]:
            summary[field] = fallback_english_summary(paper)[field]
    return summary, clean_text(data.get("reason_en"))


def process_payload(path: Path, max_items: int, force: bool, delay_seconds: float) -> int:
    if not path.exists():
        return 0
    payload = load_json(path)
    papers = payload.get("papers", [])
    if not isinstance(papers, list):
        return 0

    changed = 0
    attempted = 0
    for paper in papers:
        if not isinstance(paper, dict):
            continue
        if has_english_summary(paper) and not force:
            continue
        if not has_source_summary(paper):
            continue
        if max_items > 0 and attempted >= max_items:
            break
        attempted += 1
        try:
            summary, reason_en = summarize_paper_english(paper)
        except Exception as exc:
            print(f"Warning: English summary failed for {paper.get('id')}: {exc}", file=sys.stderr)
            summary, reason_en = fallback_english_summary(paper), ""
        paper["english_summary"] = summary
        best = paper.get("best_match")
        if isinstance(best, dict):
            best["llm_reason_en"] = summary.get("why_relevant", "")
            if reason_en:
                best["reason_en"] = reason_en
        changed += 1
        if delay_seconds > 0 and (max_items <= 0 or attempted < max_items):
            time.sleep(delay_seconds)

    if changed:
        stats = payload.setdefault("stats", {})
        if isinstance(stats, dict):
            stats["english_summary_count"] = sum(1 for paper in papers if isinstance(paper, dict) and has_english_summary(paper))
            stats["english_summary_updated_count"] = changed
        write_json(path, payload)
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(description="Add English structured summaries to Paper Daily JSON data.")
    parser.add_argument("--daily", type=Path, default=DEFAULT_DAILY_PATH)
    parser.add_argument("--conference", type=Path, default=DEFAULT_CONFERENCE_PATH)
    parser.add_argument("--max-items", type=int, default=int(os.getenv("MAX_ENGLISH_SUMMARIES", "80")))
    parser.add_argument("--force", action="store_true", default=os.getenv("FORCE_ENGLISH_SUMMARIES", "").lower() in {"1", "true", "yes"})
    parser.add_argument("--delay-seconds", type=float, default=float(os.getenv("ENGLISH_SUMMARY_DELAY_SECONDS", "0")))
    args = parser.parse_args()

    daily_changed = process_payload(args.daily, args.max_items, args.force, args.delay_seconds)
    remaining = max(0, args.max_items - daily_changed) if args.max_items > 0 else 0
    conference_max = remaining if args.max_items > 0 else 0
    conference_changed = process_payload(args.conference, conference_max, args.force, args.delay_seconds)
    print(f"English summaries updated: daily={daily_changed}, conference={conference_changed}")


if __name__ == "__main__":
    main()
