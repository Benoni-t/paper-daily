// Focused frontend corrections loaded after app.js.
// The collector stores a bounded cache, dates should follow first publication,
// and paper text may contain inline LaTeX.

const baseUpdateStaticLabels = updateStaticLabels;
const baseUpdateStats = updateStats;
const baseRenderPaper = renderPaper;
const baseRender = render;

function utcDateKey(value) {
  const date = parseDate(value);
  if (!date) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Use UTC consistently so a paper does not move to another day because of the
// reader's browser time zone.
dateKey = utcDateKey;

selectedDate = function selectedDateUtc() {
  return parseDate(`${state.filters.date}T12:00:00Z`) || new Date();
};

startOfDay = function startOfDayUtc(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

startOfWeek = function startOfWeekUtc(date) {
  const day = startOfDay(date);
  const offset = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - offset);
  return day;
};

endOfWeek = function endOfWeekUtc(date) {
  const end = startOfWeek(date);
  end.setUTCDate(end.getUTCDate() + 7);
  return end;
};

startOfMonth = function startOfMonthUtc(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

endOfMonth = function endOfMonthUtc(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
};

// "Daily papers" means first publication date. Revisions only determine the
// date when the source does not expose a publication date.
paperActivityTime = function paperPublicationTime(paper) {
  return firstNonFutureDate(
    paper.published,
    paper.updated,
    paper.first_seen_at,
    paper.last_seen_at,
    activeData().generated_at_iso,
  );
};

// Preserve the user's chosen date when language, view, or collection controls
// are rebuilt. The former implementation always jumped to the newest option.
hydrateDateFilter = function hydrateDateFilterPreservingSelection() {
  const data = activeData();
  const previous = state.filters.date;
  const dates = [
    ...new Set(
      (data.papers || [])
        .map((paper) => dateKey(paperActivityTime(paper)))
        .filter(Boolean),
    ),
  ].sort().reverse();
  const fallback = dateKey(firstNonFutureDate(data.generated_at_iso, new Date().toISOString()) || new Date().toISOString());
  const options = dates.length ? dates : [fallback];
  state.filters.date = options.includes(previous) ? previous : options[0];
  nodes.dateFilter.textContent = "";
  for (const key of options) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = formatDate(`${key}T12:00:00Z`);
    nodes.dateFilter.appendChild(option);
  }
  nodes.dateFilter.value = state.filters.date;
};

function metricLabelNode(metricValueNode) {
  return metricValueNode?.closest(".metric")?.querySelector(".metric-label") || null;
}

function updateStoredPaperMetric() {
  const data = activeData();
  const papers = data.papers || [];
  const stats = data.stats || {};
  const configuredCap = Number(stats.max_stored_papers || 0);
  const trimmed = Number(stats.storage_trimmed_count || 0);
  const knownDefaultCapReached = papers.length >= 1000 && state.filters.collection === "daily";
  const reachedCap = trimmed > 0 || knownDefaultCapReached || (configuredCap > 0 && papers.length >= configuredCap);

  nodes.paperCount.textContent = reachedCap ? `${papers.length}+` : String(papers.length);
  const label = metricLabelNode(nodes.paperCount);
  if (label) {
    label.textContent = state.language === "zh"
      ? reachedCap ? "已存论文（达上限）" : "已存论文"
      : reachedCap ? "Stored papers (cap reached)" : "Stored papers";
  }
  const explanation = state.language === "zh"
    ? `页面当前保存 ${papers.length} 篇论文。${reachedCap ? "数据已达到缓存或文件大小上限，因此这不是累计总量。" : ""}`
    : `The page currently stores ${papers.length} papers.${reachedCap ? " The cache or file-size cap has been reached, so this is not a lifetime total." : ""}`;
  nodes.paperCount.setAttribute("title", explanation);
}

function updateDateMetricLabels() {
  const weekLabel = metricLabelNode(nodes.weekCount);
  const monthLabel = metricLabelNode(nodes.monthCount);
  const dateFieldLabel = nodes.dateFilter?.closest("label")?.querySelector("span");
  if (weekLabel) weekLabel.textContent = state.language === "zh" ? "本周论文" : "Papers this week";
  if (monthLabel) monthLabel.textContent = state.language === "zh" ? "本月论文" : "Papers this month";
  if (dateFieldLabel) dateFieldLabel.textContent = state.language === "zh" ? "发布日期" : "Publication date";
}

updateStaticLabels = function updateStaticLabelsPatched() {
  baseUpdateStaticLabels();
  updateDateMetricLabels();
  updateStoredPaperMetric();
};

updateStats = function updateStatsPatched() {
  baseUpdateStats();
  updateStoredPaperMetric();
  updateDateMetricLabels();
};

function normalizeTitleLatex(title) {
  return String(title || "")
    // arXiv metadata occasionally contains \ensuremath{...} without explicit
    // delimiters. MathJax expects delimiters in ordinary HTML text.
    .replace(/\\ensuremath\s*\{([^{}]+)\}/g, (_match, expression) => `$${expression}$`);
}

renderPaper = function renderPaperPatched(paper) {
  const node = baseRenderPaper(paper);
  const titleNode = node.querySelector(".paper-title");
  if (titleNode) titleNode.textContent = normalizeTitleLatex(paper.title);

  const rawPublished = paper.published || paper.updated || "";
  const shownPublished = isFutureDate(rawPublished) ? paperActivityTime(paper) : rawPublished;
  const dateNode = node.querySelector(".paper-date");
  if (dateNode) {
    dateNode.textContent = `${t("published")} ${formatDate(shownPublished)} · ${t("collected")} ${formatDate(collectionTime(paper))}`;
  }

  const best = paper.best_match || {};
  const reason = state.language === "en"
    ? best.reason_en || best.llm_reason_en || best.llm_reason || best.reason || ""
    : best.llm_reason || best.reason || "";
  const topic = best.topic_name || t("uncategorized");
  const reasonNode = node.querySelector(".match-reason");
  if (reasonNode) reasonNode.textContent = `${topic}: ${reason}`;
  return node;
};

let mathTypesetQueued = false;

function typesetPaperMath() {
  if (!nodes.paperList || !window.MathJax?.typesetPromise) return;
  if (mathTypesetQueued) return;
  mathTypesetQueued = true;
  window.requestAnimationFrame(() => {
    mathTypesetQueued = false;
    try {
      window.MathJax.typesetClear?.([nodes.paperList]);
      window.MathJax.typesetPromise([nodes.paperList]).catch((error) => {
        console.warn("MathJax typesetting failed", error);
      });
    } catch (error) {
      console.warn("MathJax typesetting failed", error);
    }
  });
}

render = function renderPatched() {
  baseRender();
  typesetPaperMath();
};

window.addEventListener("load", typesetPaperMath);
window.addEventListener("mathjax-ready", typesetPaperMath);

// main() in app.js may already be awaiting its JSON fetch when this patch is
// evaluated. These calls also make the correction visible if data loaded very
// quickly from cache.
updateDateMetricLabels();
updateStoredPaperMetric();
