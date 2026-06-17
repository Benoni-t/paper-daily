const THEME_STORAGE_KEY = "paper-daily-theme";
const LANGUAGE_STORAGE_KEY = "paper-daily-language";
const THEMES = new Set(["dark", "light", "eye"]);
const LANGUAGES = new Set(["zh", "en"]);
const FUTURE_DATE_TOLERANCE_DAYS = 2;
const JOURNAL_SOURCE_PATTERNS = [
  "nature",
  "physical review",
  "prx",
  "reviews of modern physics",
  "science",
  "cell",
];

const I18N = {
  zh: {
    loading: "正在读取数据",
    dark: "深色",
    light: "浅色",
    eye: "护眼",
    languageZh: "中文",
    languageEn: "EN",
    settingsTitle: "配置研究方向",
    refreshTitle: "查看更新任务",
    researchRadar: "Research Radar",
    totalPapers: "总论文",
    weekAdded: "本周新增",
    monthAdded: "本月新增",
    topScore: "最高匹配",
    dailyCollection: "每日新论文",
    conferenceCollection: "精选论文 / 期刊",
    all: "全部",
    daily: "当日",
    week: "本周",
    month: "本月",
    highlights: "本周精选",
    date: "日期",
    topic: "方向",
    match: "匹配",
    search: "搜索",
    searchPlaceholder: "标题、作者、关键词",
    allTopics: "全部方向",
    allLevels: "全部",
    latestPapers: "最新论文",
    allPapers: "全部论文",
    allStoredPapers: "全部已收录论文",
    dailyPapers: "当日论文",
    weeklyPapers: "本周论文",
    monthlyPapers: "月度论文",
    paperCountSuffix: "篇",
    published: "发布",
    collected: "收录",
    problem: "问题",
    method: "方法",
    innovation: "创新",
    evidence: "证据",
    limitations: "局限",
    relevance: "匹配",
    original: "原文",
    pdf: "PDF",
    downloadPdf: "下载 PDF",
    emptyValue: "暂无",
    emptyState: "当前筛选条件下没有论文。",
    uncategorized: "未分类",
    updatedAt: "更新于",
    incremental: "增量",
    initialization: "初始化",
    basic: "基础",
    dataLoadFailed: "数据读取失败",
    fallbackSelected: "精选",
    noAbstract: "来源没有提供足够摘要。",
    methodFallback: "请打开论文链接查看方法细节。",
    innovationFallback: "标题或摘要不足，无法可靠提取创新点。",
    evidenceFallback: "证据需要在原文中核验。",
    limitationsFallback: "缺少结构化英文摘要；英文模式下优先显示原始 abstract。",
    relevanceFallback: "与配置方向存在文本匹配。",
  },
  en: {
    loading: "Loading data",
    dark: "Dark",
    light: "Light",
    eye: "Eye-care",
    languageZh: "中文",
    languageEn: "EN",
    settingsTitle: "Configure research interests",
    refreshTitle: "View update workflow",
    researchRadar: "Research Radar",
    totalPapers: "Total papers",
    weekAdded: "Added this week",
    monthAdded: "Added this month",
    topScore: "Top match",
    dailyCollection: "Daily papers",
    conferenceCollection: "Selected papers / journals",
    all: "All",
    daily: "Today",
    week: "This week",
    month: "This month",
    highlights: "Weekly highlights",
    date: "Date",
    topic: "Topic",
    match: "Match",
    search: "Search",
    searchPlaceholder: "Title, author, keyword",
    allTopics: "All topics",
    allLevels: "All",
    latestPapers: "Latest papers",
    allPapers: "All papers",
    allStoredPapers: "All stored papers",
    dailyPapers: "Today’s papers",
    weeklyPapers: "This week’s papers",
    monthlyPapers: "Monthly papers",
    paperCountSuffix: "papers",
    published: "Published",
    collected: "Collected",
    problem: "Abstract / problem",
    method: "Method",
    innovation: "Innovation",
    evidence: "Evidence",
    limitations: "Limitations",
    relevance: "Relevance",
    original: "Original",
    pdf: "PDF",
    downloadPdf: "Download PDF",
    emptyValue: "N/A",
    emptyState: "No papers match the current filters.",
    uncategorized: "Uncategorized",
    updatedAt: "updated",
    incremental: "incremental",
    initialization: "initialization",
    basic: "basic",
    dataLoadFailed: "Failed to load data",
    fallbackSelected: "selected",
    noAbstract: "No sufficiently detailed abstract is available from the source.",
    methodFallback: "Open the paper for method details.",
    innovationFallback: "The title or abstract is insufficient for reliable innovation extraction.",
    evidenceFallback: "Evidence should be checked in the original paper.",
    limitationsFallback: "No structured English summary is available; English mode falls back to the original abstract.",
    relevanceFallback: "The paper text matches the configured research interests.",
  },
};

const state = {
  datasets: {
    daily: null,
    conference: null,
  },
  theme: "dark",
  language: "zh",
  filters: {
    query: "",
    topic: "all",
    level: "all",
    collection: "daily",
    view: "daily",
    date: "",
  },
};

const nodes = {
  updatedAt: document.querySelector("#updatedAt"),
  paperCount: document.querySelector("#paperCount"),
  weekCount: document.querySelector("#weekCount"),
  monthCount: document.querySelector("#monthCount"),
  topScore: document.querySelector("#topScore"),
  resultCount: document.querySelector("#resultCount"),
  viewTitle: document.querySelector("#viewTitle"),
  listTitle: document.querySelector("#listTitle"),
  scopeLabel: document.querySelector("#scopeLabel"),
  paperList: document.querySelector("#paperList"),
  topicFilter: document.querySelector("#topicFilter"),
  levelFilter: document.querySelector("#levelFilter"),
  dateFilter: document.querySelector("#dateFilter"),
  searchInput: document.querySelector("#searchInput"),
  themeOptions: document.querySelectorAll("[data-theme-option]"),
  languageOptions: document.querySelectorAll("[data-language-option]"),
  collectionTabs: document.querySelectorAll("[data-collection]"),
  tabs: document.querySelectorAll(".tab"),
  template: document.querySelector("#paperTemplate"),
};

function t(key) {
  return I18N[state.language]?.[key] || I18N.zh[key] || key;
}

function activeData() {
  return state.datasets[state.filters.collection] || state.datasets.daily || { papers: [], topics: [], stats: {} };
}

function storedTheme() {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.has(theme) ? theme : "dark";
  } catch {
    return "dark";
  }
}

function storedLanguage() {
  try {
    const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return LANGUAGES.has(language) ? language : "zh";
  } catch {
    return "zh";
  }
}

function applyTheme(theme) {
  state.theme = THEMES.has(theme) ? theme : "dark";
  document.body.dataset.theme = state.theme;
  for (const option of nodes.themeOptions) {
    const active = option.dataset.themeOption === state.theme;
    option.classList.toggle("active", active);
    option.setAttribute("aria-checked", String(active));
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  } catch {
    // localStorage may be blocked in privacy-focused browser modes.
  }
}

function applyLanguage(language, rerender = true) {
  state.language = LANGUAGES.has(language) ? language : "zh";
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  for (const option of nodes.languageOptions) {
    const active = option.dataset.languageOption === state.language;
    option.classList.toggle("active", active);
    option.setAttribute("aria-checked", String(active));
  }
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
  } catch {
    // localStorage may be blocked in privacy-focused browser modes.
  }
  updateStaticLabels();
  if (rerender) {
    hydrateTopicFilter();
    hydrateDateFilter();
    updateStats();
    updateUpdatedAt();
    render();
  }
}

function updateStaticLabels() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  });
  if (nodes.searchInput) nodes.searchInput.placeholder = t("searchPlaceholder");
  const allLevelOption = nodes.levelFilter?.querySelector('option[value="all"]');
  if (allLevelOption) allLevelOption.textContent = t("allLevels");
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function maxAcceptedDate() {
  const max = new Date();
  max.setDate(max.getDate() + FUTURE_DATE_TOLERANCE_DAYS);
  return max;
}

function isFutureDate(value) {
  const date = parseDate(value);
  return Boolean(date && date > maxAcceptedDate());
}

function firstNonFutureDate(...values) {
  for (const value of values) {
    if (!value || isFutureDate(value)) continue;
    if (parseDate(value)) return value;
  }
  return "";
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return value ? String(value).slice(0, 10) : "-";
  const locale = state.language === "zh" ? "zh-CN" : "en-GB";
  return date.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
}

function dateKey(value) {
  const date = parseDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function paperActivityTime(paper) {
  return firstNonFutureDate(
    paper.updated,
    paper.published,
    paper.last_seen_at,
    paper.first_seen_at,
    activeData().generated_at_iso,
  );
}

function collectionTime(paper) {
  return firstNonFutureDate(
    paper.last_seen_at,
    paper.first_seen_at,
    paper.updated,
    paper.published,
    activeData().generated_at_iso,
  );
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const day = startOfDay(date);
  const offset = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - offset);
  return day;
}

function endOfWeek(date) {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 7);
  return end;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function inRange(value, start, end) {
  const date = parseDate(value);
  return Boolean(date && date >= start && date < end);
}

function selectedDate() {
  return parseDate(`${state.filters.date}T12:00:00`) || new Date();
}

function scoreOf(paper) {
  return Number(paper.best_match?.score || 0);
}

function levelOf(paper) {
  return String(paper.best_match?.level || "low").toLowerCase();
}

function textIncludes(paper, query) {
  if (!query) return true;
  const haystack = [
    paper.title,
    paper.summary,
    paper.seed_topic,
    (paper.authors || []).join(" "),
    (paper.categories || []).join(" "),
    (paper.matches || []).map((match) => `${match.topic_name || ""} ${match.reason || ""}`).join(" "),
    paper.best_match?.reason,
    paper.chinese_summary?.innovation,
    paper.chinese_summary?.evidence,
    paper.chinese_summary?.limitations,
    paper.chinese_summary?.why_relevant,
    paper.english_summary?.innovation,
    paper.english_summary?.evidence,
    paper.english_summary?.limitations,
    paper.english_summary?.why_relevant,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function isUsableTopicMatch(match) {
  if (!match) return false;
  if ((match.keyword_hits || []).length) return true;
  if (["high", "medium"].includes(String(match.level || "").toLowerCase())) return true;
  return Number(match.score || 0) >= 0.18;
}

function topicIdsForPaper(paper) {
  const ids = new Set();
  if (paper.best_match?.topic_id) ids.add(paper.best_match.topic_id);
  if (paper.seed_topic) ids.add(paper.seed_topic);
  for (const match of paper.matches || []) {
    if (match.topic_id && isUsableTopicMatch(match)) ids.add(match.topic_id);
  }
  return ids;
}

function matchesTopic(paper, topicId) {
  if (topicId === "all") return true;
  return topicIdsForPaper(paper).has(topicId);
}

function matchesBaseFilters(paper) {
  if (!textIncludes(paper, state.filters.query)) return false;
  if (!matchesTopic(paper, state.filters.topic)) return false;
  if (state.filters.level !== "all" && levelOf(paper) !== state.filters.level) return false;
  return true;
}

function isHighlightPaper(paper, date) {
  const activityAt = paperActivityTime(paper);
  if (!inRange(activityAt, startOfWeek(date), endOfWeek(date))) return false;
  if (scoreOf(paper) >= 0.42) return true;
  if (["high", "medium"].includes(levelOf(paper))) return true;
  if (paper.source_type === "conference") return scoreOf(paper) >= 0.18 || Boolean(paper.abstract_source);
  return false;
}

function matchesView(paper) {
  if (state.filters.view === "all") return true;
  const date = selectedDate();
  const activityAt = paperActivityTime(paper);
  if (state.filters.view === "daily") return dateKey(activityAt) === state.filters.date;
  if (state.filters.view === "week") return inRange(activityAt, startOfWeek(date), endOfWeek(date));
  if (state.filters.view === "month") return inRange(activityAt, startOfMonth(date), endOfMonth(date));
  if (state.filters.view === "highlights") return isHighlightPaper(paper, date);
  return true;
}

function comparePapers(a, b) {
  return scoreOf(b) - scoreOf(a) || String(paperActivityTime(b)).localeCompare(String(paperActivityTime(a)));
}

function filteredPapers() {
  const basePapers = (activeData().papers || []).filter((paper) => matchesBaseFilters(paper));
  const papers = basePapers.filter((paper) => matchesView(paper)).sort(comparePapers);
  if (papers.length || state.filters.view !== "highlights") return papers;

  const date = selectedDate();
  return basePapers
    .filter((paper) => inRange(paperActivityTime(paper), startOfWeek(date), endOfWeek(date)))
    .sort(comparePapers)
    .slice(0, 12);
}

function setText(parent, selector, text) {
  parent.querySelector(selector).textContent = text || t("emptyValue");
}

function safeFilename(paper) {
  const title = String(paper.title || paper.id || "paper")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${title || "paper"}.pdf`;
}

function englishSummaryFallback(paper, best) {
  return {
    problem: paper.summary || t("noAbstract"),
    method: t("methodFallback"),
    innovation: t("innovationFallback"),
    evidence: t("evidenceFallback"),
    limitations: t("limitationsFallback"),
    why_relevant: best.llm_reason || best.reason || t("relevanceFallback"),
  };
}

function paperSummary(paper, best) {
  if (state.language === "en") {
    const summary = paper.english_summary || {};
    if (summary.problem || summary.method || summary.innovation || summary.evidence || summary.limitations || summary.why_relevant) {
      return summary;
    }
    return englishSummaryFallback(paper, best);
  }
  return paper.chinese_summary || {};
}

function renderPaper(paper) {
  const node = nodes.template.content.firstElementChild.cloneNode(true);
  const best = paper.best_match || {};
  const summary = paperSummary(paper, best);
  const badge = node.querySelector(".match-badge");
  const level = levelOf(paper);

  badge.textContent = `${level.toUpperCase()} ${scoreOf(paper).toFixed(2)}`;
  badge.classList.add(level);

  const rawPublished = paper.updated || paper.published || "";
  const shownPublished = isFutureDate(rawPublished) ? paperActivityTime(paper) : rawPublished;
  setText(node, ".paper-date", `${t("published")} ${formatDate(shownPublished)} · ${t("collected")} ${formatDate(collectionTime(paper))}`);
  setText(node, ".paper-source", paper.source || "paper");
  setText(node, ".paper-title", paper.title);
  setText(node, ".paper-authors", (paper.authors || []).slice(0, 8).join(", "));
  setText(node, ".summary-problem", summary.problem);
  setText(node, ".summary-method", summary.method);
  setText(node, ".summary-innovation", summary.innovation);
  setText(node, ".summary-evidence", summary.evidence);
  setText(node, ".summary-limitations", summary.limitations);
  setText(node, ".summary-relevant", summary.why_relevant);
  setText(node, ".match-reason", `${best.topic_name || t("uncategorized")}：${best.reason || ""}`);

  node.querySelector('[data-summary-label="problem"]').textContent = t("problem");
  node.querySelector('[data-summary-label="method"]').textContent = t("method");
  node.querySelector('[data-summary-label="innovation"]').textContent = t("innovation");
  node.querySelector('[data-summary-label="evidence"]').textContent = t("evidence");
  node.querySelector('[data-summary-label="limitations"]').textContent = t("limitations");
  node.querySelector('[data-summary-label="relevance"]').textContent = t("relevance");

  const tags = node.querySelector(".paper-tags");
  for (const category of (paper.categories || []).slice(0, 8)) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = category;
    tags.appendChild(tag);
  }

  const absLink = node.querySelector(".abs-link");
  const pdfLink = node.querySelector(".pdf-link");
  const downloadLink = node.querySelector(".download-link");
  const pdfUrl = paper.pdf_url || paper.paper_url || "#";
  absLink.href = paper.paper_url || "#";
  absLink.textContent = t("original");
  pdfLink.href = pdfUrl;
  pdfLink.textContent = t("pdf");
  downloadLink.href = pdfUrl;
  downloadLink.textContent = t("downloadPdf");
  downloadLink.setAttribute("download", safeFilename(paper));
  downloadLink.setAttribute("target", "_blank");
  downloadLink.setAttribute("rel", "noreferrer");
  return node;
}

function viewLabels() {
  const date = selectedDate();
  const dayLabel = formatDate(date.toISOString());
  const weekStart = formatDate(startOfWeek(date).toISOString());
  const weekEndDate = endOfWeek(date);
  weekEndDate.setDate(weekEndDate.getDate() - 1);
  const weekEnd = formatDate(weekEndDate.toISOString());
  const monthLabel = state.language === "zh"
    ? `${date.getFullYear()} 年 ${String(date.getMonth() + 1).padStart(2, "0")} 月`
    : date.toLocaleDateString("en-GB", { year: "numeric", month: "long" });
  return {
    all: [state.filters.collection === "conference" ? t("conferenceCollection") : t("allPapers"), t("allStoredPapers")],
    daily: [t("dailyPapers"), dayLabel],
    week: [t("weeklyPapers"), `${weekStart} - ${weekEnd}`],
    month: [t("monthlyPapers"), monthLabel],
    highlights: [t("highlights"), `${weekStart} - ${weekEnd}`],
  };
}

function updateHeadings(papers) {
  const labels = viewLabels()[state.filters.view];
  nodes.viewTitle.textContent = labels[0];
  nodes.listTitle.textContent = labels[0];
  nodes.scopeLabel.textContent = labels[1];
  nodes.resultCount.textContent = state.language === "zh" ? `${papers.length} ${t("paperCountSuffix")}` : `${papers.length} ${t("paperCountSuffix")}`;
}

function render() {
  const papers = filteredPapers();
  updateHeadings(papers);
  nodes.paperList.textContent = "";

  if (!papers.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("emptyState");
    nodes.paperList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const paper of papers) fragment.appendChild(renderPaper(paper));
  nodes.paperList.appendChild(fragment);
}

function topicPaperCount(topicId) {
  return (activeData().papers || []).filter((paper) => matchesTopic(paper, topicId)).length;
}

function hydrateTopicFilter() {
  nodes.topicFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = t("allTopics");
  nodes.topicFilter.appendChild(allOption);
  for (const topic of activeData().topics || []) {
    const option = document.createElement("option");
    const count = topicPaperCount(topic.id);
    option.value = topic.id;
    option.textContent = count ? `${topic.name} (${count})` : topic.name;
    nodes.topicFilter.appendChild(option);
  }
  nodes.topicFilter.value = state.filters.topic;
}

function hydrateDateFilter() {
  const data = activeData();
  const dates = [
    ...new Set(
      (data.papers || [])
        .map((paper) => dateKey(paperActivityTime(paper)))
        .filter(Boolean),
    ),
  ].sort().reverse();
  const fallback = dateKey(firstNonFutureDate(data.generated_at_iso, new Date().toISOString()) || new Date().toISOString());
  const options = dates.length ? dates : [fallback];
  state.filters.date = options[0];
  nodes.dateFilter.textContent = "";
  for (const key of options) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = formatDate(`${key}T12:00:00`);
    nodes.dateFilter.appendChild(option);
  }
}

function updateStats() {
  const papers = activeData().papers || [];
  const date = selectedDate();
  const weekPapers = papers.filter((paper) => inRange(paperActivityTime(paper), startOfWeek(date), endOfWeek(date)));
  const monthPapers = papers.filter((paper) => inRange(paperActivityTime(paper), startOfMonth(date), endOfMonth(date)));
  const top = papers.reduce((max, paper) => Math.max(max, scoreOf(paper)), 0);
  nodes.paperCount.textContent = String(papers.length);
  nodes.weekCount.textContent = String(weekPapers.length);
  nodes.monthCount.textContent = String(monthPapers.length);
  nodes.topScore.textContent = top.toFixed(2);
}

function syncTabState() {
  for (const item of nodes.collectionTabs) item.classList.toggle("active", item.dataset.collection === state.filters.collection);
  for (const item of nodes.tabs) item.classList.toggle("active", item.dataset.view === state.filters.view);
}

function refreshControlsAndRender() {
  hydrateTopicFilter();
  hydrateDateFilter();
  updateStats();
  updateUpdatedAt();
  syncTabState();
  render();
}

function bindEvents() {
  for (const option of nodes.themeOptions) {
    option.addEventListener("click", () => {
      applyTheme(option.dataset.themeOption);
    });
  }
  for (const option of nodes.languageOptions) {
    option.addEventListener("click", () => {
      applyLanguage(option.dataset.languageOption);
    });
  }
  nodes.searchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim();
    render();
  });
  nodes.topicFilter.addEventListener("change", (event) => {
    state.filters.topic = event.target.value;
    render();
  });
  nodes.levelFilter.addEventListener("change", (event) => {
    state.filters.level = event.target.value;
    render();
  });
  for (const tab of nodes.collectionTabs) {
    tab.addEventListener("click", () => {
      state.filters.collection = tab.dataset.collection;
      state.filters.view = state.filters.collection === "conference" ? "all" : "daily";
      state.filters.topic = "all";
      refreshControlsAndRender();
    });
  }
  nodes.dateFilter.addEventListener("change", (event) => {
    state.filters.date = event.target.value;
    updateStats();
    render();
  });
  for (const tab of nodes.tabs) {
    tab.addEventListener("click", () => {
      state.filters.view = tab.dataset.view;
      syncTabState();
      updateStats();
      render();
    });
  }
}

async function loadData() {
  const response = await fetch("./data/papers.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function loadOptionalData(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) return { generated_at_iso: new Date().toISOString(), topics: [], papers: [], stats: {} };
  return response.json();
}

function isJournalLikePaper(paper) {
  if (paper.source_type === "conference") return true;
  const source = String(paper.source || "").toLowerCase();
  return JOURNAL_SOURCE_PATTERNS.some((pattern) => source.includes(pattern));
}

function isFallbackHighlight(paper) {
  return scoreOf(paper) >= 0.42 || ["high", "medium"].includes(levelOf(paper));
}

function asFallbackHighlightPaper(paper) {
  return {
    ...paper,
    id: `fallback-highlight:${paper.id || paper.paper_url || paper.title}`,
    source: state.language === "zh" ? `${paper.source || "Paper"} · ${t("fallbackSelected")}` : `${paper.source || "Paper"} · ${t("fallbackSelected")}`,
    source_type: "conference",
  };
}

function buildConferenceFallback(dailyData, conferenceData) {
  const dailyPapers = dailyData?.papers || [];
  const existing = conferenceData?.papers || [];
  if (existing.length) return conferenceData;

  let papers = dailyPapers.filter(isJournalLikePaper);
  let mode = "journal-fallback";
  if (!papers.length) {
    papers = dailyPapers.filter(isFallbackHighlight).sort(comparePapers).slice(0, 24).map(asFallbackHighlightPaper);
    mode = "daily-highlight-fallback";
  }
  if (!papers.length) {
    papers = [...dailyPapers].sort(comparePapers).slice(0, 12).map(asFallbackHighlightPaper);
    mode = "daily-top-fallback";
  }

  return {
    generated_at: conferenceData?.generated_at || dailyData?.generated_at,
    generated_at_iso: conferenceData?.generated_at_iso || dailyData?.generated_at_iso || new Date().toISOString(),
    config_source: conferenceData?.config_source || dailyData?.config_source || "fallback",
    data_kind: "conference",
    topics: conferenceData?.topics?.length ? conferenceData.topics : dailyData?.topics || [],
    papers,
    stats: {
      ...(dailyData?.stats || {}),
      ...(conferenceData?.stats || {}),
      paper_count: papers.length,
      new_paper_count: papers.length,
      collection_mode: mode,
    },
  };
}

function modeLabel(mode) {
  if (mode === "incremental") return t("incremental");
  if (!mode || mode === "lookback") return t("initialization");
  return mode;
}

function updateUpdatedAt(message = "") {
  if (message) {
    nodes.updatedAt.textContent = message;
    return;
  }
  const data = activeData();
  const stats = data.stats || {};
  const kind = state.filters.collection === "conference" ? t("conferenceCollection") : t("dailyCollection");
  nodes.updatedAt.textContent = `${kind} · ${t("updatedAt")} ${formatDate(data.generated_at_iso)} · ${modeLabel(stats.collection_mode)} · ${stats.llm_enabled ? "LLM" : t("basic")}`;
}

async function main() {
  applyTheme(storedTheme());
  applyLanguage(storedLanguage(), false);
  bindEvents();
  try {
    state.datasets.daily = await loadData();
    const conferenceData = await loadOptionalData("./data/conference_papers.json");
    state.datasets.conference = buildConferenceFallback(state.datasets.daily, conferenceData);
  } catch (error) {
    state.datasets.daily = {
      generated_at_iso: new Date().toISOString(),
      topics: [],
      papers: [],
      stats: { llm_enabled: false },
    };
    state.datasets.conference = {
      generated_at_iso: new Date().toISOString(),
      topics: [],
      papers: [],
      stats: { llm_enabled: false },
    };
    updateUpdatedAt(`${t("dataLoadFailed")}：${error.message}`);
  }

  updateUpdatedAt();
  hydrateTopicFilter();
  hydrateDateFilter();
  updateStats();
  syncTabState();
  render();
}

main();
