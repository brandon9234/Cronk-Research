let dashboard;
let selectedCompany = "";
let selectedCompanyProduction = "";
let selectedListingCycleKey = "";
let selectedListingSubstrate = "";
let selectedListingTimeframePreset = "";
let selectedBuyerMomentId = "";
let selectedImportBuyerMomentId = "";
let selectedMarketSegment = "";
let buyerMomentRowsCache = new Map();
let buyerMomentSummariesCache = null;
let buyerMomentCatalogCache = null;
let buyerMomentTopListingRowsCache = null;
let buyerMomentListingCycleRowsCache = new Map();
let customBuyerMomentRange = null;
const CUSTOM_BUYER_MOMENT_ID = "custom-date-range";
const DATA_ASSET_VERSION = "mymaravia-category-rules-20260601-1";
const BUYER_MOMENT_LANE_HEIGHT = 30;
const BUYER_MOMENT_HIGH_OPPORTUNITY_SCORE = 68;
const BUYER_MOMENT_BUILD_FIT_ORDER = [
  "Prime MyMaravia fit",
  "Strong test fit",
  "Workplace test fit",
  "Exploratory fit",
  "Low build fit"
];
const BUYER_MOMENT_FILTER_IDS = [
  ["opportunity", "buyer-moment-filter-opportunity"],
  ["holiday", "buyer-moment-filter-holiday"],
  ["work", "buyer-moment-filter-work"],
  ["recipient", "buyer-moment-filter-recipient"],
  ["life", "buyer-moment-filter-life"],
  ["local", "buyer-moment-filter-local"]
];
const LISTING_RENDER_LIMIT = 500;
const REVIEW_LISTING_PREVIEW_CHUNKS = 1;
const REVIEW_LISTING_RESULT_LIMIT = 5000;
const REVIEW_LISTING_SEARCH_MIN_CHARS = 2;
const REVIEW_LISTING_PROGRESS_RENDER_MS = 500;
const LISTING_TIMEFRAME_CUSTOM_ID = "custom";
const LISTING_TIMEFRAME_PRESETS = {
  "mothers-day": { label: "Mother's Day season", start: "04-15", end: "05-25" },
  "graduation": { label: "Graduation season", start: "04-15", end: "06-15" },
  "christmas": { label: "Christmas season", start: "11-01", end: "12-31" }
};
let listingRenderTimer = null;
const reviewListingState = {
  rowChunks: new Map(),
  cycleChunks: new Map(),
  cycleChunkLoading: new Map(),
  rowByCycleKey: new Map(),
  previewRows: [],
  previewLoaded: false,
  previewLoading: false,
  searchKey: "",
  searchRows: [],
  searchMatches: 0,
  searchScanned: 0,
  searchComplete: false,
  searchLoading: false,
  searchToken: 0,
  searchAbortController: null,
  lastProgressRenderAt: 0
};

const numericColumns = new Set([
  "7D Sales", "30D Sales", "Avg Daily Sales (30D)", "Active Listings", "Daily Sales",
  "Daily Change", "Daily Change %", "Sales Values Entered", "Entered Change", "Entered Change %",
  "Raw Rows", "Unique Shops", "Duplicate Shop-Date Pairs", "Raw Market Sales", "Deduped Market Sales",
  "Potential Inflation", "Category Est. Daily Sales", "Category Est. 30D Sales", "Total Est. Daily Sales",
  "Total Est. 30D Sales", "Listing Count", "Shop Count", "Review Count", "Est. 30D Sales",
  "Est. Daily Sales", "Recent Avg Daily Sales", "Prior Avg Daily Sales", "Delta", "Delta %",
  "Latest Complete Daily Sales", "Total Daily Sales In Range", "eRank 7D Sales", "eRank 30D Sales",
  "Review Ledger Rows", "Recent Matching-Shop Avg Daily Sales", "Prior Matching-Shop Avg Daily Sales",
  "Matching Listings", "Matching Shops", "Days Used", "Tracked Shop Rows", "Opportunity Score",
  "Demand Score", "Cronk Research Fit", "Evidence Score", "Momentum Score", "Saturation Penalty",
  "Market Daily Sales", "Market 30D Sales", "Avg Daily Sales / Listing", "Current 7D Sales",
  "Current 30D Sales", "Current Avg Daily Sales", "SQL Daily Rows", "SQL Shops", "Receipts",
  "Transactions", "Listings", "Reviews", "Launch Priority", "Tag Confidence",
  "Price", "Views", "Favorites", "Tags Count", "Recent 7D Sales", "Recent 30D Sales",
  "Recent 90D Sales", "Recent 180D Sales", "Recent 30D Revenue", "Recent 180D Revenue",
  "Listing Age Days", "Sales Rate Window Days",
  "MyMaravia Listings", "Current Product Categories", "Market Long Tails In Current Categories",
  "Market Long Tails", "Built Long Tails", "Needs Build", "Coverage %", "Top Open Daily Sales",
  "Recent Reviews", "Recent Avg Rating", "Tracked Listings", "Tracked Product Categories",
  "Tracked Production Methods", "Tracked Est. Daily Sales", "Tracked Est. 30D Sales",
  "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Review Corpus Listings",
  "Review Corpus Avg Rating", "Review Evidence Count", "Review Corpus Span Days",
  "Review Corpus Months Covered", "Peak Review Month Count", "Seasonality Index",
  "eRank Avg Daily Sales (30D)", "eRank Total Sales",
  "Estimated Monthly Sales", "Estimated Sales / Active Listing", "Reviews / Active Listing",
  "Sales Per Review Used", "Observed Days", "Estimated Daily Sales", "Estimated Weekly Sales",
  "Recent Daily Sales", "Recent Weekly Sales", "Prior Daily Sales", "Prior Weekly Sales",
  "Peak Daily Sales", "Peak Weekly Sales", "Cycle Weeks Covered",
  "Moment Estimated Sales", "Moment Avg Daily Sales", "Moment Avg Weekly Sales", "Moment Review Count",
  "Moment Weeks", "Moment Weeks With Demand", "Matching Listings", "Listings With Velocity",
  "Top Listing Sales", "API Total Matches Sum", "Selected Listing Rows", "Unique Top Listing IDs",
  "Unique Top Shop IDs", "API Rank", "API Matches", "Shop Sold Count", "Shop Review Count",
  "Buyer Moment Opportunity Score", "API Rank Score", "Review Velocity Score", "Engagement Score",
  "Shop Strength Score", "Moment Fit Score", "Category Fit Score", "MyMaravia Build Fit",
  "Avg Opportunity Score", "High Opportunity Listings", "Local Review Signal Listings", "Segment Rank",
  "Shop Avg Rating", "Favorites", "Local Review Rows", "Local 365D Reviews", "Local 90D Reviews",
  "Draft Listings", "My Daily Sales", "Current Market Daily Sales", "Current Market Share %",
  "Fix Conversion", "Saturated / Niche Down", "Active Listings", "My Category Daily Sales",
  "Market Daily Sales", "My Market Share %", "Top Competitor Daily Sales", "Leader Gap Daily",
  "View-Favorite Rate %", "Sales / 100 Views", "Market Share %", "Market Listings",
  "Market Shops", "Leader Match %", "Priority", "Top Competitor 30D Sales",
  "Top Competitor eRank 7D Sales", "Top Competitor eRank 30D Sales",
  "Top Competitor Avg Daily Sales (30D)", "Top Competitor Active Listings",
  "Top Competitor Review Corpus Count", "Top Competitor 90D Reviews",
  "Top Competitor 365D Reviews", "Top Competitor Avg Rating",
  "My Daily Sales", "My 30D Sales", "My Recent 30D Sales", "My Market Share %",
  "Competing Daily Sales", "Competing 30D Sales", "Competitor Market Share %",
  "Segment Daily Sales", "Segment 30D Sales", "Segment Share %",
  "Covered Competitor Daily", "Covered 30D", "Covered Share %",
  "Competitor Rows Covered", "Best Listing Daily",
  "Last Year Timeframe Estimated Sales", "Last Year Timeframe Avg Daily Sales",
  "Last Year Timeframe Review Count", "Last Year Timeframe Weeks", "Last Year Timeframe Weeks With Demand",
  "Action Score", "Expected Daily Sales"
]);

const wrappedColumns = new Set([
  "Product Title", "Tags", "Actual Tags", "My Actual Tags", "Best Guess Tags", "Tags Source", "Tags Captured At", "Matched Product Categories", "Source / Context", "Counts / Metrics",
  "Blocker / Issue", "Next Action", "Notes", "Source Note", "Top Substrates", "Listing URL",
  "Product Bet", "Buyer Intent", "Why It Matters", "Launch Brief", "Suggested Listings",
  "Primary Product Family", "Strategic Read", "Evidence Note", "Source", "Refresh Step",
  "Product Substrate Category", "Original Broad Category", "Category Aliases", "Production Tag",
  "Customization Tag", "Tag Evidence", "Blank / Generic Sources", "Top Open Long Tail",
  "Existing MyMaravia Long Tails", "Market Long Tail", "Matching MyMaravia Listing",
  "Build Recommendation", "Match Tokens", "Market Listing URL", "Top Competitor",
  "Top Competitor Shop", "Recommended Move", "CTR Data Status", "Market State",
  "Conquest Status", "Trend Source", "Trend Confidence", "Top Competitor Tags",
  "Top Competitor Listing URL", "Top Competitor Production Tag", "Top Competitor Trend",
  "Cycle Confidence", "Weekly Trend", "Buyer Moment", "Moment Timeframe", "Moment Window", "Matched Cues",
  "Moment Source", "Buyer Moment Tags", "Opportunity Band", "MyMaravia Build Read", "Build Fit Reason",
  "Local Review Signal", "Build Fit Segment", "Top Opportunity Listing", "Top Opportunity Shop", "Top Listing", "Top Shop", "Target Category", "My Listing",
  "Competing Listing", "Competing Shop", "Competing Tags", "My Listing URL", "Competitor Listing URL",
  "Best Listing", "Top Competitor Row", "Repeated Match Cues", "Cue / Action",
  "Evidence", "Next Edit", "Market Control Read", "Last Year Timeframe Window", "Last Year Timeframe Signal",
  "Action", "Product / Listing", "Source Signal", "Next Step"
]);

const thumbnailColumns = new Set(["Thumbnail", "Listing Thumbnail", "Market Thumbnail", "Top Competitor Thumbnail", "My Thumbnail", "Competitor Thumbnail"]);
const sourceLinkColumns = new Set(["Blank / Generic Sources"]);
const companyColumns = new Set(["Shop", "Market Shop", "Top Shop"]);
const badgeColumns = new Set(["Conquest Status", "Market State", "Opportunity Band", "MyMaravia Build Read", "Local Review Signal", "Action Type", "Confidence"]);
const realTagColumns = new Set(["Tags", "Actual Tags", "My Actual Tags"]);

const plotConfig = { responsive: true, displayModeBar: false };

function fmt(value, column = "") {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (numericColumns.has(column) && typeof value === "number") {
    if (column.includes("%")) return `${value.toFixed(1)}%`;
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: value % 1 ? 1 : 0 }).format(value);
  }
  return String(value);
}

function metric(label, value) {
  return `<div class="metric"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(String(value ?? "Unavailable"))}</div></div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function linkCell(value) {
  const text = String(value ?? "");
  if (!/^https?:\/\//i.test(text)) return escapeHtml(text);
  const label = text.includes("etsy.com") ? "Open listing" : "Open link";
  return `<a href="${escapeHtml(text)}" target="_blank" rel="noreferrer">${label}</a>`;
}

function thumbnailTitle(row, column) {
  const isCompetitorThumb = column === "Top Competitor Thumbnail" || column === "Competitor Thumbnail";
  const isMarketThumb = column === "Market Thumbnail";
  return String(
    isCompetitorThumb
      ? row["Competing Listing"] || row["Top Competitor"] || "Top competitor thumbnail"
      : isMarketThumb
        ? row["Market Long Tail"] || "Market listing thumbnail"
        : row["My Listing"] || row["Product Title"] || "Listing thumbnail"
  );
}

function listingThumbnailHref(row, column, src) {
  const isCompetitorThumb = column === "Top Competitor Thumbnail" || column === "Competitor Thumbnail";
  const isMarketThumb = column === "Market Thumbnail";
  const href = String(
    isCompetitorThumb
      ? row["Competitor Listing URL"] || row["Top Competitor Listing URL"] || row["Market Listing URL"] || row["Listing URL"] || src
      : isMarketThumb
        ? row["Market Listing URL"] || row["Listing URL"] || src
        : row["My Listing URL"] || row["Listing URL"] || src
  );
  return /^https?:\/\//i.test(href) ? href : src;
}

function thumbnailCell(row, column) {
  const src = String(row[column] ?? "").trim();
  if (!/^https?:\/\//i.test(src)) return "";
  const href = listingThumbnailHref(row, column, src);
  const title = thumbnailTitle(row, column);
  return `<a class="listing-thumb-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer"><img class="listing-thumb" src="${escapeHtml(src)}" alt="${escapeHtml(title)}" loading="lazy"></a>`;
}

function sourceLinksCell(value) {
  const text = String(value ?? "").trim();
  if (!text) return `<span class="source-status">Not researched yet</span>`;
  if (/^(cannot buy|not researched)/i.test(text)) {
    return `<span class="source-status">${escapeHtml(text)}</span>`;
  }
  const links = text.split(/\n+/).map(item => {
    const [label, url] = item.split("|");
    if (!label || !/^https?:\/\//i.test(url || "")) return escapeHtml(item);
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
  }).join("");
  return `<div class="source-links">${links}</div>`;
}

function companyName(value) {
  return String(value ?? "").trim();
}

function companyLinkCell(value) {
  const name = companyName(value);
  if (!name) return "";
  return `<button class="company-link" type="button" data-company="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
}

function productionTagName(value) {
  return String(value || "Unclassified").trim();
}

function productionLinkCell(value) {
  const tag = productionTagName(value);
  const active = tag === selectedCompanyProduction ? " active" : "";
  return `<button class="production-link${active}" type="button" data-production="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`;
}

function hasLocalReviewSignal(row) {
  const label = String(row["Local Review Signal"] || row["Cycle Confidence"] || "").toLowerCase();
  if (label.includes("no local review signal")) return false;
  return numericCell(row, "Review Corpus Count") > 0 ||
    numericCell(row, "Local Review Rows") > 0 ||
    numericCell(row, "Local 365D Reviews") > 0 ||
    numericCell(row, "Local 90D Reviews") > 0 ||
    numericCell(row, "Moment Review Count") > 0;
}

function listingCycleLinkCell(row) {
  const key = String(row["Weekly Cycle Key"] || "");
  if (!key || !row["Weekly Sales Graph"]) return "";
  if (!hasLocalReviewSignal(row)) {
    return `<span class="no-signal">No local review signal yet</span>`;
  }
  const active = key === selectedListingCycleKey ? " active" : "";
  return `<button class="cycle-link${active}" type="button" data-cycle-key="${escapeHtml(key)}">Open graph</button>`;
}

function visibleColumnsForRows(rows, columns) {
  const cols = [...(columns || Object.keys(rows[0] || {}))];
  if (!cols.includes("Best Guess Tags")) return cols;
  const visibleRealTagColumns = cols.filter(col => realTagColumns.has(col));
  const hasVisibleRealTags = visibleRealTagColumns.some(col =>
    rows.some(row => String(row[col] ?? "").trim())
  );
  return hasVisibleRealTags ? cols.filter(col => col !== "Best Guess Tags") : cols;
}

function renderTable(targetId, rows, columns = null, limit = null) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const data = limit ? rows.slice(0, limit) : rows;
  if (!data || data.length === 0) {
    target.innerHTML = `<div class="empty">No rows available in this snapshot.</div>`;
    return;
  }
  const cols = visibleColumnsForRows(data, columns);
  const header = cols.map(col => {
    const cls = [
      wrappedColumns.has(col) ? "wrap" : "",
      thumbnailColumns.has(col) ? "thumbnail-cell" : ""
    ].filter(Boolean).join(" ");
    return `<th class="${cls}">${escapeHtml(col)}</th>`;
  }).join("");
  const body = data.map(row => {
    const cells = cols.map(col => {
      const cls = [
        wrappedColumns.has(col) ? "wrap" : "",
        thumbnailColumns.has(col) ? "thumbnail-cell" : ""
      ].filter(Boolean).join(" ");
      const value = thumbnailColumns.has(col)
        ? thumbnailCell(row, col)
        : sourceLinkColumns.has(col)
          ? sourceLinksCell(row[col])
        : targetId === "company-production" && col === "Production Tag"
          ? productionLinkCell(row[col])
        : col === "Weekly Sales Graph"
          ? listingCycleLinkCell(row)
        : companyColumns.has(col)
          ? companyLinkCell(row[col])
        : badgeColumns.has(col)
          ? diagnosticBadge(row[col])
        : col.toLowerCase().includes("url")
          ? linkCell(row[col])
          : escapeHtml(fmt(row[col], col));
      return `<td class="${cls}">${value}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  target.innerHTML = tableShell(header, body);
  syncBottomScrollbar(target);
}

function rawPreviewRows(key) {
  const preview = dashboard?.rawPreviews?.[key];
  if (Array.isArray(preview)) return preview;
  return Array.isArray(preview?.rows) ? preview.rows : [];
}

function rawPreviewColumns(key) {
  const preview = dashboard?.rawPreviews?.[key];
  if (Array.isArray(preview?.columns)) return preview.columns;
  const rows = rawPreviewRows(key);
  return rows.length ? Object.keys(rows[0]) : [];
}

function tableShell(header, body) {
  return `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div><div class="table-scrollbar" role="group" aria-label="Horizontal table scroll"><button class="table-scroll-button" type="button" data-scroll-dir="-1" aria-label="Scroll table left">&lt;</button><div class="table-scrollbar-track"><div class="table-scrollbar-thumb"></div></div><button class="table-scroll-button" type="button" data-scroll-dir="1" aria-label="Scroll table right">&gt;</button></div>`;
}

function syncBottomScrollbar(target) {
  const wrap = target.querySelector(".table-wrap");
  const table = target.querySelector("table");
  const bar = target.querySelector(".table-scrollbar");
  const track = target.querySelector(".table-scrollbar-track");
  const thumb = target.querySelector(".table-scrollbar-thumb");
  const buttons = target.querySelectorAll(".table-scroll-button");
  if (!wrap || !table || !bar || !track || !thumb) return;

  wrap.addEventListener("scroll", () => {
    updateBottomScrollbar(target);
  });

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.scrollDir || 1);
      wrap.scrollBy({ left: direction * wrap.clientWidth * 0.85, behavior: "smooth" });
    });
  });

  track.addEventListener("pointerdown", event => {
    if (event.target === thumb) return;
    const thumbBox = thumb.getBoundingClientRect();
    const direction = event.clientX < thumbBox.left ? -1 : 1;
    wrap.scrollBy({ left: direction * wrap.clientWidth * 0.85, behavior: "smooth" });
  });

  let dragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  thumb.addEventListener("pointerdown", event => {
    dragging = true;
    dragStartX = event.clientX;
    dragStartScroll = wrap.scrollLeft;
    thumb.classList.add("dragging");
    thumb.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  thumb.addEventListener("pointermove", event => {
    if (!dragging) return;
    const maxScroll = Math.max(1, table.scrollWidth - wrap.clientWidth);
    const maxThumbTravel = Math.max(1, track.clientWidth - thumb.offsetWidth);
    wrap.scrollLeft = dragStartScroll + ((event.clientX - dragStartX) / maxThumbTravel) * maxScroll;
  });
  ["pointerup", "pointercancel"].forEach(type => {
    thumb.addEventListener(type, () => {
      dragging = false;
      thumb.classList.remove("dragging");
    });
  });

  requestAnimationFrame(() => updateBottomScrollbar(target));
  setTimeout(() => updateBottomScrollbar(target), 100);
}

function updateBottomScrollbar(target) {
  const wrap = target.querySelector(".table-wrap");
  const table = target.querySelector("table");
  const bar = target.querySelector(".table-scrollbar");
  const track = target.querySelector(".table-scrollbar-track");
  const thumb = target.querySelector(".table-scrollbar-thumb");
  if (!wrap || !table || !bar || !track || !thumb) return;

  const maxScroll = table.scrollWidth - wrap.clientWidth;
  bar.style.display = maxScroll > 0 ? "flex" : "none";
  if (maxScroll <= 0) return;

  const trackWidth = track.clientWidth;
  const thumbWidth = Math.max(44, Math.round((wrap.clientWidth / table.scrollWidth) * trackWidth));
  const maxThumbTravel = Math.max(1, trackWidth - thumbWidth);
  const thumbLeft = Math.round((wrap.scrollLeft / maxScroll) * maxThumbTravel);
  thumb.style.width = `${thumbWidth}px`;
  thumb.style.transform = `translateX(${thumbLeft}px)`;
}

function updateAllBottomScrollbars() {
  document.querySelectorAll(".table-wrap").forEach(wrap => {
    const target = wrap.parentElement;
    if (target) updateBottomScrollbar(target);
  });
}

function statusBadge(value) {
  const text = String(value ?? "unknown");
  const cls = /blocked|partial|error|fail|issue|unavailable|missing|stale/i.test(text)
    ? "bad"
    : /^ok$|success|manual update|seeded|complete/i.test(text)
      ? "good"
      : "flat";
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function diagnosticBadge(value) {
  const text = String(value ?? "Unknown");
  const cls = /no local review signal|fix|gap|saturat|draft|inactive|traffic|watchlist|low/i.test(text)
    ? "warn"
    : /leader chase|active foothold|open attack|top opportunity|high opportunity|prime|strong|local review signal/i.test(text)
      ? "good"
      : "flat";
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function trendBadge(value) {
  const text = String(value ?? "Flat");
  const cls = text === "Up" ? "good" : text === "Down" ? "bad" : "flat";
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function renderStatusTable(targetId, rows, columns, limit) {
  const mapped = rows.map(row => ({ ...row, Status: statusBadge(row.Status) }));
  const target = document.getElementById(targetId);
  if (!mapped.length) {
    target.innerHTML = `<div class="empty">No rows available in this snapshot.</div>`;
    return;
  }
  const cols = columns || Object.keys(mapped[0]);
  const header = cols.map(col => `<th class="${wrappedColumns.has(col) ? "wrap" : ""}">${escapeHtml(col)}</th>`).join("");
  const body = mapped.slice(0, limit || mapped.length).map(row => {
    const cells = cols.map(col => {
      const cls = wrappedColumns.has(col) ? "wrap" : "";
      const value = col === "Status"
        ? row[col]
        : companyColumns.has(col)
          ? companyLinkCell(row[col])
          : escapeHtml(fmt(row[col], col));
      return `<td class="${cls}">${value ?? ""}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  target.innerHTML = `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderTrendTable(targetId, rows, columns, limit) {
  const mapped = rows.map(row => ({ ...row, Trend: trendBadge(row.Trend) }));
  const cols = columns || Object.keys(mapped[0] || {});
  const target = document.getElementById(targetId);
  if (!mapped.length) {
    target.innerHTML = `<div class="empty">No rows available in this snapshot.</div>`;
    return;
  }
  const header = cols.map(col => `<th class="${wrappedColumns.has(col) ? "wrap" : ""}">${escapeHtml(col)}</th>`).join("");
  const body = mapped.slice(0, limit || mapped.length).map(row => {
    const cells = cols.map(col => {
      const cls = wrappedColumns.has(col) ? "wrap" : "";
      const value = col === "Trend"
        ? row[col]
        : companyColumns.has(col)
          ? companyLinkCell(row[col])
          : escapeHtml(fmt(row[col], col));
      return `<td class="${cls}">${value ?? ""}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  target.innerHTML = `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderMetrics() {
  const m = dashboard.metrics;
  const tagCorpus = dashboard.listingTagCorpus || {};
  const cards = [
    ["Latest eRank sales date", m.latestDate],
    ["Positive 7D shops", fmt(m.positive7dShops)],
    ["Zero-7D excluded", fmt(m.zero7dExcluded)],
    ["Listing tags captured", fmt(tagCorpus.matchedCurrentListingUrls || tagCorpus.taggedListings || 0, "Listing Count")],
    ["Latest source CSV", m.latestSourceCsv],
    ["Recent successful stages", fmt(m.recentSuccessfulStages)],
    ["Blocked/partial stages", fmt(m.blockedPartialStages)]
  ];
  document.getElementById("metric-grid").innerHTML = cards.map(([label, value]) => metric(label, value)).join("");
}

function listingSearchText(row) {
  if (row.__listingSearchText) return row.__listingSearchText;
  const text = Object.keys(row)
    .filter(key => !key.startsWith("__"))
    .map(key => row[key])
    .join(" ")
    .toLowerCase();
  Object.defineProperty(row, "__listingSearchText", {
    value: text,
    configurable: true,
    writable: true
  });
  return text;
}

function listingsViewIsActive() {
  return document.getElementById("listings")?.classList.contains("active");
}

function reviewListingManifest() {
  return dashboard?.listing?.reviewListingIndex || null;
}

function reviewListingTotal() {
  return Number(reviewListingManifest()?.reviewListingsExported || 0);
}

function reviewListingAssetUrl(file) {
  return `assets/${file}?v=${DATA_ASSET_VERSION}`;
}

function reviewListingDictionaryValue(manifest, column, value) {
  if (value === "" || value === null || value === undefined) return "";
  manifest._dictionaryColumnSet ||= new Set(manifest.dictionaryColumns || []);
  if (!manifest._dictionaryColumnSet.has(column)) return value;
  const values = manifest.dictionaries?.[column] || [];
  return values[Number(value)] ?? "";
}

function fullReviewListingUrl(value, manifest) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith("/listing/")) return `${manifest.urlPrefix || "https://www.etsy.com"}${text}`;
  return text;
}

function listingIdFromUrl(value) {
  const match = String(value || "").match(/\/listing\/(\d+)/i);
  return match ? match[1] : "";
}

function decodeReviewListingRows(payload, chunkIndex, options = {}) {
  const manifest = reviewListingManifest();
  if (!manifest) return [];
  const columns = payload.columns || manifest.rowColumns || [];
  const labels = manifest.columnLabels || {};
  const rows = (payload.rows || []).map((values, rowIndex) => {
    const row = {};
    columns.forEach((column, index) => {
      let value = reviewListingDictionaryValue(manifest, column, values[index]);
      if (column === "p") {
        row["Listing URL"] = fullReviewListingUrl(value, manifest);
        return;
      }
      if (column === "c") {
        row["Product Category"] = value;
        row["Product Substrate Category"] = value;
        return;
      }
      const label = labels[column];
      if (label) row[label] = value;
    });
    const listingId = listingIdFromUrl(row["Listing URL"]) || row["Overall Rank"] || rowIndex;
    row["Weekly Sales Graph"] = "Open graph";
    row["Weekly Cycle Key"] = `review:${chunkIndex}:${rowIndex}:${listingId}`;
    row["Evidence Confidence"] = row["Evidence Confidence"] || "Review-derived estimate";
    row["Review Corpus Latest ISO"] = row["Review Corpus Latest ISO"] || row["Last Review ISO"] || "";
    const enriched = withDailySales(row);
    if (options.trackRows) {
      reviewListingState.rowByCycleKey.set(enriched["Weekly Cycle Key"], enriched);
    }
    return enriched;
  });
  return rows;
}

async function fetchReviewListingRows(chunkIndex, options = {}) {
  const manifest = reviewListingManifest();
  if (!manifest?.rowFiles?.[chunkIndex]) return [];
  if (options.cacheRows && reviewListingState.rowChunks.has(chunkIndex)) {
    return reviewListingState.rowChunks.get(chunkIndex);
  }
  const fetchOptions = options.signal ? { signal: options.signal } : undefined;
  const response = await fetch(reviewListingAssetUrl(manifest.rowFiles[chunkIndex]), fetchOptions);
  if (!response.ok) throw new Error(`Review listing chunk ${chunkIndex} failed to load`);
  const rows = decodeReviewListingRows(await response.json(), chunkIndex, options);
  if (options.cacheRows) {
    reviewListingState.rowChunks.set(chunkIndex, rows);
  }
  return rows;
}

function reviewListingFilterKey(query, production, substrate) {
  return `${query || ""}\n${production || ""}\n${substrate || ""}`;
}

function shouldSearchReviewListings(query, production, substrate) {
  return Boolean(reviewListingManifest() && (production || substrate || query.length >= REVIEW_LISTING_SEARCH_MIN_CHARS));
}

function abortReviewListingSearchRequest() {
  if (!reviewListingState.searchAbortController) return;
  reviewListingState.searchAbortController.abort();
  reviewListingState.searchAbortController = null;
}

function cancelReviewListingSearch() {
  if (!reviewListingState.searchLoading && !reviewListingState.searchKey && !reviewListingState.searchRows.length) return;
  abortReviewListingSearchRequest();
  reviewListingState.searchToken += 1;
  reviewListingState.searchKey = "";
  reviewListingState.searchRows = [];
  reviewListingState.searchMatches = 0;
  reviewListingState.searchScanned = 0;
  reviewListingState.searchComplete = false;
  reviewListingState.searchLoading = false;
  reviewListingState.lastProgressRenderAt = 0;
}

function rowMatchesListingFilters(row, query, production, substrate) {
  if (production && row["Production Tag"] !== production) return false;
  if (substrate && String(row["Product Substrate Category"] || row["Product Category"] || "") !== substrate) return false;
  if (query && !listingSearchText(row).includes(query)) return false;
  return true;
}

function ensureReviewListingPreview() {
  const manifest = reviewListingManifest();
  if (!manifest || reviewListingState.previewLoaded || reviewListingState.previewLoading) return;
  reviewListingState.previewLoading = true;
  (async () => {
    try {
      const chunkCount = Math.min(REVIEW_LISTING_PREVIEW_CHUNKS, manifest.rowFiles?.length || 0);
      const rows = [];
      for (let index = 0; index < chunkCount; index += 1) {
        rows.push(...await fetchReviewListingRows(index, { cacheRows: true, trackRows: true }));
      }
      reviewListingState.previewRows = rows;
      reviewListingState.previewLoaded = true;
    } catch (error) {
      console.warn(error);
    } finally {
      reviewListingState.previewLoading = false;
      if (listingsViewIsActive()) renderListings();
    }
  })();
}

function startReviewListingSearch(query, production, substrate) {
  const manifest = reviewListingManifest();
  if (!manifest) return;
  const key = reviewListingFilterKey(query, production, substrate);
  if (reviewListingState.searchKey === key && (reviewListingState.searchLoading || reviewListingState.searchComplete)) return;
  abortReviewListingSearchRequest();
  const controller = new AbortController();
  const token = reviewListingState.searchToken + 1;
  reviewListingState.searchToken = token;
  reviewListingState.searchAbortController = controller;
  reviewListingState.searchKey = key;
  reviewListingState.searchRows = [];
  reviewListingState.searchMatches = 0;
  reviewListingState.searchScanned = 0;
  reviewListingState.searchComplete = false;
  reviewListingState.searchLoading = true;
  reviewListingState.lastProgressRenderAt = 0;
  (async () => {
    try {
      for (let index = 0; index < (manifest.rowFiles?.length || 0); index += 1) {
        if (reviewListingState.searchToken !== token) return;
        const cached = reviewListingState.rowChunks.has(index);
        const rows = cached
          ? reviewListingState.rowChunks.get(index)
          : await fetchReviewListingRows(index, { cacheRows: false, trackRows: false, signal: controller.signal });
        if (reviewListingState.searchToken !== token) return;
        const visibleRowsBefore = reviewListingState.searchRows.length;
        reviewListingState.searchScanned += rows.length;
        rows.forEach(row => {
          if (!rowMatchesListingFilters(row, query, production, substrate)) return;
          reviewListingState.searchMatches += 1;
          if (reviewListingState.searchRows.length < REVIEW_LISTING_RESULT_LIMIT) {
            reviewListingState.searchRows.push(row);
            reviewListingState.rowByCycleKey.set(row["Weekly Cycle Key"], row);
          }
        });
        const now = Date.now();
        const firstVisibleRows = visibleRowsBefore === 0 && reviewListingState.searchRows.length > 0;
        const shouldRenderProgress = firstVisibleRows || now - reviewListingState.lastProgressRenderAt >= REVIEW_LISTING_PROGRESS_RENDER_MS;
        if (listingsViewIsActive() && shouldRenderProgress) {
          reviewListingState.lastProgressRenderAt = now;
          renderListings();
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      reviewListingState.searchComplete = true;
    } catch (error) {
      if (error?.name !== "AbortError") console.warn(error);
    } finally {
      if (reviewListingState.searchToken === token) {
        if (reviewListingState.searchAbortController === controller) {
          reviewListingState.searchAbortController = null;
        }
        reviewListingState.searchLoading = false;
        if (listingsViewIsActive()) renderListings();
      }
    }
  })();
}

function reviewListingRowsForListings(query, production, substrate) {
  const manifest = reviewListingManifest();
  if (!manifest) return [];
  if (!listingsViewIsActive()) return [];
  if (shouldSearchReviewListings(query, production, substrate)) {
    startReviewListingSearch(query, production, substrate);
    const key = reviewListingFilterKey(query, production, substrate);
    return reviewListingState.searchKey === key ? reviewListingState.searchRows : [];
  }
  cancelReviewListingSearch();
  ensureReviewListingPreview();
  if (!query) return reviewListingState.previewRows;
  return reviewListingState.previewRows.filter(row => rowMatchesListingFilters(row, query, production, substrate));
}

function reviewListingStatusText(query, production, substrate) {
  const manifest = reviewListingManifest();
  if (!manifest) return "";
  const total = fmt(reviewListingTotal(), "Listing Count");
  if (shouldSearchReviewListings(query, production, substrate)) {
    const key = reviewListingFilterKey(query, production, substrate);
    if (reviewListingState.searchKey !== key) return `Review index queued across ${total} listings.`;
    const matches = fmt(reviewListingState.searchMatches, "Listing Count");
    if (reviewListingState.searchComplete) {
      const capped = reviewListingState.searchMatches > reviewListingState.searchRows.length
        ? `; first ${fmt(reviewListingState.searchRows.length, "Listing Count")} loaded`
        : "";
      return `Review index searched ${total} listings; ${matches} matches${capped}.`;
    }
    return `Searching review index: ${fmt(reviewListingState.searchScanned, "Listing Count")} of ${total} scanned, ${matches} matches so far.`;
  }
  if (reviewListingState.previewLoaded) {
    return `Review index preview loaded from ${total} review-sourced listings.`;
  }
  if (!listingsViewIsActive()) {
    return `Review index available with ${total} review-sourced listings.`;
  }
  return `Review index available with ${total} review-sourced listings; loading preview.`;
}

function scheduleRenderListings() {
  window.clearTimeout(listingRenderTimer);
  listingRenderTimer = window.setTimeout(renderListings, 160);
}

function comparisonCategory(row) {
  return String(row["Product Substrate Category"] || row["Product Category"] || "Uncategorized");
}

function getComparisonListingRows() {
  const category = document.getElementById("comparison-category-filter")?.value || "";
  const production = document.getElementById("comparison-production-filter")?.value || "";
  const query = (document.getElementById("comparison-search")?.value || "").trim().toLowerCase();
  let rows = getListingRows();

  if (category) {
    rows = rows.filter(row => comparisonCategory(row) === category);
  }
  if (production) {
    rows = rows.filter(row => row["Production Tag"] === production);
  }
  if (query) {
    rows = rows.filter(row => listingSearchText(row).includes(query));
  }

  return rows;
}

function shopTrendLookup() {
  return new Map((dashboard.comparison.shopTrends || []).map(row => [row.Shop, row]));
}

function summarizeShopTrends(shops, trends) {
  const trendRows = [...shops].map(shop => trends.get(shop)).filter(Boolean);
  const recent = trendRows.reduce((sum, row) => sum + Number(row["Recent Avg Daily Sales"] || 0), 0);
  const previous = trendRows.reduce((sum, row) => sum + Number(row["Prior Avg Daily Sales"] || 0), 0);
  const delta = recent - previous;
  const pct = previous ? (delta / previous) * 100 : null;
  const direction = pct == null || Math.abs(pct) < 5 ? "Flat" : pct > 0 ? "Up" : "Down";
  return {
    trendRows,
    recent,
    previous,
    delta,
    pct,
    direction
  };
}

function buildDynamicCategoryMovement(rows) {
  const trends = shopTrendLookup();
  const byCategory = new Map();
  rows.forEach(row => {
    const category = comparisonCategory(row);
    if (!byCategory.has(category)) {
      byCategory.set(category, { category, rows: [], shops: new Set(), daily: 0, thirty: 0 });
    }
    const group = byCategory.get(category);
    group.rows.push(row);
    if (row.Shop) group.shops.add(row.Shop);
    group.daily += numericCell(row, "Est. Daily Sales");
    group.thirty += numericCell(row, "Est. 30D Sales");
  });

  return [...byCategory.values()].map(group => {
    const summary = summarizeShopTrends(group.shops, trends);
    return {
      "Product Substrate Category": group.category,
      "Trend": summary.direction,
      "Recent Matching-Shop Avg Daily Sales": Number(summary.recent.toFixed(1)),
      "Prior Matching-Shop Avg Daily Sales": Number(summary.previous.toFixed(1)),
      "Delta": Number(summary.delta.toFixed(1)),
      "Delta %": summary.pct == null ? null : Number(summary.pct.toFixed(1)),
      "Matching Listings": group.rows.length,
      "Matching Shops": group.shops.size,
      "Category Est. Daily Sales": Number(group.daily.toFixed(1)),
      "Category Est. 30D Sales": Number(group.thirty.toFixed(1)),
      "Days Used": Math.max(...summary.trendRows.map(row => Number(row["Days Used"] || 0)), 0)
    };
  }).sort((a, b) => Number(b["Category Est. Daily Sales"] || 0) - Number(a["Category Est. Daily Sales"] || 0));
}

function buildDynamicShopComparison(rows) {
  const trends = shopTrendLookup();
  const byShop = new Map();
  rows.forEach(row => {
    const shop = row.Shop || "Unknown shop";
    if (!byShop.has(shop)) {
      byShop.set(shop, { shop, categories: new Set(), daily: 0, thirty: 0, count: 0 });
    }
    const group = byShop.get(shop);
    group.categories.add(comparisonCategory(row));
    group.daily += numericCell(row, "Est. Daily Sales");
    group.thirty += numericCell(row, "Est. 30D Sales");
    group.count += 1;
  });

  return [...byShop.values()].map(group => {
    const trend = trends.get(group.shop) || {};
    return {
      "Shop": group.shop,
      "Trend": trend.Trend || "Flat",
      "Category Est. Daily Sales": Number(group.daily.toFixed(1)),
      "Category Est. 30D Sales": Number(group.thirty.toFixed(1)),
      "Matching Listings": group.count,
      "Matched Product Categories": [...group.categories].sort().slice(0, 8).join(", "),
      "Recent Avg Daily Sales": trend["Recent Avg Daily Sales"] ?? "",
      "Prior Avg Daily Sales": trend["Prior Avg Daily Sales"] ?? "",
      "Delta": trend.Delta ?? "",
      "Delta %": trend["Delta %"] ?? "",
      "Latest Complete Date": trend["Latest Complete Date"] ?? "",
      "Latest Complete Daily Sales": trend["Latest Complete Daily Sales"] ?? "",
      "Days Used": trend["Days Used"] ?? ""
    };
  });
}

function sortComparisonRows(rows) {
  const sort = document.getElementById("comparison-sort")?.value || "";
  const sortMap = {
    "daily-desc": ["Category Est. Daily Sales", "desc"],
    "daily-asc": ["Category Est. Daily Sales", "asc"],
    "thirty-desc": ["Category Est. 30D Sales", "desc"],
    "thirty-asc": ["Category Est. 30D Sales", "asc"]
  };
  const [column, direction] = sortMap[sort] || ["Category Est. Daily Sales", "desc"];
  return rows.slice().sort((a, b) => {
    const delta = numericCell(a, column) - numericCell(b, column);
    const ordered = direction === "asc" ? delta : -delta;
    if (ordered) return ordered;
    return String(a.Shop || "").localeCompare(String(b.Shop || ""));
  });
}

function renderCategoryWorkspace() {
  const allRows = getListingRows();
  const listingRows = getComparisonListingRows();
  const movement = buildDynamicCategoryMovement(listingRows);
  const comparisonRows = sortComparisonRows(buildDynamicShopComparison(listingRows));
  const totalDaily = listingRows.reduce((sum, row) => sum + numericCell(row, "Est. Daily Sales"), 0);
  const shops = new Set(listingRows.map(row => row.Shop).filter(Boolean)).size;
  const up = comparisonRows.filter(row => row.Trend === "Up").length;
  const down = comparisonRows.filter(row => row.Trend === "Down").length;
  const category = document.getElementById("comparison-category-filter")?.value || "";
  const production = document.getElementById("comparison-production-filter")?.value || "";
  const query = (document.getElementById("comparison-search")?.value || "").trim();
  const scope = [
    category || "all product categories",
    production ? `production: ${production}` : "",
    query ? `search: ${query}` : ""
  ].filter(Boolean).join(" · ");

  const cards = [
    ["Matching listings", fmt(listingRows.length, "Listing Count")],
    ["Matching shops", fmt(shops, "Shop Count")],
    ["Category est. daily sales", fmt(totalDaily, "Category Est. Daily Sales")],
    ["Up shops", fmt(up)],
    ["Down shops", fmt(down)]
  ];
  document.getElementById("category-metrics").innerHTML = cards.map(([label, value]) => metric(label, value)).join("");
  document.getElementById("category-query").textContent =
    `Comparing ${scope} across ${fmt(allRows.length, "Listing Count")} available listing rows.`;

  const callout = document.getElementById("category-movement-callout");
  if (!listingRows.length) {
    callout.innerHTML = "No listings match the current comparison filters.";
    document.getElementById("category-shop-chart").innerHTML = `<div class="empty">No matching shops to chart.</div>`;
  } else {
    const focus = movement[0];
    const direction = String(focus.Trend || "Flat").toLowerCase();
    const delta = Math.abs(Number(focus.Delta || 0));
    const pct = focus["Delta %"] == null ? "" : ` (${Math.abs(Number(focus["Delta %"])).toFixed(1)}%)`;
    callout.innerHTML =
      `<strong>${escapeHtml(focus["Product Substrate Category"])}</strong> has ${fmt(focus["Matching Listings"], "Matching Listings")} matching listings across ${fmt(focus["Matching Shops"], "Matching Shops")} shops and is ${escapeHtml(direction)} ${fmt(delta, "Delta")} daily sales${pct} across shops with trend history.`;
    renderBar("category-shop-chart", comparisonRows, "Category Est. Daily Sales", "Shop", 20, "#1f5fbf");
  }

  renderTrendTable("category-comparison", comparisonRows, ["Shop", "Trend", "Category Est. Daily Sales", "Category Est. 30D Sales", "Matching Listings", "Matched Product Categories", "Recent Avg Daily Sales", "Prior Avg Daily Sales", "Delta", "Delta %", "Latest Complete Date", "Latest Complete Daily Sales", "Days Used"], 120);
}

function renderOverallChart() {
  const rows = dashboard.market.overall10DaySales || [];
  Plotly.newPlot("overall-chart", [
    {
      type: "bar",
      x: rows.map(r => r.Date),
      y: rows.map(r => r["Daily Sales"]),
      name: "All-shop daily sales",
      marker: { color: "#1f5fbf" },
      hovertemplate: "%{x}<br>Sales: %{y:,.0f}<extra></extra>"
    },
    {
      type: "scatter",
      mode: "lines+markers+text",
      x: rows.map(r => r.Date),
      y: rows.map(r => r["Daily Change %"]),
      text: rows.map(r => r["Change Label"]),
      textposition: "top center",
      name: "Day-over-day change",
      yaxis: "y2",
      marker: { color: rows.map(r => Number(r["Daily Change"] || 0) >= 0 ? "#16803c" : "#b42318"), size: 9 },
      line: { color: "#172033", width: 2 },
      hovertemplate: "%{x}<br>Change: %{y:+.1f}%<extra></extra>"
    }
  ], {
    margin: { l: 46, r: 52, t: 8, b: 44 },
    yaxis: { title: "Total daily sales" },
    yaxis2: { title: "Daily change %", overlaying: "y", side: "right", ticksuffix: "%" },
    legend: { orientation: "h", y: 1.12 },
    paper_bgcolor: "white",
    plot_bgcolor: "white"
  }, plotConfig);
  renderTable("overall-table", rows, ["Date", "Daily Sales", "Daily Change", "Daily Change %"]);
}

function renderImportChart() {
  const rows = dashboard.market.importAdjustedSales || [];
  Plotly.newPlot("import-chart", [
    {
      type: "bar",
      x: rows.map(r => r["Entered Date"]),
      y: rows.map(r => r["Sales Values Entered"]),
      name: "Sales values entered",
      marker: { color: "#0f766e" },
      customdata: rows.map(r => [r["Sales Dates Covered"], r["Source Files"], r["Shop-Date Rows"]]),
      hovertemplate: "%{x}<br>Entered sales values: %{y:,.0f}<br>Sales dates covered: %{customdata[0]}<br>Sources: %{customdata[1]}<extra></extra>"
    },
    {
      type: "scatter",
      mode: "lines+markers+text",
      x: rows.map(r => r["Entered Date"]),
      y: rows.map(r => r["Entered Change %"]),
      text: rows.map(r => r["Change Label"]),
      textposition: "top center",
      name: "Change vs prior import",
      yaxis: "y2",
      marker: { color: rows.map(r => Number(r["Entered Change"] || 0) >= 0 ? "#16803c" : "#b42318"), size: 9 },
      line: { color: "#172033", width: 2 }
    }
  ], {
    margin: { l: 48, r: 52, t: 8, b: 44 },
    yaxis: { title: "Sales values entered" },
    yaxis2: { title: "Change %", overlaying: "y", side: "right", ticksuffix: "%" },
    legend: { orientation: "h", y: 1.12 },
    paper_bgcolor: "white",
    plot_bgcolor: "white"
  }, plotConfig);
}

function renderLineByGroup(targetId, rows, xKey, yKey, groupKey) {
  const groups = [...new Set(rows.map(r => r[groupKey]).filter(Boolean))];
  const traces = groups.map(group => {
    const groupRows = rows.filter(r => r[groupKey] === group).sort((a, b) => String(a[xKey]).localeCompare(String(b[xKey])));
    return {
      type: "scatter",
      mode: "lines+markers",
      name: group,
      x: groupRows.map(r => r[xKey]),
      y: groupRows.map(r => r[yKey]),
      hovertemplate: `${group}<br>%{x}<br>${yKey}: %{y:,.0f}<extra></extra>`
    };
  });
  Plotly.newPlot(targetId, traces, {
    margin: { l: 48, r: 16, t: 8, b: 44 },
    yaxis: { title: yKey },
    legend: { orientation: "h", y: -0.22 },
    paper_bgcolor: "white",
    plot_bgcolor: "white"
  }, plotConfig);
}

function renderMarketTrend() {
  const rows = dashboard.market.dailyTrend || [];
  Plotly.newPlot("market-trend-chart", [{
    type: "scatter",
    mode: "lines+markers",
    x: rows.map(r => r.Date),
    y: rows.map(r => r["Daily Sales"]),
    line: { color: "#1f5fbf", width: 3 },
    marker: { size: 7 },
    hovertemplate: "%{x}<br>Daily sales: %{y:,.0f}<extra></extra>"
  }], {
    margin: { l: 48, r: 16, t: 8, b: 44 },
    yaxis: { title: "Daily sales" },
    paper_bgcolor: "white",
    plot_bgcolor: "white"
  }, plotConfig);
}

function renderBar(targetId, rows, xKey, yKey, limit = 15, color = "#1f5fbf") {
  const data = rows.slice(0, limit).reverse();
  Plotly.newPlot(targetId, [{
    type: "bar",
    orientation: "h",
    x: data.map(r => r[xKey]),
    y: data.map(r => r[yKey]),
    marker: { color },
    hovertemplate: "%{y}<br>%{x:,.1f}<extra></extra>"
  }], {
    margin: { l: 160, r: 18, t: 8, b: 38 },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
    xaxis: { automargin: true },
    yaxis: { automargin: true }
  }, plotConfig);
}

function getListingRows() {
  const rows = [
    ...(dashboard.listing.topListings || []),
    ...(dashboard.listing.categoryListings || []),
    ...(dashboard.listing.myShopListings || [])
  ];
  const byKey = new Map();
  rows.forEach(row => {
    const key = `${row.Shop || ""}|${row["Listing URL"] || row["Product Title"] || ""}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...row });
      return;
    }
    const merged = { ...existing };
    Object.entries(row).forEach(([column, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (merged[column] === null || merged[column] === undefined || merged[column] === "") {
        merged[column] = value;
      } else if (column === "Category Aliases" && !String(merged[column]).includes(String(value))) {
        merged[column] = `${merged[column]}; ${value}`;
      }
    });
    byKey.set(key, merged);
  });
  return Array.from(byKey.values()).map(row => {
    const normalized = { ...row };
    if (!String(normalized["Product Substrate Category"] || "").trim()) {
      normalized["Product Substrate Category"] = normalized["Product Category"] || "Uncategorized";
    }
    return withDailySales(normalized);
  });
}

function listingCycleMap() {
  return new Map((dashboard.reviewCorpus?.listingCycles || []).map(cycle => [String(cycle.key || ""), cycle]).filter(([key]) => key));
}

function fullListingCycleRows(cycle) {
  if (!cycle) return [];
  const byWeek = new Map((cycle.weeks || []).map(item => [String(item[0]), item]));
  const start = new Date(`${cycle.weekStart}T00:00:00`);
  const end = new Date(`${cycle.weekEnd}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const rows = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    const week = cursor.toISOString().slice(0, 10);
    const point = byWeek.get(week) || [week, 0, 0];
    rows.push(withDailySales({
      "Week Start": week,
      "Review Count": Number(point[1] || 0),
      "Estimated Weekly Sales": Number(point[2] || 0),
      "Sales Per Review Used": cycle.salesPerReview,
      "Trend Source": cycle.source,
      "Trend Confidence": cycle.confidence
    }));
  }
  return rows;
}

function parseReviewListingCycleKey(cycleKey) {
  const match = String(cycleKey || "").match(/^review:(\d+):(\d+):/);
  if (!match) return null;
  return { chunkIndex: Number(match[1]), rowIndex: Number(match[2]) };
}

function reviewListingCycleWeeks(encoded, manifest, row) {
  if (!manifest?.weekStart) return [];
  const counts = new Map(
    String(encoded || "")
      .split(";")
      .filter(Boolean)
      .map(item => {
        const [index, count] = item.split(":");
        return [Number(index), Number(count || 0)];
      })
  );
  const start = new Date(`${manifest.weekStart}T00:00:00Z`);
  const weeksBack = Number(manifest.weeksBack || 52);
  const salesPerReview = numericCell(row, "Sales Per Review Used") || Number(manifest.fallbackSalesPerReview || 0);
  const rows = [];
  for (let index = 0; index < weeksBack; index += 1) {
    const cursor = new Date(start);
    cursor.setUTCDate(start.getUTCDate() + index * 7);
    const reviewCount = counts.get(index) || 0;
    rows.push(withDailySales({
      "Week Start": cursor.toISOString().slice(0, 10),
      "Review Count": reviewCount,
      "Estimated Weekly Sales": roundOne(reviewCount * salesPerReview),
      "Sales Per Review Used": salesPerReview,
      "Trend Source": row["Trend Source"] || "Review listing sidecar",
      "Trend Confidence": row["Cycle Confidence"] || row["Evidence Confidence"] || "Review-derived estimate"
    }));
  }
  return rows;
}

function buyerMomentListingCycleWeeks(row) {
  const manifest = dashboard.buyerMoments?.listingCycleMeta || dashboard.reviewCorpus?.listingCycleMeta || {};
  return reviewListingCycleWeeks(row["Weekly Review Counts"], manifest, row);
}

async function loadReviewListingCycle(cycleKey) {
  const manifest = reviewListingManifest();
  const parsed = parseReviewListingCycleKey(cycleKey);
  if (!manifest || !parsed || !manifest.cycleFiles?.[parsed.chunkIndex]) return null;
  await ensureReviewCycleChunk(parsed.chunkIndex);
  const payload = reviewListingState.cycleChunks.get(parsed.chunkIndex);
  const encoded = payload.rows?.[parsed.rowIndex]?.[0] || "";
  const row = reviewListingState.rowByCycleKey.get(cycleKey) || {};
  return { row, rows: reviewListingCycleWeeks(encoded, manifest, row) };
}

function ensureReviewCycleChunk(chunkIndex) {
  const manifest = reviewListingManifest();
  if (!manifest?.cycleFiles?.[chunkIndex]) return Promise.resolve(null);
  if (reviewListingState.cycleChunks.has(chunkIndex)) {
    return Promise.resolve(reviewListingState.cycleChunks.get(chunkIndex));
  }
  if (reviewListingState.cycleChunkLoading.has(chunkIndex)) {
    return reviewListingState.cycleChunkLoading.get(chunkIndex);
  }
  const promise = fetch(reviewListingAssetUrl(manifest.cycleFiles[chunkIndex]))
    .then(response => {
      if (!response.ok) throw new Error(`Review cycle chunk ${chunkIndex} failed to load`);
      return response.json();
    })
    .then(payload => {
      reviewListingState.cycleChunks.set(chunkIndex, payload);
      return payload;
    })
    .finally(() => {
      reviewListingState.cycleChunkLoading.delete(chunkIndex);
      if (listingsViewIsActive()) renderListings();
    });
  reviewListingState.cycleChunkLoading.set(chunkIndex, promise);
  return promise;
}

function reviewListingWeeksFromLoadedCycle(row) {
  const cycleKey = String(row["Weekly Cycle Key"] || "");
  const parsed = parseReviewListingCycleKey(cycleKey);
  const manifest = reviewListingManifest();
  if (!parsed || !manifest) return { loading: false, weeks: [] };
  const payload = reviewListingState.cycleChunks.get(parsed.chunkIndex);
  if (!payload) {
    ensureReviewCycleChunk(parsed.chunkIndex).catch(error => console.warn(error));
    return { loading: true, weeks: [] };
  }
  const encoded = payload.rows?.[parsed.rowIndex]?.[0] || "";
  return { loading: false, weeks: reviewListingCycleWeeks(encoded, manifest, row) };
}

function renderReviewListingCycle(cycleKey, target, summary) {
  target.innerHTML = `<div class="empty">Loading review-sourced listing cycle...</div>`;
  summary.textContent = "";
  document.getElementById("listing-cycle-table").innerHTML = "";
  loadReviewListingCycle(cycleKey)
    .then(result => {
      if (selectedListingCycleKey !== cycleKey) return;
      if (!result) {
        target.innerHTML = `<div class="empty">No review-sourced listing cycle is available.</div>`;
        return;
      }
      const { row, rows } = result;
      const title = row["Product Title"] || "Review-sourced listing";
      summary.textContent = `${row.Shop || "Unknown shop"} · ${fmt(row["Review Corpus Count"], "Review Corpus Count")} reviews · ${row["Cycle Confidence"] || row["Evidence Confidence"] || "Review-derived estimate"} · ${row["Trend Source"] || ""}`;
      Plotly.newPlot("listing-cycle-chart", [{
        type: "bar",
        name: "Estimated daily sales",
        x: rows.map(item => item["Week Start"]),
        y: rows.map(item => item["Estimated Daily Sales"]),
        customdata: rows.map(item => [item["Estimated Weekly Sales"], item["Review Count"], item["Sales Per Review Used"], item["Trend Confidence"]]),
        marker: { color: "#1f5fbf" },
        hovertemplate: "%{x}<br>Estimated daily sales: %{y:,.1f}<br>Estimated weekly sales: %{customdata[0]:,.1f}<br>Reviews: %{customdata[1]:,.0f}<br>Sales/review: %{customdata[2]:,.2f}<br>%{customdata[3]}<extra></extra>"
      }], {
        title: { text: title, font: { size: 14 } },
        margin: { l: 58, r: 18, t: 38, b: 44 },
        yaxis: { title: "Estimated daily sales" },
        paper_bgcolor: "white",
        plot_bgcolor: "white"
      }, plotConfig);
      renderTable("listing-cycle-table", [...rows].reverse(), ["Week Start", "Estimated Daily Sales", "Estimated Weekly Sales", "Review Count", "Sales Per Review Used", "Trend Confidence", "Trend Source"], 52);
    })
    .catch(error => {
      console.warn(error);
      if (selectedListingCycleKey === cycleKey) {
        target.innerHTML = `<div class="empty">Review-sourced listing cycle failed to load.</div>`;
      }
    });
}

function renderBuyerMomentListingCycle(cycleKey, target, summary) {
  const result = buyerMomentListingCycleRowsCache.get(cycleKey);
  if (!result) {
    target.innerHTML = `<div class="empty">No buyer-moment listing cycle is available.</div>`;
    summary.textContent = "";
    document.getElementById("listing-cycle-table").innerHTML = "";
    return;
  }
  const { row, rows } = result;
  const title = row["Product Title"] || "Buyer moment listing";
  summary.textContent = `${row.Shop || "Unknown shop"} · ${fmt(row["Review Corpus Count"], "Review Corpus Count") || "0"} reviews · ${row["Cycle Confidence"] || "Buyer moment estimate"} · ${row["Trend Source"] || ""}`;
  const hasSignal = hasLocalReviewSignal(row) && rows.some(item => numericCell(item, "Review Count") > 0 || numericCell(item, "Estimated Weekly Sales") > 0);
  if (!hasSignal) {
    target.innerHTML = `<div class="empty">No local review signal yet for this listing.</div>`;
    document.getElementById("listing-cycle-table").innerHTML = "";
    return;
  }
  Plotly.newPlot("listing-cycle-chart", [{
    type: "bar",
    name: "Estimated daily sales",
    x: rows.map(item => item["Week Start"]),
    y: rows.map(item => item["Estimated Daily Sales"]),
    customdata: rows.map(item => [item["Estimated Weekly Sales"], item["Review Count"], item["Sales Per Review Used"], item["Trend Confidence"]]),
    marker: { color: "#0f766e" },
    hovertemplate: "%{x}<br>Estimated daily sales: %{y:,.1f}<br>Estimated weekly sales: %{customdata[0]:,.1f}<br>Reviews: %{customdata[1]:,.0f}<br>Sales/review: %{customdata[2]:,.2f}<br>%{customdata[3]}<extra></extra>"
  }], {
    title: { text: title, font: { size: 14 } },
    margin: { l: 58, r: 18, t: 38, b: 44 },
    yaxis: { title: "Estimated daily sales" },
    paper_bgcolor: "white",
    plot_bgcolor: "white"
  }, plotConfig);
  renderTable("listing-cycle-table", [...rows].reverse(), ["Week Start", "Estimated Daily Sales", "Estimated Weekly Sales", "Review Count", "Sales Per Review Used", "Trend Confidence", "Trend Source"], 52);
}

function renderListingCycle(cycleKey = selectedListingCycleKey) {
  const target = document.getElementById("listing-cycle-chart");
  const summary = document.getElementById("listing-cycle-summary");
  if (!target || !summary) return;
  const cycles = dashboard.reviewCorpus?.listingCycles || [];
  if (!cycleKey && cycles.length) cycleKey = String(cycles[0].key || "");
  selectedListingCycleKey = cycleKey || "";
  if (String(selectedListingCycleKey).startsWith("buyer:")) {
    renderBuyerMomentListingCycle(selectedListingCycleKey, target, summary);
    return;
  }
  if (String(selectedListingCycleKey).startsWith("review:")) {
    renderReviewListingCycle(selectedListingCycleKey, target, summary);
    return;
  }
  const cycle = listingCycleMap().get(selectedListingCycleKey);
  if (!cycle) {
    target.innerHTML = `<div class="empty">No listing sales cycle is selected.</div>`;
    summary.textContent = "";
    document.getElementById("listing-cycle-table").innerHTML = "";
    return;
  }
  const rows = fullListingCycleRows(cycle);
  const title = cycle.title || "Selected listing";
  summary.textContent = `${cycle.shop || "Unknown shop"} · ${fmt(cycle.reviewCount, "Review Corpus Count")} reviews · ${cycle.confidence || "Estimated"} · ${cycle.source || ""}`;
  Plotly.newPlot("listing-cycle-chart", [{
    type: "bar",
    name: "Estimated daily sales",
    x: rows.map(row => row["Week Start"]),
    y: rows.map(row => row["Estimated Daily Sales"]),
    customdata: rows.map(row => [row["Estimated Weekly Sales"], row["Review Count"], row["Sales Per Review Used"], row["Trend Confidence"]]),
    marker: { color: "#1f5fbf" },
    hovertemplate: "%{x}<br>Estimated daily sales: %{y:,.1f}<br>Estimated weekly sales: %{customdata[0]:,.1f}<br>Reviews: %{customdata[1]:,.0f}<br>Sales/review: %{customdata[2]:,.2f}<br>%{customdata[3]}<extra></extra>"
  }], {
    title: { text: title, font: { size: 14 } },
    margin: { l: 58, r: 18, t: 38, b: 44 },
    yaxis: { title: "Estimated daily sales" },
    paper_bgcolor: "white",
    plot_bgcolor: "white"
  }, plotConfig);
  renderTable("listing-cycle-table", [...rows].reverse(), ["Week Start", "Estimated Daily Sales", "Estimated Weekly Sales", "Review Count", "Sales Per Review Used", "Trend Confidence", "Trend Source"], 52);
}

function openListingCycle(cycleKey, options = {}) {
  if (!cycleKey) return;
  selectedListingCycleKey = String(cycleKey);
  if (options.switchView !== false) {
    activateView("listings");
  }
  renderListings();
  if (options.scroll !== false) {
    requestAnimationFrame(() => {
      document.getElementById("listing-cycle-panel")?.scrollIntoView({ block: "start" });
    });
  }
}

const buyerMomentDefinitions = [
  {
    id: "mothers-day",
    label: "Mother's Day",
    windowStart: "04-15",
    windowEnd: "05-25",
    cues: ["mother's day", "mothers day", "mom", "mama", "mommy", "mother", "grandma", "grandmother", "nana", "new mom", "wife from kids"]
  },
  {
    id: "fathers-day",
    label: "Father's Day",
    windowStart: "06-01",
    windowEnd: "06-30",
    cues: ["father's day", "fathers day", "dad", "daddy", "father", "grandpa", "grandfather", "papa", "stepdad", "bonus dad"]
  },
  {
    id: "christmas",
    label: "Christmas / Holiday",
    windowStart: "11-10",
    windowEnd: "12-31",
    cues: ["christmas", "xmas", "holiday gift", "stocking stuffer", "secret santa", "ornament", "santa", "christmas gift"]
  },
  {
    id: "valentines-day",
    label: "Valentine's Day",
    windowStart: "01-20",
    windowEnd: "02-20",
    cues: ["valentine", "valentines", "valentine's day", "galentine", "love gift", "boyfriend gift", "girlfriend gift"]
  },
  {
    id: "graduation",
    label: "Graduation",
    windowStart: "04-15",
    windowEnd: "06-20",
    cues: ["graduation", "graduate", "grad gift", "class of", "senior gift", "college grad", "high school grad"]
  },
  {
    id: "teacher-appreciation",
    label: "Teacher Appreciation",
    windowStart: "04-15",
    windowEnd: "05-20",
    cues: ["teacher appreciation", "teacher gift", "teacher", "principal", "school nurse", "counselor gift", "classroom"]
  },
  {
    id: "back-to-school",
    label: "Back To School",
    windowStart: "07-15",
    windowEnd: "09-10",
    cues: ["back to school", "first day of school", "school year", "classroom decor", "teacher desk", "teacher name sign"]
  },
  {
    id: "wedding",
    label: "Wedding Season",
    windowStart: "04-01",
    windowEnd: "10-31",
    cues: ["wedding", "bride", "groom", "bridal", "bridesmaid", "groomsmen", "maid of honor", "engagement", "newlywed"]
  },
  {
    id: "anniversary",
    label: "Anniversary",
    windowStart: "01-01",
    windowEnd: "12-31",
    cues: ["anniversary", "years together", "couple gift", "husband gift", "wife gift"]
  },
  {
    id: "birthday",
    label: "Birthday",
    windowStart: "01-01",
    windowEnd: "12-31",
    cues: ["birthday", "bday", "birth day", "turning 30", "turning 40", "turning 50", "milestone birthday"]
  },
  {
    id: "housewarming",
    label: "Housewarming / New Home",
    windowStart: "03-01",
    windowEnd: "10-31",
    cues: ["housewarming", "new home", "new homeowner", "homeowner gift", "closing gift", "realtor gift", "real estate closing"]
  },
  {
    id: "new-baby",
    label: "New Baby / New Parent",
    windowStart: "01-01",
    windowEnd: "12-31",
    cues: ["new baby", "baby shower", "new mom", "new dad", "pregnancy", "nursery", "birth announcement", "first mother's day"]
  },
  {
    id: "pet-memorial",
    label: "Pet Memorial",
    windowStart: "01-01",
    windowEnd: "12-31",
    cues: ["pet memorial", "dog memorial", "cat memorial", "pet loss", "rainbow bridge", "memorial gift"]
  },
  {
    id: "sympathy-memorial",
    label: "Sympathy / Memorial",
    windowStart: "01-01",
    windowEnd: "12-31",
    cues: ["sympathy", "memorial", "remembrance", "in memory", "bereavement", "loss of"]
  },
  {
    id: "retirement",
    label: "Retirement",
    windowStart: "01-01",
    windowEnd: "12-31",
    cues: ["retirement", "retiree", "retired", "farewell gift", "going away gift"]
  },
  {
    id: "halloween",
    label: "Halloween",
    windowStart: "09-15",
    windowEnd: "10-31",
    cues: ["halloween", "spooky", "witch", "pumpkin", "trick or treat", "ghost"]
  },
  {
    id: "thanksgiving",
    label: "Thanksgiving / Host Gift",
    windowStart: "10-20",
    windowEnd: "11-30",
    cues: ["thanksgiving", "hostess gift", "host gift", "fall decor", "friendsgiving", "grateful"]
  },
  {
    id: "easter",
    label: "Easter",
    windowStart: "03-01",
    windowEnd: "04-20",
    cues: ["easter", "bunny", "easter basket", "he is risen"]
  },
  {
    id: "nurse-appreciation",
    label: "Nurse Appreciation",
    windowStart: "05-01",
    windowEnd: "05-20",
    cues: ["nurse", "nurse appreciation", "nurses week", "rn gift", "lpn gift", "medical assistant"]
  },
  {
    id: "boss-admin-day",
    label: "Boss / Admin Day",
    windowStart: "04-01",
    windowEnd: "10-20",
    cues: ["boss day", "boss's day", "boss gift", "admin day", "administrative professional", "office manager gift"]
  }
];

function normalizeMomentText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function listingMomentText(row) {
  return normalizeMomentText([
    row["Product Title"],
    row.Tags,
    row["Actual Tags"],
    row["Best Guess Tags"],
    row["Product Category"],
    row["Product Substrate Category"],
    row["Category Aliases"],
    row["Buyer Intent"]
  ].filter(Boolean).join(" "));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cueMatches(text, cue) {
  const clean = normalizeMomentText(cue);
  if (!clean) return false;
  if (clean.includes(" ") || clean.includes("'") || clean.includes("-")) {
    return text.includes(clean);
  }
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(clean)}([^a-z0-9]|$)`).test(text);
}

function matchedBuyerMomentCues(row, definition) {
  const text = listingMomentText(row);
  return definition.cues.filter(cue => cueMatches(text, cue));
}

function buyerMomentDefinition(id) {
  return buyerMomentDefinitions.find(definition => definition.id === id) || null;
}

function normalizeBuyerMomentId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buyerMomentSourceLabel(value) {
  return String(value || "Catalog").trim() || "Catalog";
}

function buyerMomentCalendarFor(row) {
  const sourceId = row.sourceId || row["Moment Source ID"] || row["Moment ID"] || row.id || "";
  const calendar = row.calendar || {};
  const fallback = importMomentWindow(sourceId) || {};
  const windowStart = calendar.startMonthDay || calendar.windowStart || row.windowStart || row["Window Start"] || fallback.windowStart || "01-01";
  const windowEnd = calendar.endMonthDay || calendar.windowEnd || row.windowEnd || row["Window End"] || fallback.windowEnd || "12-31";
  return {
    recurrence: calendar.recurrence || row.recurrence || "annual",
    windowStart,
    windowEnd
  };
}

function buyerMomentKeywordsFor(row) {
  const keywords = row.keywords || row.Keywords || row["Matched Cues"] || "";
  if (Array.isArray(keywords)) return keywords.filter(Boolean).map(String);
  if (typeof keywords === "number") return [];
  return String(keywords || "")
    .split(/[;,|]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function standardBuyerMoment(row, fallback = {}) {
  const sourceId = String(row.sourceId || row["Moment Source ID"] || row["Buyer Moment / Group"] || row["Moment ID"] || row.id || fallback.sourceId || "").trim();
  const id = normalizeBuyerMomentId(row.id || row["Moment ID"] || sourceId || row.label || row["Buyer Moment"]);
  if (!id) return null;
  const calendar = buyerMomentCalendarFor({ ...row, sourceId });
  const timeline = buyerMomentTimelineRange(calendar);
  const label = row.label || row["Buyer Moment"] || importMomentLabel(sourceId || id);
  const parentLabel = row.parentLabel || row["Parent Buyer Moment"] || row.parentBuyerMoment || "";
  const keyword = row.keyword || row.Keyword || "";
  const sourceRun = buyerMomentSourceLabel(row.sourceRun || row["Source Run"] || fallback.sourceRun);
  const selectedRows = numericCell(row.stats || row, "Selected Listing Rows");
  const apiMatches = numericCell(row.stats || row, "API Total Matches Sum");
  const uniqueListings = numericCell(row.stats || row, "Unique Top Listing IDs");
  const uniqueShops = numericCell(row.stats || row, "Unique Top Shop IDs");
  const opportunityScore = numericCell(row, "Buyer Moment Opportunity Score") || numericCell(row.stats || {}, "Buyer Moment Opportunity Score");
  const highOpportunityListings = numericCell(row, "High Opportunity Listings") || numericCell(row.stats || {}, "High Opportunity Listings");
  const localReviewSignalListings = numericCell(row, "Local Review Signal Listings") || numericCell(row.stats || {}, "Local Review Signal Listings");
  return {
    ...row,
    "Moment ID": id,
    "Moment Source ID": sourceId || id,
    "Buyer Moment": label,
    "Parent Buyer Moment": parentLabel,
    "Keyword": keyword,
    "Source Run": sourceRun,
    "Moment Type": row.type || row["Moment Type"] || fallback.type || "",
    "Moment Timeframe": formatDefinitionWindow(calendar),
    "API Total Matches Sum": apiMatches,
    "Selected Listing Rows": selectedRows,
    "Unique Top Listing IDs": uniqueListings,
    "Unique Top Shop IDs": uniqueShops,
    "Matching Listings": selectedRows || uniqueListings || numericCell(row, "Matching Listings"),
    "Buyer Moment Opportunity Score": opportunityScore,
    "Opportunity Band": row["Opportunity Band"] || "",
    "High Opportunity Listings": highOpportunityListings,
    "Local Review Signal Listings": localReviewSignalListings,
    "Top Opportunity Listing": row["Top Opportunity Listing"] || "",
    "Top Opportunity Shop": row["Top Opportunity Shop"] || "",
    "Buyer Moment Tags": row["Buyer Moment Tags"] || "",
    "Matched Cues": buyerMomentKeywordsFor(row).slice(0, 12).join(", "),
    "Timeline Start": timeline.start,
    "Timeline End": timeline.end,
    "Timeline Duration": timeline.end - timeline.start,
    ...timeline,
    _calendar: calendar,
    _keywords: buyerMomentKeywordsFor(row),
    _sourceRow: row
  };
}

function buyerMomentCatalog() {
  if (buyerMomentCatalogCache) return buyerMomentCatalogCache;
  const byId = new Map();
  const add = (row, fallback = {}) => {
    const moment = standardBuyerMoment(row, fallback);
    if (!moment) return;
    const existing = byId.get(moment["Moment ID"]);
    byId.set(moment["Moment ID"], existing ? { ...existing, ...moment } : moment);
  };

  const payloadMoments = dashboard.buyerMoments?.moments || [];
  payloadMoments.forEach(row => add(row));
  if (!payloadMoments.length) {
    rawPreviewRows("buyer_moment_summary").forEach(row => add(row));
  }

  if (!byId.size) {
    buyerMomentDefinitions.forEach(definition => add({
      id: definition.id,
      label: definition.label,
      sourceRun: "Cue Match",
      type: "cue",
      calendar: {
        recurrence: "annual",
        startMonthDay: definition.windowStart,
        endMonthDay: definition.windowEnd
      },
      keywords: definition.cues
    }));
  }

  buyerMomentCatalogCache = [...byId.values()].sort(buyerMomentChronology);
  return buyerMomentCatalogCache;
}

function buyerMomentTopListingRows() {
  if (buyerMomentTopListingRowsCache) return buyerMomentTopListingRowsCache;
  const rows = dashboard.buyerMoments?.listingMatches || rawPreviewRows("buyer_moment_top_listings");
  buyerMomentTopListingRowsCache = (rows || []).map(row => {
    const id = normalizeBuyerMomentId(row.momentId || row["Moment ID"] || row.keyword_group || row["Buyer Moment / Group"] || "");
    const sourceId = row.sourceId || row["Moment Source ID"] || row.keyword_group || row["Buyer Moment / Group"] || id;
    const title = row["Product Title"] || row.title || "";
    const url = row["Listing URL"] || row.url || "";
    const shop = row.Shop || row.shop_name || "";
    const keyword = row.Keyword || row.keyword || "";
    return {
      ...row,
      "Moment ID": id,
      "Moment Source ID": sourceId,
      "Buyer Moment": row["Buyer Moment"] || row.buyerMoment || keyword || importMomentLabel(sourceId),
      "Parent Buyer Moment": row["Parent Buyer Moment"] || row.parentBuyerMoment || importMomentLabel(sourceId),
      "Parent Moment ID": row.parentMomentId || "",
      "Source Run": row.sourceRun || row["Source Run"] || "",
      "Keyword": keyword,
      "API Rank": row.rank || row.keyword_top10_rank || row.api_search_rank || "",
      "API Matches": row.keyword_api_total_matches || row["API Total Matches Sum"] || "",
      "Shop": shop,
      "Shop URL": row.shop_url || "",
      "Shop Sold Count": row.shop_transaction_sold_count || row["Shop Sold Count"] || "",
      "Shop Review Count": row.shop_review_count || row["Shop Review Count"] || "",
      "Shop Avg Rating": row.shop_review_average || row["Shop Avg Rating"] || "",
      "Views": row.views || row.Views || "",
      "Favorites": row.num_favorers || row.Favorites || "",
      "Price": row.price || row.Price || "",
      "Currency": row.currency || row.Currency || "",
      "Personalizable": row.is_personalizable,
      "Customizable": row.is_customizable,
      "Has Variations": row.has_variations,
      "Product Title": title,
      "Listing URL": url,
      "Thumbnail": row.Thumbnail || row.thumbnail || "",
      "Tags": row.tags || row.Tags || "",
      "Materials": row.materials || row.Materials || "",
      "Local Review Rows": row.local_review_rows_total || "",
      "Local 365D Reviews": row.local_review_rows_365 || "",
      "Local 90D Reviews": row.local_review_rows_90 || "",
      "Local Latest Review": row.local_latest_review || "",
      "Weekly Sales Graph": row["Weekly Sales Graph"] || "",
      "Weekly Cycle Key": row["Weekly Cycle Key"] || "",
      "Weekly Review Counts": row["Weekly Review Counts"] || "",
      "Cycle Weeks Covered": row["Cycle Weeks Covered"] || "",
      "Cycle Confidence": row["Cycle Confidence"] || "",
      "Sales Per Review Used": row["Sales Per Review Used"] || "",
      "Trend Source": row["Trend Source"] || "",
      "Review Corpus Count": row["Review Corpus Count"] || "",
      "Review Corpus 90D": row["Review Corpus 90D"] || "",
      "Review Corpus 365D": row["Review Corpus 365D"] || "",
      "Review Corpus Latest ISO": row["Review Corpus Latest ISO"] || row["Last Review ISO"] || row.local_latest_review || "",
      "Buyer Moment Opportunity Score": row["Buyer Moment Opportunity Score"] || "",
      "API Rank Score": row["API Rank Score"] || "",
      "Review Velocity Score": row["Review Velocity Score"] || "",
      "Engagement Score": row["Engagement Score"] || "",
      "Shop Strength Score": row["Shop Strength Score"] || "",
      "Moment Fit Score": row["Moment Fit Score"] || "",
      "Category Fit Score": row["Category Fit Score"] || "",
      "MyMaravia Build Fit": row["MyMaravia Build Fit"] || "",
      "MyMaravia Build Read": row["MyMaravia Build Read"] || "",
      "Build Fit Reason": row["Build Fit Reason"] || "",
      "Opportunity Band": row["Opportunity Band"] || "",
      "Local Review Signal": row["Local Review Signal"] || "",
      "Buyer Moment Tags": row["Buyer Moment Tags"] || "",
      "Product Category": row["Product Category"] || "",
      "Product Substrate Category": row["Product Substrate Category"] || "",
      "Production Tag": row["Production Tag"] || "",
      "Best Guess Tags": row["Best Guess Tags"] || ""
    };
  }).filter(row => row["Moment ID"]);
  return buyerMomentTopListingRowsCache;
}

function buyerMomentListingCounts() {
  const counts = new Map();
  buyerMomentTopListingRows().forEach(row => {
    counts.set(row["Moment ID"], (counts.get(row["Moment ID"] || "") || 0) + 1);
  });
  return counts;
}

function listingLookupByUrl() {
  const byUrl = new Map();
  getListingRows().forEach(row => {
    const url = String(row["Listing URL"] || "").trim();
    if (url && !byUrl.has(url)) byUrl.set(url, row);
  });
  return byUrl;
}

function parseIsoDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDaysIso(value, days) {
  const date = parseIsoDate(value);
  if (!date) return value;
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

function formatDateLabel(value) {
  const date = parseIsoDate(value);
  if (!date) return value || "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function formatMomentWindow(range) {
  if (!range) return "";
  return `${formatDateLabel(range.start)} - ${formatDateLabel(range.end)}`;
}

function monthDayFromDate(date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function listingReferenceDate() {
  const generated = String(dashboard?.meta?.generatedAt || "").slice(0, 10);
  return parseIsoDate(generated) || new Date();
}

function last30ListingTimeframePreset() {
  const reference = listingReferenceDate();
  const start = new Date(Date.UTC(2025, reference.getUTCMonth(), reference.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - 29);
  return {
    label: "Last 30 days",
    start: monthDayFromDate(start),
    end: monthDayFromDate(reference)
  };
}

function listingTimeframePresetDefinition(preset) {
  if (preset === "last-30") return last30ListingTimeframePreset();
  if (preset === LISTING_TIMEFRAME_CUSTOM_ID) {
    return {
      label: "Custom range",
      start: document.getElementById("listing-timeframe-start")?.value || "",
      end: document.getElementById("listing-timeframe-end")?.value || ""
    };
  }
  return LISTING_TIMEFRAME_PRESETS[preset] || null;
}

function isValidMonthDay(value) {
  const match = String(value || "").trim().match(/^(\d{2})-(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const date = new Date(Date.UTC(2025, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function monthDayToIso(monthDay, year) {
  if (!isValidMonthDay(monthDay)) return "";
  return `${year}-${monthDay}`;
}

function selectedListingTimeframeWindow() {
  const preset = selectedListingTimeframePreset || document.getElementById("listing-timeframe-preset")?.value || "";
  if (!preset) return null;
  const definition = listingTimeframePresetDefinition(preset);
  if (!definition || !isValidMonthDay(definition.start) || !isValidMonthDay(definition.end)) return null;
  const targetYear = listingReferenceDate().getUTCFullYear() - 1;
  const endYear = definition.end < definition.start ? targetYear + 1 : targetYear;
  const range = {
    start: monthDayToIso(definition.start, targetYear),
    end: monthDayToIso(definition.end, endYear)
  };
  return {
    ...range,
    label: definition.label,
    display: formatMomentWindow(range)
  };
}

function reviewDateBounds() {
  const meta = dashboard.reviewCorpus?.listingCycleMeta || {};
  const start = meta.weekStart || dashboard.reviewCorpus?.earliestReviewISO || "";
  const end = dashboard.reviewCorpus?.latestReviewISO || meta.weekEnd || "";
  return { start, end };
}

function normalizeDateRange(start, end) {
  const bounds = reviewDateBounds();
  let rangeStart = start || bounds.start;
  let rangeEnd = end || bounds.end;
  if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }
  if (bounds.start && rangeStart < bounds.start) rangeStart = bounds.start;
  if (bounds.end && rangeEnd > bounds.end) rangeEnd = bounds.end;
  return { start: rangeStart, end: rangeEnd };
}

function defaultCustomBuyerMomentRange() {
  const bounds = reviewDateBounds();
  if (!bounds.end) return null;
  const start = bounds.start && addDaysIso(bounds.end, -30) < bounds.start
    ? bounds.start
    : addDaysIso(bounds.end, -30);
  return normalizeDateRange(start, bounds.end);
}

function selectedCustomBuyerMomentRange() {
  return customBuyerMomentRange || defaultCustomBuyerMomentRange();
}

function monthDayLabel(monthDay) {
  const date = parseIsoDate(`2025-${monthDay}`);
  if (!date) return monthDay;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function formatDefinitionWindow(definition) {
  return `${monthDayLabel(definition.windowStart)} - ${monthDayLabel(definition.windowEnd)}`;
}

function buyerMomentWindowForYear(definition, year) {
  const endYear = definition.windowEnd < definition.windowStart ? year + 1 : year;
  return {
    plannedStart: `${year}-${definition.windowStart}`,
    plannedEnd: `${endYear}-${definition.windowEnd}`,
    year
  };
}

function availableBuyerMomentWindows(definition) {
  const meta = dashboard.reviewCorpus?.listingCycleMeta || {};
  const dataStart = meta.weekStart || dashboard.reviewCorpus?.earliestReviewISO || "";
  const dataEnd = dashboard.reviewCorpus?.latestReviewISO || meta.weekEnd || "";
  const startDate = parseIsoDate(dataStart);
  const endDate = parseIsoDate(dataEnd);
  if (!startDate || !endDate) return [];

  const windows = [];
  for (let year = startDate.getUTCFullYear() - 1; year <= endDate.getUTCFullYear() + 1; year += 1) {
    const range = buyerMomentWindowForYear(definition, year);
    if (range.plannedEnd < dataStart || range.plannedStart > dataEnd) continue;
    const start = range.plannedStart < dataStart ? dataStart : range.plannedStart;
    const end = range.plannedEnd > dataEnd ? dataEnd : range.plannedEnd;
    windows.push({
      ...range,
      start,
      end,
      completed: range.plannedEnd <= dataEnd
    });
  }
  return windows;
}

function activeBuyerMomentWindow(definition) {
  const windows = availableBuyerMomentWindows(definition);
  const completed = windows.filter(window => window.completed);
  const candidates = completed.length ? completed : windows;
  return candidates.sort((a, b) => b.end.localeCompare(a.end))[0] || null;
}

function weekOverlapsMomentWindow(weekStart, window) {
  if (!window || !weekStart) return false;
  const weekEnd = addDaysIso(weekStart, 6);
  return weekStart <= window.end && weekEnd >= window.start;
}

function roundOne(value) {
  return Number((value || 0).toFixed(1));
}

function dailyFromWeekly(value) {
  return roundOne(numericCell({ value }, "value") / 7);
}

function withDailySales(row) {
  const next = { ...row };
  if (next["Estimated Weekly Sales"] !== undefined && next["Estimated Weekly Sales"] !== "") {
    next["Estimated Daily Sales"] = dailyFromWeekly(next["Estimated Weekly Sales"]);
  }
  if (next["Recent Weekly Sales"] !== undefined && next["Recent Weekly Sales"] !== "") {
    next["Recent Daily Sales"] = dailyFromWeekly(next["Recent Weekly Sales"]);
  }
  if (next["Prior Weekly Sales"] !== undefined && next["Prior Weekly Sales"] !== "") {
    next["Prior Daily Sales"] = dailyFromWeekly(next["Prior Weekly Sales"]);
  }
  if (next["Peak Weekly Sales"] !== undefined && next["Peak Weekly Sales"] !== "") {
    next["Peak Daily Sales"] = dailyFromWeekly(next["Peak Weekly Sales"]);
  }
  if (next["Moment Avg Weekly Sales"] !== undefined && next["Moment Avg Weekly Sales"] !== "") {
    next["Moment Avg Daily Sales"] = dailyFromWeekly(next["Moment Avg Weekly Sales"]);
  }
  return next;
}

function listingWeeksForTimeframe(row) {
  const cycleKey = String(row["Weekly Cycle Key"] || "");
  const cycle = listingCycleMap().get(cycleKey);
  if (cycle) {
    return { loading: false, source: cycle.source, weeks: fullListingCycleRows(cycle) };
  }
  if (cycleKey.startsWith("review:")) {
    const result = reviewListingWeeksFromLoadedCycle(row);
    return { ...result, source: row["Trend Source"] || "Review listing sidecar" };
  }
  const embedded = row["Weekly Review Counts"] ? buyerMomentListingCycleWeeks(row) : [];
  if (embedded.length) {
    return { loading: false, source: row["Trend Source"] || "Embedded weekly review counts", weeks: embedded };
  }
  return { loading: false, source: "", weeks: [] };
}

function listingTimeframeMetricRow(row, window) {
  if (!window) return row;
  const { loading, source, weeks } = listingWeeksForTimeframe(row);
  const next = {
    ...row,
    "Last Year Timeframe Window": window.display
  };
  if (loading) {
    next["Last Year Timeframe Signal"] = "Loading local review signal";
    return next;
  }
  const matchingWeeks = (weeks || []).filter(week => weekOverlapsMomentWindow(week["Week Start"], window));
  if (!matchingWeeks.length) {
    next["Last Year Timeframe Signal"] = "No local review signal for selected timeframe";
    return next;
  }
  const estimatedSales = matchingWeeks.reduce((sum, week) => sum + numericCell(week, "Estimated Weekly Sales"), 0);
  const reviewCount = matchingWeeks.reduce((sum, week) => sum + numericCell(week, "Review Count"), 0);
  const weeksWithDemand = matchingWeeks.filter(week => numericCell(week, "Estimated Weekly Sales") > 0).length;
  next["Last Year Timeframe Estimated Sales"] = roundOne(estimatedSales);
  next["Last Year Timeframe Avg Daily Sales"] = roundOne(estimatedSales / Math.max(1, matchingWeeks.length * 7));
  next["Last Year Timeframe Review Count"] = reviewCount;
  next["Last Year Timeframe Weeks"] = matchingWeeks.length;
  next["Last Year Timeframe Weeks With Demand"] = weeksWithDemand;
  next["Last Year Timeframe Signal"] = estimatedSales > 0
    ? `${source || "Local review cycle"}`
    : "Local weekly cycle shows no demand";
  return next;
}

function listingRowKey(row) {
  return `${row.Shop || ""}|${row["Listing URL"] || row["Product Title"] || ""}`;
}

function mergeListingValues(base, override) {
  const merged = { ...(base || {}), ...(override || {}) };
  Object.entries(base || {}).forEach(([column, value]) => {
    if (value === null || value === undefined || value === "") return;
    if (merged[column] === null || merged[column] === undefined || merged[column] === "") {
      merged[column] = value;
    }
  });
  return merged;
}

function momentRowsForRange(range, label = "Custom Date Range", timeframe = "") {
  if (!range?.start || !range?.end) return [];
  const cycles = listingCycleMap();
  return getListingRows().map(row => {
    const cycleKey = String(row["Weekly Cycle Key"] || "");
    const cycle = cycles.get(cycleKey);
    const weeks = cycle
      ? fullListingCycleRows(cycle).filter(week => weekOverlapsMomentWindow(week["Week Start"], range))
      : [];
    const estimatedSales = weeks.reduce((sum, week) => sum + numericCell(week, "Estimated Weekly Sales"), 0);
    if (estimatedSales <= 0) return null;
    const reviewCount = weeks.reduce((sum, week) => sum + numericCell(week, "Review Count"), 0);
    const weeksWithDemand = weeks.filter(week => numericCell(week, "Estimated Weekly Sales") > 0).length;
    const peak = weeks.reduce((winner, week) => {
      if (!winner) return week;
      const delta = numericCell(week, "Estimated Weekly Sales") - numericCell(winner, "Estimated Weekly Sales");
      return delta > 0 ? week : winner;
    }, null);
    return withDailySales({
      ...row,
      "Buyer Moment": label,
      "Moment Timeframe": timeframe || formatMomentWindow(range),
      "Moment Window": formatMomentWindow(range),
      "Matched Cues": "",
      "Moment Estimated Sales": roundOne(estimatedSales),
      "Moment Avg Weekly Sales": roundOne(weeks.length ? estimatedSales / weeks.length : 0),
      "Moment Review Count": reviewCount,
      "Moment Weeks": weeks.length,
      "Moment Weeks With Demand": weeksWithDemand,
      "Peak Moment Week": peak?.["Week Start"] || "",
      "Moment Source": cycle?.source || "No listing weekly review cycle matched",
      _momentWeeks: weeks,
      _momentKey: listingRowKey(row)
    });
  }).filter(Boolean);
}

function monthDayParts(monthDay) {
  const [month, day] = String(monthDay || "").split("-").map(value => Number(value));
  return { month, day };
}

function timelineDayIndex(monthDay, endOfDay = false) {
  const { month, day } = monthDayParts(monthDay);
  if (!month || !day) return 0;
  const date = new Date(Date.UTC(2025, month - 1, day));
  if (Number.isNaN(date.getTime())) return 0;
  const yearStart = new Date(Date.UTC(2025, 0, 1));
  const index = Math.floor((date - yearStart) / 86400000);
  return Math.max(0, Math.min(365, index + (endOfDay ? 1 : 0)));
}

function buyerMomentTimelineRange(definition) {
  const start = timelineDayIndex(definition.windowStart);
  let end = timelineDayIndex(definition.windowEnd, true);
  if (end <= start) end = 365;
  const width = Math.max(0, end - start);
  return {
    start,
    end,
    left: roundOne(start / 365 * 100),
    width: roundOne(width / 365 * 100)
  };
}

function buyerMomentChronology(a, b) {
  const startDelta = numericCell(a, "Timeline Start") - numericCell(b, "Timeline Start");
  if (startDelta) return startDelta;
  const durationDelta = numericCell(b, "Timeline Duration") - numericCell(a, "Timeline Duration");
  if (durationDelta) return durationDelta;
  return String(a["Buyer Moment"]).localeCompare(String(b["Buyer Moment"]));
}

function buyerMomentRows(momentId) {
  if (momentId === CUSTOM_BUYER_MOMENT_ID) {
    const range = selectedCustomBuyerMomentRange();
    return momentRowsForRange(range, "Custom Date Range", formatMomentWindow(range));
  }
  if (buyerMomentRowsCache.has(momentId)) return buyerMomentRowsCache.get(momentId);
  const catalogRows = buyerMomentTopListingRows().filter(row => row["Moment ID"] === momentId);
  if (catalogRows.length) {
    const lookup = listingLookupByUrl();
    const summary = buyerMomentSummaries().find(row => row["Moment ID"] === momentId);
    const range = summary?._calendar ? activeBuyerMomentWindow(summary._calendar) : null;
    const cycles = listingCycleMap();
    const rows = catalogRows.map(row => {
      const linked = lookup.get(String(row["Listing URL"] || "").trim()) || {};
      const merged = mergeListingValues(linked, row);
      const cycleKey = String(linked["Weekly Cycle Key"] || "");
      const embeddedCycleKey = String(row["Weekly Cycle Key"] || "");
      const graphCycleKey = cycleKey || embeddedCycleKey;
      const cycle = cycles.get(cycleKey);
      const allWeeks = cycle ? fullListingCycleRows(cycle) : buyerMomentListingCycleWeeks(merged);
      const weeks = range
        ? allWeeks.filter(week => weekOverlapsMomentWindow(week["Week Start"], range))
        : allWeeks;
      const estimatedSales = weeks.reduce((sum, week) => sum + numericCell(week, "Estimated Weekly Sales"), 0);
      const reviewCount = weeks.reduce((sum, week) => sum + numericCell(week, "Review Count"), 0);
      const weeksWithDemand = weeks.filter(week => numericCell(week, "Estimated Weekly Sales") > 0).length;
      const peak = weeks.reduce((winner, week) => {
        if (!winner) return week;
        const delta = numericCell(week, "Estimated Weekly Sales") - numericCell(winner, "Estimated Weekly Sales");
        return delta > 0 ? week : winner;
      }, null);
      const result = withDailySales({
        ...merged,
        "Weekly Sales Graph": graphCycleKey ? "Open graph" : "",
        "Weekly Cycle Key": graphCycleKey,
        "Buyer Moment": summary?.["Buyer Moment"] || row["Buyer Moment"],
        "Moment Timeframe": summary?.["Moment Timeframe"] || "",
        "Moment Window": range ? formatMomentWindow(range) : summary?.["Moment Timeframe"] || "",
        "Moment Estimated Sales": roundOne(estimatedSales),
        "Moment Avg Weekly Sales": roundOne(weeks.length ? estimatedSales / weeks.length : 0),
        "Moment Review Count": reviewCount,
        "Moment Weeks": weeks.length,
        "Moment Weeks With Demand": weeksWithDemand,
        "Peak Moment Week": peak?.["Week Start"] || "",
        "Moment Source": cycle?.source || row["Trend Source"] || row["Source Run"] || "Buyer moment API listing",
        _momentWeeks: weeks,
        _momentKey: listingRowKey(merged)
      });
      if (graphCycleKey && allWeeks.length) {
        buyerMomentListingCycleRowsCache.set(graphCycleKey, { row: result, rows: allWeeks });
      }
      return result;
    });
    buyerMomentRowsCache.set(momentId, rows);
    return rows;
  }
  const definition = buyerMomentDefinition(momentId);
  if (!definition) {
    buyerMomentRowsCache.set(momentId, []);
    return [];
  }
  const window = activeBuyerMomentWindow(definition);
  const cycles = listingCycleMap();
  const rows = getListingRows().map(row => {
    const cues = matchedBuyerMomentCues(row, definition);
    if (!cues.length) return null;
    const cycleKey = String(row["Weekly Cycle Key"] || "");
    const cycle = cycles.get(cycleKey);
    const weeks = cycle && window
      ? fullListingCycleRows(cycle).filter(week => weekOverlapsMomentWindow(week["Week Start"], window))
      : [];
    const estimatedSales = weeks.reduce((sum, week) => sum + numericCell(week, "Estimated Weekly Sales"), 0);
    const reviewCount = weeks.reduce((sum, week) => sum + numericCell(week, "Review Count"), 0);
    const weeksWithDemand = weeks.filter(week => numericCell(week, "Estimated Weekly Sales") > 0).length;
    const peak = weeks.reduce((winner, week) => {
      if (!winner) return week;
      const delta = numericCell(week, "Estimated Weekly Sales") - numericCell(winner, "Estimated Weekly Sales");
      return delta > 0 ? week : winner;
    }, null);
    return withDailySales({
      ...row,
      "Buyer Moment": definition.label,
      "Moment Timeframe": formatDefinitionWindow(definition),
      "Moment Window": formatMomentWindow(window),
      "Matched Cues": cues.slice(0, 8).join(", "),
      "Moment Estimated Sales": roundOne(estimatedSales),
      "Moment Avg Weekly Sales": roundOne(weeks.length ? estimatedSales / weeks.length : 0),
      "Moment Review Count": reviewCount,
      "Moment Weeks": weeks.length,
      "Moment Weeks With Demand": weeksWithDemand,
      "Peak Moment Week": peak?.["Week Start"] || "",
      "Moment Source": cycle?.source || "No listing weekly review cycle matched",
      _momentWeeks: weeks,
      _momentKey: listingRowKey(row)
    });
  }).filter(Boolean);
  buyerMomentRowsCache.set(momentId, rows);
  return rows;
}

function summarizeMomentRows(id, label, timeframe, windowLabel, rows, extra = {}) {
  const observed = rows.filter(row => numericCell(row, "Moment Estimated Sales") > 0);
  const totalSales = rows.reduce((sum, row) => sum + numericCell(row, "Moment Estimated Sales"), 0);
  const reviewCount = rows.reduce((sum, row) => sum + numericCell(row, "Moment Review Count"), 0);
  const top = sortBuyerMomentRows(rows, "velocity-desc")[0] || {};
  return withDailySales({
    "Moment ID": id,
    "Buyer Moment": label,
    "Moment Timeframe": timeframe,
    "Moment Window": windowLabel,
    "Moment Estimated Sales": roundOne(totalSales),
    "Moment Avg Weekly Sales": roundOne(observed.length ? totalSales / Math.max(...observed.map(row => numericCell(row, "Moment Weeks") || 1)) : 0),
    "Moment Review Count": reviewCount,
    "Matching Listings": rows.length,
    "Listings With Velocity": observed.length,
    "Top Shop": top.Shop || "",
    "Top Listing": top["Product Title"] || "",
    ...extra
  });
}

function customBuyerMomentSummary() {
  const range = selectedCustomBuyerMomentRange();
  if (!range) return null;
  const rows = buyerMomentRows(CUSTOM_BUYER_MOMENT_ID);
  return summarizeMomentRows(
    CUSTOM_BUYER_MOMENT_ID,
    "Custom Date Range",
    formatMomentWindow(range),
    formatMomentWindow(range),
    rows,
    { "Matched Cues": "custom date range" }
  );
}

function buyerMomentSummaries() {
  if (buyerMomentSummariesCache) return buyerMomentSummariesCache;
  const counts = buyerMomentListingCounts();
  buyerMomentSummariesCache = buyerMomentCatalog().map(moment => ({
    ...moment,
    "Matching Listings": counts.get(moment["Moment ID"]) || numericCell(moment, "Matching Listings"),
    "Listings With Velocity": 0,
    "Moment Estimated Sales": 0,
    "Moment Avg Weekly Sales": 0,
    "Moment Review Count": 0
  })).sort(buyerMomentChronology);
  return buyerMomentSummariesCache;
}

function sortBuyerMomentRows(rows, forcedSort = null) {
  const sort = forcedSort || document.getElementById("buyer-moment-sort")?.value || "opportunity-desc";
  const sortMap = {
    "opportunity-desc": ["Buyer Moment Opportunity Score", "desc"],
    "velocity-desc": ["Moment Avg Daily Sales", "desc"],
    "sales-desc": ["Moment Estimated Sales", "desc"],
    "reviews-desc": ["Moment Review Count", "desc"],
    "daily-desc": ["Est. Daily Sales", "desc"],
    "thirty-desc": ["Est. 30D Sales", "desc"]
  };
  const [column, direction] = sortMap[sort] || sortMap["velocity-desc"];
  return rows.slice().sort((a, b) => {
    const delta = numericCell(a, column) - numericCell(b, column);
    const ordered = direction === "asc" ? delta : -delta;
    if (ordered) return ordered;
    return numericCell(b, "Buyer Moment Opportunity Score") - numericCell(a, "Buyer Moment Opportunity Score") ||
      numericCell(b, "Moment Estimated Sales") - numericCell(a, "Moment Estimated Sales") ||
      numericCell(a, "Overall Rank") - numericCell(b, "Overall Rank") ||
      numericCell(a, "API Rank") - numericCell(b, "API Rank") ||
      String(a.Shop || "").localeCompare(String(b.Shop || "")) ||
      String(a["Product Title"] || "").localeCompare(String(b["Product Title"] || ""));
  });
}

function selectedBuyerMomentSummary(summaries) {
  if (selectedBuyerMomentId === CUSTOM_BUYER_MOMENT_ID) {
    const customSummary = customBuyerMomentSummary();
    if (customSummary) return customSummary;
  }
  if (!summaries.length) return null;
  if (!selectedBuyerMomentId || !summaries.some(row => row["Moment ID"] === selectedBuyerMomentId)) {
    selectedBuyerMomentId = summaries[0]["Moment ID"];
  }
  return summaries.find(row => row["Moment ID"] === selectedBuyerMomentId) || summaries[0];
}

function activeBuyerMomentFilters() {
  return BUYER_MOMENT_FILTER_IDS
    .filter(([, id]) => document.getElementById(id)?.checked)
    .map(([key]) => key);
}

function buyerMomentTagsFor(row) {
  const tags = new Set(
    String(row["Buyer Moment Tags"] || "")
      .split(";")
      .map(item => item.trim().toLowerCase())
      .filter(Boolean)
  );
  const text = [
    row["Buyer Moment"],
    row["Parent Buyer Moment"],
    row["Moment Source ID"],
    row["Source Run"],
    row.Keyword,
    row["Product Title"],
    row.Tags,
    row["Product Category"],
    row["Product Substrate Category"]
  ].join(" ").toLowerCase();
  if (/christmas|holiday|thanksgiving|halloween|easter|valentine|mother.?s day|father.?s day|graduation|back to school|boss day|admin day|nurses week|new year/.test(text)) {
    tags.add("holiday");
  }
  if (/teacher|office|boss|admin|nurse|employee|coworker|manager|retirement|work|career|business|professional/.test(text)) {
    tags.add("professional / work");
  }
  if (/mom|mother|dad|father|grandma|grandpa|wife|husband|boyfriend|girlfriend|teacher|boss|nurse|friend|employee|coworker|bride|groom/.test(text)) {
    tags.add("recipient");
  }
  if (/baby|wedding|graduation|housewarming|new home|retirement|anniversary|birthday|memorial|sympathy|bereavement/.test(text)) {
    tags.add("life event");
  }
  return tags;
}

function buyerMomentMatchesQuickFilter(row, filter) {
  const tags = buyerMomentTagsFor(row);
  if (filter === "opportunity") {
    return numericCell(row, "Buyer Moment Opportunity Score") >= BUYER_MOMENT_HIGH_OPPORTUNITY_SCORE ||
      numericCell(row, "High Opportunity Listings") > 0;
  }
  if (filter === "holiday") return tags.has("holiday");
  if (filter === "work") return tags.has("professional / work");
  if (filter === "recipient") return tags.has("recipient");
  if (filter === "life") return tags.has("life event");
  if (filter === "local") {
    return hasLocalReviewSignal(row) || numericCell(row, "Local Review Signal Listings") > 0;
  }
  return true;
}

function filteredBuyerMomentSummaries(summaries) {
  const source = document.getElementById("buyer-moment-source-filter")?.value || "";
  const query = (document.getElementById("buyer-moment-calendar-search")?.value || "").trim().toLowerCase();
  const filters = activeBuyerMomentFilters();
  return summaries.filter(row => {
    if (source && row["Source Run"] !== source) return false;
    if (filters.some(filter => !buyerMomentMatchesQuickFilter(row, filter))) return false;
    if (!query) return true;
    return [
      row["Buyer Moment"],
      row["Moment Source ID"],
      row["Source Run"],
      row["Moment Type"],
      row["Matched Cues"]
    ].join(" ").toLowerCase().includes(query);
  });
}

function buyerMomentCategoryRows(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const category = String(row["Product Substrate Category"] || row["Product Category"] || "Uncategorized");
    if (!groups.has(category)) {
      groups.set(category, { category, rows: [], shops: new Set(), sales: 0, reviews: 0, score: 0, maxWeeks: 0 });
    }
    const group = groups.get(category);
    group.rows.push(row);
    if (row.Shop) group.shops.add(row.Shop);
    group.sales += numericCell(row, "Moment Estimated Sales");
    group.reviews += numericCell(row, "Moment Review Count");
    group.score += numericCell(row, "Buyer Moment Opportunity Score");
    group.maxWeeks = Math.max(group.maxWeeks, numericCell(row, "Moment Weeks"));
  });
  return [...groups.values()].map(group => {
    const top = sortBuyerMomentRows(group.rows, "sales-desc")[0] || {};
    return withDailySales({
      "Product Substrate Category": group.category,
      "Moment Estimated Sales": roundOne(group.sales),
      "Moment Avg Weekly Sales": roundOne(group.maxWeeks ? group.sales / group.maxWeeks : 0),
      "Moment Review Count": group.reviews,
      "Avg Opportunity Score": roundOne(group.rows.length ? group.score / group.rows.length : 0),
      "Matching Listings": group.rows.length,
      "Listings With Velocity": group.rows.filter(row => numericCell(row, "Moment Estimated Sales") > 0).length,
      "Shop Count": group.shops.size,
      "Top Shop": top.Shop || "",
      "Top Listing": top["Product Title"] || "",
      "Top Listing Sales": numericCell(top, "Moment Estimated Sales")
    });
  }).sort((a, b) =>
    numericCell(b, "Moment Estimated Sales") - numericCell(a, "Moment Estimated Sales") ||
    numericCell(b, "Matching Listings") - numericCell(a, "Matching Listings") ||
    String(a["Product Substrate Category"]).localeCompare(String(b["Product Substrate Category"]))
  );
}

function buyerMomentBuildFitRank(value) {
  const label = String(value || "Exploratory fit");
  const index = BUYER_MOMENT_BUILD_FIT_ORDER.indexOf(label);
  return index >= 0 ? index : BUYER_MOMENT_BUILD_FIT_ORDER.indexOf("Exploratory fit");
}

function topBuyerMomentRows(rows, limit = 1) {
  return sortBuyerMomentRows(rows, "opportunity-desc").slice(0, limit);
}

function buyerMomentBestBetRows(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const label = row["MyMaravia Build Read"] || "Exploratory fit";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(row);
  });
  return [...groups.entries()]
    .sort((a, b) => buyerMomentBuildFitRank(a[0]) - buyerMomentBuildFitRank(b[0]))
    .flatMap(([label, groupRows]) =>
      topBuyerMomentRows(groupRows, 2).map((row, index) => ({
        ...row,
        "Build Fit Segment": label,
        "Segment Rank": index + 1
      }))
    )
    .sort((a, b) =>
      buyerMomentBuildFitRank(a["Build Fit Segment"]) - buyerMomentBuildFitRank(b["Build Fit Segment"]) ||
      numericCell(b, "Buyer Moment Opportunity Score") - numericCell(a, "Buyer Moment Opportunity Score")
    );
}

function leadingBuildFitRead(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const label = row["MyMaravia Build Read"] || "Exploratory fit";
    if (!groups.has(label)) groups.set(label, { label, rows: [], score: 0, buildFit: 0 });
    const group = groups.get(label);
    group.rows.push(row);
    group.score += numericCell(row, "Buyer Moment Opportunity Score");
    group.buildFit += numericCell(row, "MyMaravia Build Fit");
  });
  return [...groups.values()]
    .map(group => ({
      ...group,
      avgScore: group.rows.length ? group.score / group.rows.length : 0,
      avgBuildFit: group.rows.length ? group.buildFit / group.rows.length : 0,
      top: topBuyerMomentRows(group.rows, 1)[0] || {}
    }))
    .sort((a, b) =>
      buyerMomentBuildFitRank(a.label) - buyerMomentBuildFitRank(b.label) ||
      b.avgBuildFit - a.avgBuildFit ||
      b.avgScore - a.avgScore
    )[0] || null;
}

function buyerMomentSuggestedAngle(selected, rows, categoryRows) {
  const buildRead = leadingBuildFitRead(rows);
  const category = categoryRows[0]?.["Product Substrate Category"] || rows[0]?.["Product Substrate Category"] || "personalized gift";
  const top = buildRead?.top || topBuyerMomentRows(rows, 1)[0] || {};
  const moment = selected?.["Buyer Moment"] || top["Buyer Moment"] || "this buyer moment";
  if (/prime|workplace/i.test(buildRead?.label || "")) {
    return `Build a ${category} test for ${moment}, using the strongest shop/listing angle as the thumbnail and title reference.`;
  }
  if (/strong/i.test(buildRead?.label || "")) {
    return `Test a close-to-current-production ${category} variant before chasing broader gift formats.`;
  }
  if (/low/i.test(buildRead?.label || "")) {
    return `Use this moment as market intelligence first; the current winners lean outside the strongest MyMaravia build lane.`;
  }
  return `Treat ${moment} as an exploratory angle and prioritize the category with the best score plus local review signal.`;
}

function renderBuyerMomentDecisionRead(selected, rows, categoryRows, highOpportunityRows, localSignalRows) {
  const target = document.getElementById("buyer-moment-decision-read");
  if (!target) return;
  if (!rows.length) {
    target.innerHTML = `<div class="empty">No scored listings match the current Buyer Moment filters.</div>`;
    return;
  }
  const top = topBuyerMomentRows(rows, 1)[0] || {};
  const topCategory = categoryRows[0] || {};
  const buildRead = leadingBuildFitRead(rows);
  const score = numericCell(selected, "Buyer Moment Opportunity Score") || numericCell(top, "Buyer Moment Opportunity Score");
  const points = [
    `${fmt(highOpportunityRows.length, "Listing Count")} high-opportunity listings and ${fmt(localSignalRows.length, "Listing Count")} rows with local review signal are visible under the current filters.`,
    topCategory["Product Substrate Category"]
      ? `${topCategory["Product Substrate Category"]} leads the selected view with ${fmt(topCategory["Matching Listings"], "Matching Listings")} listings and ${fmt(topCategory["Avg Opportunity Score"], "Avg Opportunity Score")} average opportunity score.`
      : "",
    buildRead
      ? `${buildRead.label} is the strongest build-fit lane here; top evidence is ${buildRead.top.Shop || "unknown shop"} / ${buildRead.top["Product Title"] || "top listing"}.`
      : "",
    buyerMomentSuggestedAngle(selected, rows, categoryRows)
  ].filter(Boolean);
  target.innerHTML = [
    `<strong>${escapeHtml(selected["Buyer Moment"] || "Selected buyer moment")}: ${escapeHtml(fmt(score, "Buyer Moment Opportunity Score") || "unscored")} opportunity score</strong>`,
    `<ul class="buyer-moment-decision-points">${points.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`
  ].join("");
}

function renderBuyerMomentBestBets(rows) {
  const bets = buyerMomentBestBetRows(rows)
    .filter(row => numericCell(row, "Buyer Moment Opportunity Score") >= BUYER_MOMENT_HIGH_OPPORTUNITY_SCORE || numericCell(row, "MyMaravia Build Fit") >= 70)
    .slice(0, 10);
  renderTable("buyer-moment-best-bets", bets, [
    "Thumbnail", "Build Fit Segment", "Segment Rank", "Buyer Moment Opportunity Score", "Opportunity Band",
    "MyMaravia Build Fit", "Shop", "Product Title", "Product Substrate Category",
    "Moment Avg Daily Sales", "Review Corpus 90D", "Local Review Signal", "Build Fit Reason", "Listing URL"
  ], 10);
}

function layoutBuyerMomentTimeline(summaries) {
  const items = summaries.map(row => ({ ...row })).sort((a, b) =>
    numericCell(a, "Timeline Start") - numericCell(b, "Timeline Start") ||
    numericCell(b, "Timeline Duration") - numericCell(a, "Timeline Duration") ||
    String(a["Buyer Moment"]).localeCompare(String(b["Buyer Moment"]))
  );
  const laneEnds = [];
  items.forEach(item => {
    let lane = laneEnds.findIndex(end => item.start >= end + 2);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    item.lane = lane;
    laneEnds[lane] = item.end;
  });
  return { items, laneCount: laneEnds.length };
}

function renderBuyerMomentTimeline(summaries) {
  const monthTarget = document.getElementById("buyer-moment-months");
  const timelineTarget = document.getElementById("buyer-moment-timeline");
  if (!monthTarget || !timelineTarget) return;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthTarget.innerHTML = months.map(month => `<div>${month}</div>`).join("");
  const { items, laneCount } = layoutBuyerMomentTimeline(summaries);
  const colors = ["#0f766e", "#1f5fbf", "#8a5a00", "#9f1239", "#6d28d9", "#0e7490"];
  timelineTarget.style.height = `${Math.max(1, laneCount) * BUYER_MOMENT_LANE_HEIGHT}px`;
  timelineTarget.innerHTML = items.map((item, index) => {
    const active = item["Moment ID"] === selectedBuyerMomentId ? " active" : "";
    const compact = item.width < 11 ? " compact" : "";
    const color = colors[index % colors.length];
    const style = [
      `left:${item.left}%`,
      `width:${item.width}%`,
      `top:${item.lane * BUYER_MOMENT_LANE_HEIGHT}px`,
      `--moment-color:${color}`
    ].join(";");
    const source = item["Source Run"] ? `${item["Source Run"]}, ` : "";
    const title = `${item["Buyer Moment"]}: ${source}${item["Moment Timeframe"]}, ${fmt(item["Matching Listings"], "Matching Listings")} top listings`;
    return `<button class="buyer-moment-button${active}${compact}" type="button" data-moment-id="${escapeHtml(item["Moment ID"])}" style="${style}" title="${escapeHtml(title)}"><span>${escapeHtml(item["Buyer Moment"])}</span><strong>${escapeHtml(fmt(item["Matching Listings"], "Matching Listings"))}</strong></button>`;
  }).join("");
  timelineTarget.querySelectorAll(".buyer-moment-button").forEach(button => {
    button.addEventListener("click", () => {
      selectedBuyerMomentId = button.dataset.momentId || "";
      renderBuyerMoments();
    });
  });
}

function syncCustomRangeInputs() {
  const startInput = document.getElementById("buyer-moment-range-start");
  const endInput = document.getElementById("buyer-moment-range-end");
  if (!startInput || !endInput) return;
  const bounds = reviewDateBounds();
  [startInput, endInput].forEach(input => {
    input.min = bounds.start || "";
    input.max = bounds.end || "";
  });
  if (startInput.dataset.rangeReady === "true") return;
  const range = selectedCustomBuyerMomentRange();
  if (!range) return;
  if (!startInput.value) startInput.value = range.start;
  if (!endInput.value) endInput.value = range.end;
  startInput.dataset.rangeReady = "true";
  endInput.dataset.rangeReady = "true";
}

function applyCustomRangeFromInputs() {
  const startInput = document.getElementById("buyer-moment-range-start");
  const endInput = document.getElementById("buyer-moment-range-end");
  if (!startInput || !endInput || !startInput.value || !endInput.value) return;
  customBuyerMomentRange = normalizeDateRange(startInput.value, endInput.value);
  startInput.value = customBuyerMomentRange.start;
  endInput.value = customBuyerMomentRange.end;
  selectedBuyerMomentId = CUSTOM_BUYER_MOMENT_ID;
  renderBuyerMoments();
}

function clearCustomRange() {
  customBuyerMomentRange = null;
  selectedBuyerMomentId = "";
  const startInput = document.getElementById("buyer-moment-range-start");
  const endInput = document.getElementById("buyer-moment-range-end");
  if (startInput) startInput.value = "";
  if (endInput) endInput.value = "";
  renderBuyerMoments();
}

function initBuyerMomentFilters() {
  const summaries = buyerMomentSummaries();
  selectedBuyerMomentSummary(summaries);
  syncCustomRangeInputs();

  const sourceSelect = document.getElementById("buyer-moment-source-filter");
  if (sourceSelect && sourceSelect.dataset.ready !== "true") {
    [...new Set(summaries.map(row => row["Source Run"]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .forEach(source => {
        const option = document.createElement("option");
        option.value = source;
        option.textContent = source;
        sourceSelect.appendChild(option);
      });
    sourceSelect.dataset.ready = "true";
  }

  [
    ["buyer-moment-source-filter", "change"],
    ["buyer-moment-calendar-search", "input"],
    ["buyer-moment-sort", "change"],
    ["buyer-moment-search", "input"],
    ...BUYER_MOMENT_FILTER_IDS.map(([, id]) => [id, "change"])
  ].forEach(([id, eventName]) => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener(eventName, renderBuyerMoments);
    element.dataset.bound = "true";
  });

  [
    ["buyer-moment-apply-range", "click", applyCustomRangeFromInputs],
    ["buyer-moment-clear-range", "click", clearCustomRange],
    ["buyer-moment-range-start", "change", applyCustomRangeFromInputs],
    ["buyer-moment-range-end", "change", applyCustomRangeFromInputs]
  ].forEach(([id, eventName, handler]) => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener(eventName, handler);
    element.dataset.bound = "true";
  });
}

function renderBuyerMomentWeekChart(rows) {
  const target = document.getElementById("buyer-moment-week-chart");
  if (!target) return;
  const hasSignal = rows.some(row => hasLocalReviewSignal(row));
  const byWeek = new Map();
  rows.forEach(row => {
    (row._momentWeeks || []).forEach(week => {
      const key = week["Week Start"];
      if (!byWeek.has(key)) {
        byWeek.set(key, { "Week Start": key, "Estimated Weekly Sales": 0, "Review Count": 0, listingKeys: new Set() });
      }
      const item = byWeek.get(key);
      const sales = numericCell(week, "Estimated Weekly Sales");
      item["Estimated Weekly Sales"] += sales;
      item["Review Count"] += numericCell(week, "Review Count");
      if (sales > 0) item.listingKeys.add(row._momentKey);
    });
  });
  const data = [...byWeek.values()].sort((a, b) => String(a["Week Start"]).localeCompare(String(b["Week Start"]))).map(row => withDailySales({
    "Week Start": row["Week Start"],
    "Estimated Weekly Sales": roundOne(row["Estimated Weekly Sales"]),
    "Review Count": row["Review Count"],
    "Matching Listings": row.listingKeys.size
  }));
  const hasWeeklySignal = data.some(row => numericCell(row, "Review Count") > 0 || numericCell(row, "Estimated Weekly Sales") > 0);
  if (!data.length || !hasSignal || !hasWeeklySignal) {
    target.innerHTML = `<div class="empty">No local review signal yet for this buyer moment window.</div>`;
    document.getElementById("buyer-moment-week-table").innerHTML = "";
    return;
  }
  Plotly.newPlot("buyer-moment-week-chart", [{
    type: "bar",
    x: data.map(row => row["Week Start"]),
    y: data.map(row => row["Estimated Daily Sales"]),
    customdata: data.map(row => [row["Estimated Weekly Sales"], row["Review Count"], row["Matching Listings"]]),
    marker: { color: "#0f766e" },
    hovertemplate: "%{x}<br>Estimated daily sales: %{y:,.1f}<br>Estimated weekly sales: %{customdata[0]:,.1f}<br>Reviews: %{customdata[1]:,.0f}<br>Listings with velocity: %{customdata[2]:,.0f}<extra></extra>"
  }], {
    margin: { l: 58, r: 18, t: 8, b: 44 },
    yaxis: { title: "Estimated daily sales" },
    paper_bgcolor: "white",
    plot_bgcolor: "white"
  }, plotConfig);
  renderTable("buyer-moment-week-table", data, ["Week Start", "Estimated Daily Sales", "Estimated Weekly Sales", "Review Count", "Matching Listings"], 12);
}

function renderBuyerMoments() {
  const summaryTarget = document.getElementById("buyer-moment-summary");
  if (!summaryTarget) return;
  const summaries = buyerMomentSummaries();
  const visibleSummaries = filteredBuyerMomentSummaries(summaries);
  const selected = selectedBuyerMomentSummary(visibleSummaries.length ? visibleSummaries : summaries);
  syncCustomRangeInputs();
  renderBuyerMomentTimeline(visibleSummaries);

  if (!selected) {
    summaryTarget.innerHTML = "No buyer moments were detected in this snapshot.";
    document.getElementById("buyer-moment-metrics").innerHTML = "";
    document.getElementById("buyer-moment-count").textContent = "";
    document.getElementById("buyer-moment-rollup-chart").innerHTML = `<div class="empty">No buyer moment rollups available.</div>`;
    document.getElementById("buyer-moment-rollups").innerHTML = "";
    document.getElementById("buyer-moment-decision-read").innerHTML = "";
    document.getElementById("buyer-moment-best-bets").innerHTML = "";
    document.getElementById("buyer-moment-listings").innerHTML = "";
    document.getElementById("buyer-moment-week-chart").innerHTML = "";
    document.getElementById("buyer-moment-week-table").innerHTML = "";
    return;
  }

  let rows = buyerMomentRows(selected["Moment ID"]);
  const activeFilters = activeBuyerMomentFilters();
  const query = (document.getElementById("buyer-moment-search")?.value || "").trim().toLowerCase();
  if (query) {
    rows = rows.filter(row => Object.values(row).join(" ").toLowerCase().includes(query));
  }
  if (activeFilters.length) {
    rows = rows.filter(row => activeFilters.every(filter => buyerMomentMatchesQuickFilter(row, filter)));
  }
  rows = sortBuyerMomentRows(rows);
  const observed = rows.filter(row => numericCell(row, "Moment Estimated Sales") > 0);
  const highOpportunityRows = rows.filter(row => numericCell(row, "Buyer Moment Opportunity Score") >= BUYER_MOMENT_HIGH_OPPORTUNITY_SCORE);
  const localSignalRows = rows.filter(row => hasLocalReviewSignal(row));
  const categoryRows = buyerMomentCategoryRows(rows);
  const totalTopListings = buyerMomentTopListingRows().length;
  const latestReview = lookupSnapshotMetric("Latest review captured_at") || dashboard.reviewCorpus?.latestReviewISO || "";
  const activeSource = document.getElementById("buyer-moment-source-filter")?.value || "";
  document.getElementById("buyer-moment-metrics").innerHTML = [
    metric("Calendar moments", `${fmt(visibleSummaries.length, "Listing Count")} / ${fmt(summaries.length, "Listing Count")}`),
    metric("Selected top listings", fmt(rows.length, "Matching Listings")),
    metric("Catalog top listings", fmt(totalTopListings, "Listing Count")),
    metric("High-opportunity rows", fmt(highOpportunityRows.length, "Listing Count")),
    metric("Local review signal", fmt(localSignalRows.length, "Listing Count")),
    metric("Best-selling categories", fmt(categoryRows.length, "Listing Count")),
    metric("Moment est. sales", fmt(rows.reduce((sum, row) => sum + numericCell(row, "Moment Estimated Sales"), 0), "Moment Estimated Sales")),
    metric("Latest review", latestReview || "Unavailable")
  ].join("");
  document.getElementById("buyer-moment-count").textContent =
    `Showing ${fmt(rows.length, "Matching Listings")} ${selected["Buyer Moment"]} top listings for ${selected["Moment Timeframe"]}${activeSource ? ` · ${activeSource}` : ""}`;
  const scoreText = numericCell(selected, "Buyer Moment Opportunity Score")
    ? ` Top opportunity score: ${fmt(selected["Buyer Moment Opportunity Score"], "Buyer Moment Opportunity Score")}.`
    : "";
  summaryTarget.innerHTML = selected["Moment ID"] === CUSTOM_BUYER_MOMENT_ID
    ? `<strong>Custom Date Range</strong> ranks categories and listings by review-derived daily sales velocity from ${escapeHtml(selected["Moment Window"])}.`
    : `<strong>${escapeHtml(selected["Buyer Moment"])}</strong> spans ${escapeHtml(selected["Moment Timeframe"])}.${escapeHtml(scoreText)} Calendar clicks show the catalog/API top listings first, and review-derived weekly velocity appears when a listing is present in the tracked review cycle.`;

  renderBar("buyer-moment-rollup-chart", categoryRows, "Moment Estimated Sales", "Product Substrate Category", 20, "#0f766e");
  renderTable("buyer-moment-rollups", categoryRows, [
    "Product Substrate Category", "Avg Opportunity Score", "Moment Estimated Sales", "Moment Avg Daily Sales", "Moment Avg Weekly Sales", "Moment Review Count",
    "Matching Listings", "Listings With Velocity", "Shop Count", "Top Shop", "Top Listing", "Top Listing Sales"
  ], 30);
  renderBuyerMomentDecisionRead(selected, rows, categoryRows, highOpportunityRows, localSignalRows);
  renderBuyerMomentBestBets(rows);
  renderBuyerMomentWeekChart(rows);
  renderTable("buyer-moment-listings", rows, [
    "Thumbnail", "Buyer Moment Opportunity Score", "Opportunity Band", "MyMaravia Build Fit", "MyMaravia Build Read",
    "Moment Avg Daily Sales", "Moment Avg Weekly Sales", "Moment Estimated Sales", "Buyer Moment", "Parent Buyer Moment", "Source Run",
    "Keyword", "API Rank", "API Matches", "Moment Timeframe", "Moment Window",
    "Moment Review Count", "Moment Weeks With Demand", "Peak Moment Week", "Weekly Sales Graph",
    "Shop", "Shop Sold Count", "Shop Review Count", "Shop Avg Rating", "Views", "Favorites", "Price",
    "Est. Daily Sales", "Est. 30D Sales", "Product Title", "Tags", "Best Guess Tags", "Materials",
    "Product Category", "Product Substrate Category", "Production Tag", "Buyer Moment Tags", "Build Fit Reason", "Matched Cues",
    "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Local Review Signal", "Local Review Rows",
    "API Rank Score", "Review Velocity Score", "Engagement Score", "Shop Strength Score", "Moment Fit Score", "Category Fit Score",
    "Moment Source", "Listing URL"
  ], 250);
}

function lookupSnapshotMetric(label) {
  const target = String(label).toLowerCase();
  return rawPreviewRows("buyer_moment_snapshot").find(row => String(row.Metric || "").toLowerCase() === target)?.Value || "";
}

const importBuyerMomentWindows = {
  admin_day: ["04-01", "04-30"],
  anniversary: ["01-01", "12-31"],
  back_to_school: ["07-15", "09-10"],
  baby_kids_family_and_coming_of_age: ["01-01", "12-31"],
  birthday: ["01-01", "12-31"],
  boss: ["10-01", "10-20"],
  christmas_holiday: ["11-10", "12-31"],
  dashboard_lane: ["01-01", "12-31"],
  easter: ["03-01", "04-20"],
  fathers_day: ["06-01", "06-30"],
  gift_format_and_shopping_problem: ["01-01", "12-31"],
  graduation: ["04-15", "06-20"],
  halloween: ["09-15", "10-31"],
  home_hosting_decor_and_lifestyle: ["03-01", "12-31"],
  housewarming: ["03-01", "10-31"],
  mothers_day: ["04-15", "05-25"],
  new_baby: ["01-01", "12-31"],
  new_home: ["03-01", "10-31"],
  new_parent: ["01-01", "12-31"],
  pet: ["01-01", "12-31"],
  pet_memorial: ["01-01", "12-31"],
  relationship_recipient_and_identity: ["01-01", "12-31"],
  retirement: ["01-01", "12-31"],
  school_college_sports_and_youth_activity: ["04-15", "09-10"],
  seasonal_holiday: ["01-01", "12-31"],
  support_loss_health_and_life_transition: ["01-01", "12-31"],
  sympathy: ["01-01", "12-31"],
  teacher_appreciation: ["04-15", "05-20"],
  thanksgiving: ["10-20", "11-30"],
  valentines_day: ["01-20", "02-20"],
  wedding_romance_and_couple: ["01-01", "12-31"],
  wedding_season: ["04-01", "10-31"],
  work_career_professional_and_business: ["01-01", "12-31"]
};

const importBuyerMomentLabels = {
  admin_day: "Admin Day",
  back_to_school: "Back To School",
  baby_kids_family_and_coming_of_age: "Baby / Kids / Coming Of Age",
  boss: "Boss",
  christmas_holiday: "Christmas / Holiday",
  dashboard_lane: "Dashboard Lane",
  fathers_day: "Father's Day",
  gift_format_and_shopping_problem: "Gift Format / Shopping Problem",
  home_hosting_decor_and_lifestyle: "Home / Hosting / Decor",
  mothers_day: "Mother's Day",
  new_baby: "New Baby",
  new_home: "New Home",
  new_parent: "New Parent",
  pet_memorial: "Pet Memorial",
  relationship_recipient_and_identity: "Relationship / Recipient / Identity",
  school_college_sports_and_youth_activity: "School / College / Youth Activity",
  seasonal_holiday: "Seasonal / Holiday",
  support_loss_health_and_life_transition: "Support / Loss / Life Transition",
  teacher_appreciation: "Teacher Appreciation",
  valentines_day: "Valentine's Day",
  wedding_romance_and_couple: "Wedding / Romance / Couple",
  wedding_season: "Wedding Season",
  work_career_professional_and_business: "Work / Career / Business"
};

function importMomentLabel(id) {
  if (importBuyerMomentLabels[id]) return importBuyerMomentLabels[id];
  return String(id || "")
    .split("_")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function importMomentWindow(id) {
  const [windowStart, windowEnd] = importBuyerMomentWindows[id] || ["01-01", "12-31"];
  return { windowStart, windowEnd };
}

function buyerMomentImportSummaries() {
  return rawPreviewRows("buyer_moment_summary").map(row => {
    const id = String(row["Buyer Moment / Group"] || "").trim();
    const definition = importMomentWindow(id);
    const timeline = buyerMomentTimelineRange(definition);
    return {
      ...row,
      "Moment ID": id,
      "Buyer Moment": importMomentLabel(id),
      "Moment Timeframe": formatDefinitionWindow(definition),
      "Matching Listings": numericCell(row, "Selected Listing Rows"),
      "Unique Shops": numericCell(row, "Unique Top Shop IDs"),
      "Timeline Start": timeline.start,
      "Timeline End": timeline.end,
      "Timeline Duration": timeline.end - timeline.start,
      ...timeline
    };
  }).filter(row => row["Moment ID"]).sort(buyerMomentChronology);
}

function layoutImportBuyerMomentTimeline(summaries) {
  const items = summaries.map(row => ({ ...row })).sort((a, b) =>
    numericCell(a, "Timeline Start") - numericCell(b, "Timeline Start") ||
    numericCell(b, "Timeline Duration") - numericCell(a, "Timeline Duration") ||
    String(a["Buyer Moment"]).localeCompare(String(b["Buyer Moment"]))
  );
  const laneEnds = [];
  items.forEach(item => {
    let lane = laneEnds.findIndex(end => item.start >= end + 2);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    item.lane = lane;
    laneEnds[lane] = item.end;
  });
  return { items, laneCount: laneEnds.length };
}

function renderBuyerMomentImportTimeline(summaries) {
  const monthTarget = document.getElementById("buyer-moment-import-months");
  const timelineTarget = document.getElementById("buyer-moment-import-timeline");
  if (!monthTarget || !timelineTarget) return;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthTarget.innerHTML = months.map(month => `<div>${month}</div>`).join("");
  const { items, laneCount } = layoutImportBuyerMomentTimeline(summaries);
  const colors = ["#0f766e", "#1f5fbf", "#8a5a00", "#9f1239", "#6d28d9", "#0e7490"];
  timelineTarget.style.height = `${Math.max(1, laneCount) * 38}px`;
  timelineTarget.innerHTML = items.map((item, index) => {
    const active = item["Moment ID"] === selectedImportBuyerMomentId ? " active" : "";
    const compact = item.width < 11 ? " compact" : "";
    const color = colors[index % colors.length];
    const style = [
      `left:${item.left}%`,
      `width:${item.width}%`,
      `top:${item.lane * 38}px`,
      `--moment-color:${color}`
    ].join(";");
    const title = `${item["Buyer Moment"]}: ${item["Moment Timeframe"]}, ${fmt(item["Matching Listings"], "Matching Listings")} API listing rows, ${fmt(item["Unique Shops"], "Shop Count")} shops`;
    return `<button class="buyer-moment-button${active}${compact}" type="button" data-import-moment-id="${escapeHtml(item["Moment ID"])}" style="${style}" title="${escapeHtml(title)}"><span>${escapeHtml(item["Buyer Moment"])}</span><strong>${escapeHtml(fmt(item["Matching Listings"], "Matching Listings"))}</strong></button>`;
  }).join("");
  timelineTarget.querySelectorAll(".buyer-moment-button").forEach(button => {
    button.addEventListener("click", () => {
      selectedImportBuyerMomentId = button.dataset.importMomentId || "";
      renderBuyerMomentImport();
    });
  });
}

function renderBuyerMomentImport() {
  const metricTarget = document.getElementById("buyer-moment-import-metrics");
  const countTarget = document.getElementById("buyer-moment-import-count");
  const summaryTarget = document.getElementById("buyer-moment-import-summary");
  const activeTarget = document.getElementById("buyer-moment-import-active");
  if (!metricTarget || !summaryTarget) return;

  const importSummaries = buyerMomentImportSummaries();
  const summaryRows = rawPreviewRows("buyer_moment_summary");
  const addedRows = rawPreviewRows("buyer_moment_added_shops");
  const shopRows = rawPreviewRows("buyer_moment_shops");
  const listingRows = rawPreviewRows("buyer_moment_top_listings");
  if (!summaryRows.length && !listingRows.length && !shopRows.length) {
    metricTarget.innerHTML = "";
    summaryTarget.innerHTML = `<div class="empty">No API buyer moment import is loaded in this snapshot.</div>`;
    if (countTarget) countTarget.textContent = "";
    return;
  }

  if (!selectedImportBuyerMomentId || !importSummaries.some(row => row["Moment ID"] === selectedImportBuyerMomentId)) {
    selectedImportBuyerMomentId = importSummaries[0]?.["Moment ID"] || "";
  }
  const selected = importSummaries.find(row => row["Moment ID"] === selectedImportBuyerMomentId) || importSummaries[0] || {};
  renderBuyerMomentImportTimeline(importSummaries);

  const selectedRows = summaryRows.reduce((sum, row) => sum + numericCell(row, "Selected Listing Rows"), 0);
  const uniqueListings = summaryRows.reduce((sum, row) => sum + numericCell(row, "Unique Top Listing IDs"), 0);
  const uniqueShops = summaryRows.reduce((sum, row) => sum + numericCell(row, "Unique Top Shop IDs"), 0);
  const latestReview = lookupSnapshotMetric("Latest review captured_at");
  const totalReviews = lookupSnapshotMetric("Live browser review rows");
  const shopsAdded = numericCell({ value: lookupSnapshotMetric("Gift moment shops added to queue") }, "value") +
    numericCell({ value: lookupSnapshotMetric("Micro moment shops added to queue") }, "value");
  metricTarget.innerHTML = [
    metric("Buyer moment groups", fmt(summaryRows.length, "Listing Count")),
    metric("API listing rows", fmt(selectedRows || listingRows.length, "Listing Count")),
    metric("Unique shops found", fmt(uniqueShops || shopRows.length, "Shop Count")),
    metric("Added to review queue", fmt(shopsAdded || addedRows.length, "Shop Count")),
    metric("Review rows synced", fmt(totalReviews || dashboard.reviewStats?.totalReviews || 0, "Review Count")),
    metric("Latest review capture", latestReview || dashboard.reviewStats?.latestCapture || "")
  ].join("");

  if (countTarget) {
    countTarget.textContent = `Loaded ${fmt(summaryRows.length, "Listing Count")} buyer-moment groups, ${fmt(selectedRows || listingRows.length, "Listing Count")} selected API listing rows, and ${fmt(shopsAdded || addedRows.length, "Shop Count")} newly queued shops.`;
  }
  if (activeTarget) {
    activeTarget.innerHTML = `<strong>${escapeHtml(selected["Buyer Moment"] || "Buyer moment")}</strong> shows ${escapeHtml(fmt(selected["Matching Listings"], "Matching Listings"))} selected API listing rows, ${escapeHtml(fmt(selected["Unique Shops"], "Shop Count"))} unique shops, and ${escapeHtml(selected["Moment Timeframe"] || "year-round")} timing in the market map.`;
  }

  const summaryColumns = [
    "Source Run", "Buyer Moment / Group", "Keywords", "API Total Matches Sum",
    "Selected Listing Rows", "Unique Top Listing IDs", "Unique Top Shop IDs"
  ];
  const activeListingRows = listingRows.filter(row => row.keyword_group === selectedImportBuyerMomentId);
  const activeAddedRows = addedRows.filter(row =>
    String(row.matched_moments || "").split(";").map(value => value.trim()).includes(selectedImportBuyerMomentId)
  );
  summaryTarget.innerHTML = `
    <div class="grid two">
      <section>
        <h3>Moment Group Summary</h3>
        <div id="buyer-moment-import-summary-table"></div>
      </section>
      <section>
        <h3>New Shops Added To Queue</h3>
        <div id="buyer-moment-import-added-table"></div>
      </section>
    </div>
    <section>
      <h3>Top API Listings Preview</h3>
      <div id="buyer-moment-import-listing-table"></div>
    </section>
  `;
  renderTable("buyer-moment-import-summary-table", summaryRows, summaryColumns, 40);
  renderTable("buyer-moment-import-added-table", activeAddedRows.length ? activeAddedRows : addedRows, ["Source Run", "shop_name", "transaction_sold_count", "review_count", "indexed_state", "queue_status", "matched_moments", "matched_keywords"], 40);
  renderTable("buyer-moment-import-listing-table", activeListingRows.length ? activeListingRows : listingRows, ["Source Run", "keyword_group", "keyword", "shop_name", "shop_transaction_sold_count", "shop_review_count", "title", "url"], 60);
}

function numericCell(row, column) {
  const value = row[column];
  if (typeof value === "number") return value;
  const parsed = Number(String(value ?? "").replace(/[$,%]/g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function percentShare(value, total) {
  const numerator = Number(value || 0);
  const denominator = Number(total || 0);
  if (!denominator || denominator <= 0) return null;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function lookupKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function listingLookupKeys(row) {
  return [
    row["Listing ID"],
    row["Listing URL"],
    row["Product Title"],
    row["My Listing"],
  ].map(lookupKey).filter(Boolean);
}

function buildListingLookup(rows) {
  const lookup = new Map();
  (rows || []).forEach(row => {
    listingLookupKeys(row).forEach(key => {
      if (!lookup.has(key)) lookup.set(key, row);
    });
  });
  return lookup;
}

function findMatchingListing(row, lookup) {
  return listingLookupKeys(row).map(key => lookup.get(key)).find(Boolean) || {};
}

function buildBattlePlanRows(rows, myListings) {
  const lookup = buildListingLookup(myListings);
  return (rows || []).map(row => {
    const listing = findMatchingListing(row, lookup);
    const myDaily = numericCell(row, "Est. Daily Sales");
    const marketDaily = numericCell(row, "Market Daily Sales");
    const competitorDaily = numericCell(row, "Top Competitor Daily Sales");
    const totalCategoryDaily = marketDaily + myDaily;
    const myShare = row["My Market Share %"] ?? row["Market Share %"] ?? percentShare(myDaily, totalCategoryDaily);
    const competitorShare = row["Competitor Market Share %"] ?? row["Top Competitor Market Share %"] ?? percentShare(competitorDaily, totalCategoryDaily);
    return {
      ...row,
      "Target Category": row["Product Category"] || listing["Product Category"],
      "My Thumbnail": row["Thumbnail"] || listing["Thumbnail"],
      "My Listing": row["Product Title"] || listing["Product Title"],
      "My Actual Tags": row["Actual Tags"] || listing["Actual Tags"] || row["Tags"] || listing["Tags"] || row["Best Guess Tags"] || listing["Best Guess Tags"] || "",
      "My Daily Sales": row["Est. Daily Sales"] ?? listing["Est. Daily Sales"],
      "My 30D Sales": row["Est. 30D Sales"] ?? listing["Est. 30D Sales"],
      "My Recent 30D Sales": row["Recent 30D Sales"] ?? listing["Recent 30D Sales"],
      "My Market Share %": myShare,
      "Competitor Thumbnail": row["Top Competitor Thumbnail"],
      "Competing Listing": row["Top Competitor"],
      "Competing Shop": row["Top Competitor Shop"],
      "Competing Tags": row["Top Competitor Tags"],
      "Competing Daily Sales": row["Top Competitor Daily Sales"],
      "Competing 30D Sales": row["Top Competitor 30D Sales"],
      "Competitor Market Share %": competitorShare,
      "My Listing URL": row["Listing URL"] || listing["Listing URL"],
      "Competitor Listing URL": row["Top Competitor Listing URL"],
    };
  });
}

function marketSegmentCategories() {
  return (dashboard.myMaravia?.categories || [])
    .map(row => row["Product Category"])
    .filter(Boolean)
    .sort((a, b) => {
      const rowA = marketSegmentCategoryRow(a);
      const rowB = marketSegmentCategoryRow(b);
      const openA = numericCell(rowA, "Needs Build") > 0 ? 1 : 0;
      const openB = numericCell(rowB, "Needs Build") > 0 ? 1 : 0;
      return openB - openA ||
        numericCell(rowB, "Top Open Daily Sales") - numericCell(rowA, "Top Open Daily Sales") ||
        numericCell(rowB, "Needs Build") - numericCell(rowA, "Needs Build") ||
        numericCell(rowB, "Market Daily Sales") - numericCell(rowA, "Market Daily Sales") ||
        String(a).localeCompare(String(b));
    });
}

function marketSegmentCategoryRow(segment) {
  return (dashboard.myMaravia?.categories || []).find(row => row["Product Category"] === segment) || {};
}

function activeMarketSegment() {
  const categories = marketSegmentCategories();
  if (!categories.length) return "";
  if (!selectedMarketSegment || !categories.includes(selectedMarketSegment)) {
    selectedMarketSegment = categories[0];
  }
  return selectedMarketSegment;
}

function marketSegmentQueue(segment) {
  return (dashboard.myMaravia?.longTailQueue || [])
    .filter(row => row["Product Category"] === segment);
}

function marketSegmentMyListings(segment) {
  return (dashboard.myMaravia?.myListings || [])
    .filter(row => row["Product Category"] === segment);
}

function marketSegmentTotalDaily(queue) {
  return queue.reduce((sum, row) => sum + numericCell(row, "Market Daily Sales"), 0);
}

function marketControlReadForListing(row) {
  const state = String(row.State || "").toLowerCase();
  const daily = numericCell(row, "Est. Daily Sales");
  if (state && state !== "active") return "Draft / inactive: decide whether to activate, rewrite, or kill";
  if (daily >= 4) return "Working: scale traffic and protect tags";
  if (daily > 0) return "Weak active: improve title, image, or offer";
  return "Not moving: fix positioning or pause";
}

function marketControlReadForCompetitor(row, rank) {
  const daily = numericCell(row, "Market Daily Sales");
  if (rank === 1) return "Leader: teardown image, title, tags, and personalization promise";
  if (daily >= 5) return "Strong: copy the useful buyer-language pattern";
  if (daily >= 1) return "Small but relevant: keep as long-tail proof";
  return "Tiny signal: watch only";
}

function marketSegmentCompetitorRows(queue, totalDaily) {
  const sort = document.getElementById("market-segment-sort")?.value || "daily-desc";
  const rows = queue.map(row => ({ ...row }));
  rows.sort((a, b) => {
    if (sort === "shop-asc") {
      return String(a["Market Shop"] || "").localeCompare(String(b["Market Shop"] || "")) ||
        numericCell(b, "Market Daily Sales") - numericCell(a, "Market Daily Sales");
    }
    return numericCell(b, "Market Daily Sales") - numericCell(a, "Market Daily Sales");
  });
  return rows.map((row, index) => ({
    ...row,
    "Rank": index + 1,
    "Segment Share %": percentShare(row["Market Daily Sales"], totalDaily),
    "Market Control Read": marketControlReadForCompetitor(row, index + 1)
  }));
}

function marketSegmentShopShareRows(queue, totalDaily) {
  const groups = new Map();
  queue.forEach(row => {
    const shop = row["Market Shop"] || "Unknown";
    if (!groups.has(shop)) {
      groups.set(shop, {
        "Shop": shop,
        "Segment Daily Sales": 0,
        "Segment 30D Sales": 0,
        "Market Listings": 0,
        best: null
      });
    }
    const group = groups.get(shop);
    group["Segment Daily Sales"] += numericCell(row, "Market Daily Sales");
    group["Segment 30D Sales"] += numericCell(row, "Market 30D Sales");
    group["Market Listings"] += 1;
    if (!group.best || numericCell(row, "Market Daily Sales") > numericCell(group.best, "Market Daily Sales")) {
      group.best = row;
    }
  });
  return [...groups.values()]
    .map(group => ({
      "Shop": group.Shop,
      "Segment Daily Sales": Number(group["Segment Daily Sales"].toFixed(2)),
      "Segment 30D Sales": Math.round(group["Segment 30D Sales"]),
      "Segment Share %": percentShare(group["Segment Daily Sales"], totalDaily),
      "Market Listings": group["Market Listings"],
      "Best Listing Daily": Number(numericCell(group.best, "Market Daily Sales").toFixed(2)),
      "Best Listing": group.best?.["Market Long Tail"] || "",
      "Market Listing URL": group.best?.["Market Listing URL"] || "",
      "Market Control Read": group["Segment Daily Sales"] >= 5 ? "Direct competitor" : "Long-tail / niche signal"
    }))
    .sort((a, b) => numericCell(b, "Segment Daily Sales") - numericCell(a, "Segment Daily Sales"));
}

function marketSegmentMyListingRows(segment) {
  return marketSegmentMyListings(segment)
    .map(row => ({ ...row, "Market Control Read": marketControlReadForListing(row) }))
    .sort((a, b) =>
      String(a.State || "").localeCompare(String(b.State || "")) ||
      numericCell(b, "Est. Daily Sales") - numericCell(a, "Est. Daily Sales")
    );
}

function marketSegmentCoverageRows(queue, totalDaily) {
  const groups = new Map();
  queue.forEach(row => {
    const listing = row["Matching MyMaravia Listing"] || "Unmatched market row";
    if (!groups.has(listing)) {
      groups.set(listing, {
        "Matching MyMaravia Listing": listing,
        "Covered Competitor Daily": 0,
        "Covered 30D": 0,
        "Competitor Rows Covered": 0,
        top: null,
        tokens: new Set()
      });
    }
    const group = groups.get(listing);
    group["Covered Competitor Daily"] += numericCell(row, "Market Daily Sales");
    group["Covered 30D"] += numericCell(row, "Market 30D Sales");
    group["Competitor Rows Covered"] += 1;
    if (!group.top || numericCell(row, "Market Daily Sales") > numericCell(group.top, "Market Daily Sales")) {
      group.top = row;
    }
    String(row["Match Tokens"] || "").split(",").map(token => token.trim()).filter(Boolean).forEach(token => group.tokens.add(token));
  });
  return [...groups.values()]
    .map(group => ({
      "Matching MyMaravia Listing": group["Matching MyMaravia Listing"],
      "Covered Competitor Daily": Number(group["Covered Competitor Daily"].toFixed(2)),
      "Covered 30D": Math.round(group["Covered 30D"]),
      "Covered Share %": percentShare(group["Covered Competitor Daily"], totalDaily),
      "Competitor Rows Covered": group["Competitor Rows Covered"],
      "Top Competitor Row": group.top?.["Market Long Tail"] || "",
      "Repeated Match Cues": [...group.tokens].sort().join(", "),
      "Market Control Read": group["Covered Competitor Daily"] >= 20 ? "Protect and scale" : group["Covered Competitor Daily"] >= 5 ? "Fix / improve" : "Small coverage lane"
    }))
    .sort((a, b) => numericCell(b, "Covered Competitor Daily") - numericCell(a, "Covered Competitor Daily"));
}

function marketSegmentCueRows(segment, categoryRow, myListingRows, queue, coverageRows) {
  const tokenCounts = new Map();
  queue.forEach(row => {
    String(row["Match Tokens"] || "").split(",").map(token => token.trim()).filter(Boolean).forEach(token => {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    });
  });
  const cues = [...tokenCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([token]) => token)
    .join(", ");
  const topQueue = queue.slice().sort((a, b) => numericCell(b, "Market Daily Sales") - numericCell(a, "Market Daily Sales"))[0] || {};
  const working = myListingRows.filter(row => numericCell(row, "Est. Daily Sales") >= 4);
  const weak = myListingRows.filter(row => String(row.State || "").toLowerCase() === "active" && numericCell(row, "Est. Daily Sales") < 1);
  const drafts = myListingRows.filter(row => String(row.State || "").toLowerCase() !== "active");
  const needsBuild = queue.filter(row => row.Status === "Needs build");
  return [
    {
      "Cue / Action": "Segment verdict",
      "Evidence": `${segment}: ${fmt(categoryRow["My Market Share %"], "My Market Share %")} share, ${fmt(categoryRow["Coverage %"], "Coverage %")} coverage, ${fmt(categoryRow["Leader Gap Daily"], "Leader Gap Daily")} leader gap.`,
      "Next Edit": needsBuild.length ? "Build the highest-sales uncovered market rows first." : "Treat this as an optimization lane: improve weak listings before adding more.",
      "Market Control Read": categoryRow["Market State"] || ""
    },
    {
      "Cue / Action": "Top competitor teardown",
      "Evidence": topQueue["Market Long Tail"] ? `${topQueue["Market Shop"]}: ${topQueue["Market Long Tail"]}` : "No competitor rows in this segment.",
      "Next Edit": "Compare first image, title promise, personalization fields, tags, pricing, and delivery promise.",
      "Market Control Read": "Leader"
    },
    {
      "Cue / Action": "Winner language",
      "Evidence": cues || "No repeated match cues found.",
      "Next Edit": "Use the repeated buyer-language cues in title, tags, and first image text when they fit the product.",
      "Market Control Read": "Copy cues"
    },
    {
      "Cue / Action": "Scale now",
      "Evidence": working[0]?.["Product Title"] || "No strong active MyMaravia listing detected.",
      "Next Edit": working.length ? "Protect the working title/tag cluster and test traffic or image improvements carefully." : "Find or create a listing that can own the strongest competitor cue.",
      "Market Control Read": working.length ? "Working" : "No winner yet"
    },
    {
      "Cue / Action": "Fix now",
      "Evidence": weak[0]?.["Product Title"] || coverageRows.find(row => /fix/i.test(row["Market Control Read"]))?.["Matching MyMaravia Listing"] || "No obvious weak active listing detected.",
      "Next Edit": "Rewrite around the strongest matching competitor promise, then watch views, favorites, and 7-day sales.",
      "Market Control Read": weak.length ? "Fix" : "Watch"
    },
    {
      "Cue / Action": "Draft decision",
      "Evidence": drafts.length ? `${fmt(drafts.length, "Listing Count")} draft/inactive listings in this segment.` : "No drafts in this segment.",
      "Next Edit": drafts.length ? "Activate only drafts that expose a new buyer/recipient/material angle." : "No draft cleanup needed.",
      "Market Control Read": drafts.length ? "Decide" : "Clean"
    }
  ];
}

function renderMarketControl() {
  const metricTarget = document.getElementById("market-control-metrics");
  if (!metricTarget) return;
  const segment = activeMarketSegment();
  const categoryRow = marketSegmentCategoryRow(segment);
  const queue = marketSegmentQueue(segment);
  const totalDaily = marketSegmentTotalDaily(queue);
  const query = (document.getElementById("market-segment-search")?.value || "").trim().toLowerCase();
  let competitorRows = marketSegmentCompetitorRows(queue, totalDaily);
  if (query) competitorRows = competitorRows.filter(row => Object.values(row).join(" ").toLowerCase().includes(query));
  const shopRows = marketSegmentShopShareRows(queue, totalDaily);
  const myListingRows = marketSegmentMyListingRows(segment);
  const coverageRows = marketSegmentCoverageRows(queue, totalDaily);
  const actionRows = marketSegmentCueRows(segment, categoryRow, myListingRows, queue, coverageRows);

  metricTarget.innerHTML = [
    ["Segment", segment || "Unavailable"],
    ["Market daily sales", fmt(categoryRow["Market Daily Sales"], "Market Daily Sales") || fmt(totalDaily, "Market Daily Sales") || "0"],
    ["My daily sales", fmt(categoryRow["My Category Daily Sales"], "My Category Daily Sales") || "0"],
    ["My market share", fmt(categoryRow["My Market Share %"], "My Market Share %") || "0%"],
    ["Leader gap", fmt(categoryRow["Leader Gap Daily"], "Leader Gap Daily") || "0"],
    ["Coverage", fmt(categoryRow["Coverage %"], "Coverage %") || "0%"]
  ].map(([label, value]) => metric(label, value)).join("");

  const count = document.getElementById("market-control-count");
  if (count) {
    count.textContent = `Showing ${fmt(competitorRows.length, "Listing Count")} of ${fmt(queue.length, "Listing Count")} competitor rows for ${segment}.`;
  }
  document.getElementById("market-control-summary").innerHTML =
    `<strong>${escapeHtml(segment || "Selected segment")}</strong> has ${fmt(categoryRow["Market Daily Sales"] ?? totalDaily, "Market Daily Sales")} estimated market daily sales, ${fmt(categoryRow["My Category Daily Sales"], "My Category Daily Sales") || "0"} MyMaravia daily sales, and ${fmt(categoryRow["Coverage %"], "Coverage %") || "0%"} coverage. ${numericCell(categoryRow, "Needs Build") > 0 ? "Build gaps remain; start with the highest market daily sales rows." : "Coverage is full by the current heuristic, so the next move is optimization: improve weak active listings and copy useful winner cues."}`;

  if (shopRows.length) {
    const chartRows = shopRows.slice(0, 10).reverse();
    Plotly.newPlot("market-control-shop-chart", [{
      type: "bar",
      orientation: "h",
      x: chartRows.map(row => row["Segment Daily Sales"]),
      y: chartRows.map(row => row.Shop),
      marker: { color: "#0f766e" },
      hovertemplate: "%{y}<br>Segment daily sales: %{x:,.1f}<extra></extra>"
    }], {
      margin: { l: 150, r: 16, t: 8, b: 44 },
      xaxis: { title: "Segment daily sales" },
      paper_bgcolor: "white",
      plot_bgcolor: "white"
    }, plotConfig);
  } else {
    document.getElementById("market-control-shop-chart").innerHTML = `<div class="empty">No competitor rows are available for this segment.</div>`;
  }

  renderTable("market-control-shop-share", shopRows, [
    "Shop", "Segment Daily Sales", "Segment 30D Sales", "Segment Share %",
    "Market Listings", "Best Listing Daily", "Best Listing", "Market Listing URL", "Market Control Read"
  ], 30);
  renderTable("market-control-competitor-listings", competitorRows, [
    "Rank", "Market Thumbnail", "Market Shop", "Market Daily Sales", "Market 30D Sales",
    "Segment Share %", "Status", "Market Long Tail", "Matching MyMaravia Listing",
    "Match Tokens", "Build Recommendation", "Market Control Read", "Market Listing URL"
  ], 250);
  renderTable("market-control-my-listings", myListingRows, [
    "Thumbnail", "State", "Product Category", "Est. Daily Sales", "Est. 30D Sales",
    "Recent 7D Sales", "Recent 30D Sales", "Recent 90D Sales",
    "Views", "Favorites", "Recent 30D Revenue", "Product Title",
    "Actual Tags", "Market Control Read", "Listing URL"
  ], 100);
  renderTable("market-control-coverage", coverageRows, [
    "Matching MyMaravia Listing", "Covered Competitor Daily", "Covered 30D",
    "Covered Share %", "Competitor Rows Covered", "Top Competitor Row",
    "Repeated Match Cues", "Market Control Read"
  ], 80);
  renderTable("market-control-actions", actionRows, ["Cue / Action", "Evidence", "Next Edit", "Market Control Read"], 20);
}

function sortListingRows(rows) {
  const sort = document.getElementById("listing-sort").value;
  const sortMap = {
    "daily-desc": ["Est. Daily Sales", "desc"],
    "daily-asc": ["Est. Daily Sales", "asc"],
    "thirty-desc": ["Est. 30D Sales", "desc"],
    "thirty-asc": ["Est. 30D Sales", "asc"],
    "timeframe-sales-desc": ["Last Year Timeframe Estimated Sales", "desc"],
    "timeframe-daily-desc": ["Last Year Timeframe Avg Daily Sales", "desc"],
    "timeframe-reviews-desc": ["Last Year Timeframe Review Count", "desc"]
  };
  const config = sortMap[sort];
  if (!config) return rows;
  const [column, direction] = config;
  return rows.slice().sort((a, b) => {
    if (column.startsWith("Last Year Timeframe")) {
      const missingA = typeof a[column] !== "number";
      const missingB = typeof b[column] !== "number";
      if (missingA !== missingB) return missingA ? 1 : -1;
    }
    const delta = numericCell(a, column) - numericCell(b, column);
    const ordered = direction === "asc" ? delta : -delta;
    if (ordered) return ordered;
    return numericCell(a, "Overall Rank") - numericCell(b, "Overall Rank") ||
      String(a.Shop || "").localeCompare(String(b.Shop || "")) ||
      String(a["Product Title"] || "").localeCompare(String(b["Product Title"] || ""));
  });
}

function renderTopShops() {
  const metricName = document.getElementById("top-shop-metric").value;
  const rows = [...dashboard.market.topShops].sort((a, b) => Number(b[metricName] || 0) - Number(a[metricName] || 0));
  renderTable("top-shops", rows, ["Shop", "Label", "7D Sales", "30D Sales", "Avg Daily Sales (30D)", "Active Listings"], 15);
}

function companyStats() {
  const stats = new Map();
  const ensure = name => {
    const clean = companyName(name);
    if (!clean) return null;
    if (!stats.has(clean)) {
      stats.set(clean, { name: clean, listings: 0, daily: 0, thirty: 0, eRank30: 0, score: 0 });
    }
    return stats.get(clean);
  };

  getListingRows().forEach(row => {
    const stat = ensure(row.Shop);
    if (!stat) return;
    stat.listings += 1;
    stat.daily += numericCell(row, "Est. Daily Sales");
    stat.thirty += numericCell(row, "Est. 30D Sales");
  });
  (dashboard.market.topShops || []).forEach(row => {
    const stat = ensure(row.Shop);
    if (!stat) return;
    stat.eRank30 = Math.max(stat.eRank30, numericCell(row, "30D Sales"));
  });
  (dashboard.operations.coverageQueue || []).forEach(row => {
    const stat = ensure(row.Shop);
    if (!stat) return;
    stat.eRank30 = Math.max(stat.eRank30, numericCell(row, "eRank 30D Sales"));
  });
  (dashboard.comparison.shopTrends || []).forEach(row => {
    const stat = ensure(row.Shop);
    if (!stat) return;
    stat.score = Math.max(stat.score, numericCell(row, "Total Daily Sales In Range"));
  });

  stats.forEach(stat => {
    stat.score = Math.max(stat.thirty, stat.eRank30, stat.score);
  });
  return stats;
}

function companyOptions(filter = "") {
  const query = filter.trim().toLowerCase();
  return [...companyStats().values()]
    .filter(stat => !query || stat.name.toLowerCase().includes(query))
    .sort((a, b) => {
      const priority = name => /^(mymaravia|cronk research)$/i.test(name) ? 0 : 1;
      return priority(a.name) - priority(b.name) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}

function companySearchSuggestions(query, limit = 5) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return companyOptions(normalized)
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStarts = aName.startsWith(normalized) ? 0 : 1;
      const bStarts = bName.startsWith(normalized) ? 0 : 1;
      return aStarts - bStarts ||
        aName.indexOf(normalized) - bName.indexOf(normalized) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    })
    .slice(0, limit);
}

function renderCompanyOptions() {
  const select = document.getElementById("company-select");
  if (!select) return;
  const options = companyOptions();
  select.innerHTML = "";
  options.forEach(stat => {
    const option = document.createElement("option");
    option.value = stat.name;
    const suffix = stat.listings ? `${fmt(stat.listings, "Listing Count")} listings` : `${fmt(stat.eRank30, "30D Sales")} eRank 30D`;
    option.textContent = `${stat.name} (${suffix})`;
    select.appendChild(option);
  });
  if (selectedCompany && [...select.options].some(option => option.value === selectedCompany)) {
    select.value = selectedCompany;
  } else if (select.options.length) {
    selectedCompany = select.value;
  }
}

function hideCompanySuggestions() {
  const list = document.getElementById("company-suggestions");
  if (!list) return;
  list.hidden = true;
  list.classList.remove("active");
}

function renderCompanySuggestions() {
  const search = document.getElementById("company-search");
  const list = document.getElementById("company-suggestions");
  if (!search || !list) return;

  const suggestions = companySearchSuggestions(search.value);
  list.innerHTML = "";
  if (!search.value.trim() || suggestions.length === 0) {
    hideCompanySuggestions();
    return;
  }

  suggestions.forEach((stat, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "company-suggestion";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", index === 0 ? "true" : "false");
    const suffix = stat.listings ? `${fmt(stat.listings, "Listing Count")} listings` : `${fmt(stat.eRank30, "30D Sales")} eRank 30D`;
    button.textContent = `${stat.name} (${suffix})`;
    button.addEventListener("mousedown", event => event.preventDefault());
    button.addEventListener("click", () => selectCompanyProfile(stat.name, { searchValue: stat.name }));
    list.appendChild(button);
  });

  list.hidden = false;
  list.classList.add("active");
}

function selectCompanyProfile(company, options = {}) {
  const name = companyName(company);
  if (!name) return;
  selectedCompany = name;
  selectedCompanyProduction = "";
  const search = document.getElementById("company-search");
  if (search && Object.prototype.hasOwnProperty.call(options, "searchValue")) {
    search.value = options.searchValue;
  }
  renderCompanyOptions();
  hideCompanySuggestions();
  renderCompanyProfile();
}

function companyRows(company) {
  return getListingRows().filter(row => companyName(row.Shop) === company);
}

function companyLookup(rows, key = "Shop") {
  return new Map((rows || []).map(row => [companyName(row[key]), row]).filter(([name]) => name));
}

function buildCompanyProductRows(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const category = comparisonCategory(row);
    if (!groups.has(category)) {
      groups.set(category, { category, rows: [], daily: 0, thirty: 0, reviews: 0, reviews90: 0, reviews365: 0 });
    }
    const group = groups.get(category);
    group.rows.push(row);
    group.daily += numericCell(row, "Est. Daily Sales");
    group.thirty += numericCell(row, "Est. 30D Sales");
    group.reviews += numericCell(row, "Review Corpus Count");
    group.reviews90 += numericCell(row, "Review Corpus 90D");
    group.reviews365 += numericCell(row, "Review Corpus 365D");
  });
  return [...groups.values()].map(group => {
    const top = sortRowsByMetric(group.rows, "Est. Daily Sales")[0] || {};
    return {
      "Product Substrate Category": group.category,
      "Est. Daily Sales": Number(group.daily.toFixed(1)),
      "Est. 30D Sales": Number(group.thirty.toFixed(1)),
      "Review Corpus Count": group.reviews,
      "Review Corpus 90D": group.reviews90,
      "Review Corpus 365D": group.reviews365,
      "Listing Count": group.rows.length,
      "Top Listing": top["Product Title"] || ""
    };
  }).sort((a, b) => numericCell(b, "Est. Daily Sales") - numericCell(a, "Est. Daily Sales"));
}

function buildCompanyProductionRows(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const tag = row["Production Tag"] || "Unclassified";
    if (!groups.has(tag)) {
      groups.set(tag, { tag, rows: [], categories: new Set(), daily: 0, thirty: 0, reviews: 0, reviews90: 0, reviews365: 0 });
    }
    const group = groups.get(tag);
    group.rows.push(row);
    group.categories.add(comparisonCategory(row));
    group.daily += numericCell(row, "Est. Daily Sales");
    group.thirty += numericCell(row, "Est. 30D Sales");
    group.reviews += numericCell(row, "Review Corpus Count");
    group.reviews90 += numericCell(row, "Review Corpus 90D");
    group.reviews365 += numericCell(row, "Review Corpus 365D");
  });
  return [...groups.values()].map(group => {
    const top = sortRowsByMetric(group.rows, "Est. Daily Sales")[0] || {};
    return {
      "Production Tag": group.tag,
      "Est. Daily Sales": Number(group.daily.toFixed(1)),
      "Est. 30D Sales": Number(group.thirty.toFixed(1)),
      "Review Corpus Count": group.reviews,
      "Review Corpus 90D": group.reviews90,
      "Review Corpus 365D": group.reviews365,
      "Listing Count": group.rows.length,
      "Product Categories": [...group.categories].sort().slice(0, 8).join(", "),
      "Top Listing": top["Product Title"] || ""
    };
  }).sort((a, b) => numericCell(b, "Est. Daily Sales") - numericCell(a, "Est. Daily Sales"));
}

function renderCompanyProfile() {
  const select = document.getElementById("company-select");
  const company = selectedCompany || select?.value || "MyMaravia";
  selectedCompany = company;
  if (select && [...select.options].some(option => option.value === company)) select.value = company;

  const listings = sortRowsByMetric(companyRows(company), "Est. Daily Sales");
  const productRows = buildCompanyProductRows(listings);
  const productionRows = buildCompanyProductionRows(listings);
  if (selectedCompanyProduction && !productionRows.some(row => row["Production Tag"] === selectedCompanyProduction)) {
    selectedCompanyProduction = "";
  }
  const visibleListings = selectedCompanyProduction
    ? listings.filter(row => productionTagName(row["Production Tag"]) === selectedCompanyProduction)
    : listings;
  const topShop = companyLookup(dashboard.market.topShops || []).get(company) || {};
  const coverage = companyLookup(dashboard.operations.coverageQueue || []).get(company) || {};
  const trend = companyLookup(dashboard.comparison.shopTrends || []).get(company) || {};
  const corpusShop = companyLookup(dashboard.reviewCorpus?.shopRollup || []).get(company) || {};
  const chartRows = (dashboard.comparison.shopTrendChart || []).filter(row => companyName(row.Shop) === company);
  const trackedDaily = listings.reduce((sum, row) => sum + numericCell(row, "Est. Daily Sales"), 0);
  const trackedThirty = listings.reduce((sum, row) => sum + numericCell(row, "Est. 30D Sales"), 0);
  const views = listings.reduce((sum, row) => sum + numericCell(row, "Views"), 0);
  const favorites = listings.reduce((sum, row) => sum + numericCell(row, "Favorites"), 0);
  const recentReviews = listings.reduce((sum, row) => sum + numericCell(row, "Recent Reviews"), 0);
  const categories = new Set(listings.map(row => comparisonCategory(row)).filter(Boolean));

  document.getElementById("company-summary").textContent =
    `${company} profile from listings, product categories, production tags, eRank shop metrics, review corpus, and review-derived sales trend estimates.`;
  document.getElementById("company-metrics").innerHTML = [
    ["Tracked listings", fmt(listings.length, "Tracked Listings")],
    ["Tracked 30D sales", fmt(trackedThirty, "Tracked Est. 30D Sales")],
    ["Tracked daily sales", fmt(trackedDaily, "Tracked Est. Daily Sales")],
    ["Product categories", fmt(categories.size, "Tracked Product Categories")],
    ["Corpus reviews", fmt(corpusShop["Review Corpus Count"], "Review Corpus Count") || "0"],
    ["Review months", fmt(corpusShop["Review Corpus Months Covered"], "Review Corpus Months Covered") || "0"],
    ["Full-year history", corpusShop["Full Year Review Coverage"] || "No"]
  ].map(([label, value]) => metric(label, value)).join("");

  const eRank30 = numericCell(coverage, "eRank 30D Sales") || numericCell(topShop, "30D Sales");
  const calloutBits = [
    `${fmt(listings.length, "Listing Count")} tracked listing rows`,
    `${fmt(categories.size, "Listing Count")} product categories`,
    `${fmt(productionRows.length, "Listing Count")} production methods`
  ];
  if (eRank30) calloutBits.push(`${fmt(eRank30, "30D Sales")} eRank 30-day sales`);
  if (numericCell(corpusShop, "Review Corpus Count")) {
    calloutBits.push(
      `${fmt(corpusShop["Review Corpus Count"], "Review Corpus Count")} full-corpus reviews, ${fmt(corpusShop["Review Corpus 90D"], "Review Corpus 90D")} in the latest 90 days`
    );
  }
  if (corpusShop["Full Year Review Coverage"] === "Yes") {
    calloutBits.push(
      `full-year review coverage from ${corpusShop["Review Corpus Earliest ISO"] || "unknown"} to ${corpusShop["Review Corpus Latest ISO"] || "unknown"}`
    );
  }
  if (trend["Trend Source"]) {
    calloutBits.push(`${trend["Trend Confidence"] || "Estimated"} sales trend from ${trend["Trend Source"]}`);
  }
  if (views || favorites || recentReviews) {
    calloutBits.push(`${fmt(views, "Views")} views, ${fmt(favorites, "Favorites")} favorites, ${fmt(recentReviews, "Recent Reviews")} recent reviews in visible listing data`);
  }
  document.getElementById("company-callout").textContent = calloutBits.join(" · ");

  renderTable("company-snapshot", [{
    "Company": company,
    "Label": topShop.Label || "",
    "Tracked Listings": listings.length,
    "Tracked Product Categories": categories.size,
    "Tracked Production Methods": productionRows.length,
    "Tracked Est. Daily Sales": Number(trackedDaily.toFixed(1)),
    "Tracked Est. 30D Sales": Number(trackedThirty.toFixed(1)),
    "eRank 7D Sales": coverage["eRank 7D Sales"] ?? topShop["7D Sales"] ?? "",
    "eRank 30D Sales": coverage["eRank 30D Sales"] ?? topShop["30D Sales"] ?? "",
    "Avg Daily Sales (30D)": coverage["Avg Daily Sales (30D)"] ?? topShop["Avg Daily Sales (30D)"] ?? "",
    "Active Listings": topShop["Active Listings"] ?? "",
    "Review Corpus Count": corpusShop["Review Corpus Count"] ?? "",
    "Review Corpus 90D": corpusShop["Review Corpus 90D"] ?? "",
    "Review Corpus 365D": corpusShop["Review Corpus 365D"] ?? "",
    "Review Corpus Listings": corpusShop["Review Corpus Listings"] ?? "",
    "Review Corpus Avg Rating": corpusShop["Review Corpus Avg Rating"] ?? "",
    "Review Corpus Earliest ISO": corpusShop["Review Corpus Earliest ISO"] ?? "",
    "Review Corpus Latest ISO": corpusShop["Review Corpus Latest ISO"] ?? "",
    "Review Corpus Span Days": corpusShop["Review Corpus Span Days"] ?? "",
    "Review Corpus Months Covered": corpusShop["Review Corpus Months Covered"] ?? "",
    "Full Year Review Coverage": corpusShop["Full Year Review Coverage"] ?? "",
    "Peak Review Month": corpusShop["Peak Review Month"] ?? "",
    "Peak Review Month Count": corpusShop["Peak Review Month Count"] ?? "",
    "Seasonality Index": corpusShop["Seasonality Index"] ?? "",
    "Trend": trend.Trend || "",
    "Recent Avg Daily Sales": trend["Recent Avg Daily Sales"] ?? "",
    "Prior Avg Daily Sales": trend["Prior Avg Daily Sales"] ?? "",
    "Delta": trend.Delta ?? "",
    "Delta %": trend["Delta %"] ?? "",
    "Latest Complete Date": trend["Latest Complete Date"] ?? "",
    "Latest Complete Daily Sales": trend["Latest Complete Daily Sales"] ?? "",
    "Total Daily Sales In Range": trend["Total Daily Sales In Range"] ?? "",
    "Sales Per Review Used": trend["Sales Per Review Used"] ?? "",
    "Trend Source": trend["Trend Source"] ?? "",
    "Trend Confidence": trend["Trend Confidence"] ?? "",
    "Has Tab": coverage["Has Tab"] ?? "",
    "Tab Status": coverage["Tab Status"] ?? "",
    "Review Ledger Rows": coverage["Review Ledger Rows"] ?? "",
    "Last Evidence Run": coverage["Last Evidence Run"] ?? "",
    "Last Scrape Status": coverage["Last Scrape Status"] ?? "",
    "Next Action": coverage["Next Action"] ?? ""
  }]);

  if (chartRows.length) {
    Plotly.newPlot("company-sales-chart", [{
      type: "scatter",
      mode: "lines+markers",
      x: chartRows.map(row => row.Date),
      y: chartRows.map(row => row["Daily Sales"]),
      customdata: chartRows.map(row => [row["Review Count"], row["Estimated Monthly Sales"], row["Trend Source"]]),
      line: { color: "#1f5fbf", width: 3 },
      marker: { size: 7 },
      hovertemplate: "%{x}<br>Estimated avg daily sales: %{y:,.1f}<br>Reviews: %{customdata[0]:,.0f}<br>Est. monthly sales: %{customdata[1]:,.0f}<extra></extra>"
    }], {
      margin: { l: 48, r: 16, t: 8, b: 44 },
      yaxis: { title: "Estimated daily sales" },
      paper_bgcolor: "white",
      plot_bgcolor: "white"
    }, plotConfig);
  } else {
    document.getElementById("company-sales-chart").innerHTML = `<div class="empty">No review-derived sales trend rows are available for this company in the public snapshot.</div>`;
  }

  const weeklyRows = (dashboard.reviewCorpus?.shopWeeklySales || [])
    .filter(row => companyName(row.Shop) === company)
    .sort((a, b) => String(a["Week Start"] || "").localeCompare(String(b["Week Start"] || "")))
    .map(withDailySales);
  if (weeklyRows.length) {
    Plotly.newPlot("company-review-cycle-chart", [{
      type: "bar",
      x: weeklyRows.map(row => row["Week Start"]),
      y: weeklyRows.map(row => row["Estimated Daily Sales"]),
      customdata: weeklyRows.map(row => [row["Estimated Weekly Sales"], row["Review Count"], row["Sales Per Review Used"], row["Trend Confidence"]]),
      marker: { color: "#0f766e" },
      hovertemplate: "%{x}<br>Estimated daily sales: %{y:,.1f}<br>Estimated weekly sales: %{customdata[0]:,.1f}<br>Reviews: %{customdata[1]:,.0f}<br>Sales/review: %{customdata[2]:,.2f}<br>%{customdata[3]}<extra></extra>"
    }], {
      margin: { l: 48, r: 16, t: 8, b: 44 },
      yaxis: { title: "Estimated daily sales" },
      paper_bgcolor: "white",
      plot_bgcolor: "white"
    }, plotConfig);
    renderTable("company-review-cycle", [...weeklyRows].reverse(), ["Week Start", "Estimated Daily Sales", "Estimated Weekly Sales", "Review Count", "Sales Per Review Used", "Trend Confidence", "Trend Source"], 52);
  } else {
    document.getElementById("company-review-cycle-chart").innerHTML = `<div class="empty">No weekly review-derived sales rows are available for this company.</div>`;
    document.getElementById("company-review-cycle").innerHTML = "";
  }

  if (productRows.length) {
    renderBar("company-product-chart", productRows, "Est. Daily Sales", "Product Substrate Category", 15, "#1f5fbf");
    renderTable("company-products", productRows, ["Product Substrate Category", "Est. Daily Sales", "Est. 30D Sales", "Review Corpus Count", "Review Corpus 90D", "Listing Count", "Top Listing"], 80);
  } else {
    document.getElementById("company-product-chart").innerHTML = `<div class="empty">No product rows are available for this company.</div>`;
    document.getElementById("company-products").innerHTML = "";
  }

  if (productionRows.length) {
    renderBar("company-production-chart", productionRows, "Est. Daily Sales", "Production Tag", 15, "#0f766e");
    renderTable("company-production", productionRows, ["Production Tag", "Est. Daily Sales", "Est. 30D Sales", "Review Corpus Count", "Review Corpus 90D", "Listing Count", "Product Categories", "Top Listing"], 80);
  } else {
    document.getElementById("company-production-chart").innerHTML = `<div class="empty">No production-method rows are available for this company.</div>`;
    document.getElementById("company-production").innerHTML = "";
  }

  const filterNote = document.getElementById("company-listing-filter");
  if (filterNote) {
    filterNote.textContent = selectedCompanyProduction
      ? `Showing ${fmt(visibleListings.length, "Listing Count")} ${selectedCompanyProduction} listings for ${company}.`
      : `Showing all ${fmt(listings.length, "Listing Count")} tracked listings for ${company}.`;
  }
  const clearProduction = document.getElementById("company-production-clear");
  if (clearProduction) clearProduction.hidden = !selectedCompanyProduction;

  renderTable("company-listings", visibleListings, [
    "Overall Rank", "Thumbnail", "Weekly Sales Graph", "Recent Daily Sales", "Recent Weekly Sales", "Weekly Trend", "Peak Sales Week", "Peak Daily Sales", "Peak Weekly Sales",
    "Est. Daily Sales", "Est. 30D Sales", "Product Title", "Tags", "Tags Source", "Best Guess Tags",
    "Product Category", "Product Substrate Category", "Original Broad Category", "Production Tag",
    "Customization Tag", "Tag Confidence", "Tag Evidence", "Evidence Confidence", "Last Review ISO",
    "Price", "Views", "Favorites", "Recent 7D Sales", "Recent 30D Sales", "Recent 90D Sales",
    "Recent 180D Sales", "Recent 30D Revenue", "Recent 180D Revenue", "Sales Rate Window Days", "Recent Reviews",
    "Recent Avg Rating", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D",
    "Review Corpus Avg Rating", "Review Corpus Latest ISO", "Blank / Generic Sources", "Listing URL"
  ], 300);

  requestAnimationFrame(updateAllBottomScrollbars);
}

function openCompanyProfile(company) {
  const name = companyName(company);
  if (!name) return;
  selectCompanyProfile(name, { searchValue: "" });
  activateView("company");
}

function initNextActionFilters() {
  ["next-action-preset-filter", "next-action-type-filter", "next-action-search"].forEach(id => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener("input", renderOpportunity);
    element.addEventListener("change", renderOpportunity);
    element.dataset.bound = "true";
  });
}

function nextActionPresetMatches(row, preset) {
  if (!preset) return true;
  const type = String(row["Action Type"] || "");
  const text = Object.values(row).join(" ").toLowerCase();
  if (preset === "nameplates") return /name\s*plates?|nameplates?|desk sign|office sign|medical desk|teacher desk|led desk/.test(text);
  if (preset === "build") return type === "Build" || type === "Launch";
  if (preset === "fix") return type === "Fix";
  if (preset === "scale") return type === "Scale";
  if (preset === "seasonal") return type === "Seasonal";
  return true;
}

function filteredNextActions(rows) {
  const preset = document.getElementById("next-action-preset-filter")?.value || "";
  const type = document.getElementById("next-action-type-filter")?.value || "";
  const query = (document.getElementById("next-action-search")?.value || "").trim().toLowerCase();
  return rows.filter(row => {
    if (type && row["Action Type"] !== type) return false;
    if (!nextActionPresetMatches(row, preset)) return false;
    if (query && !Object.values(row).join(" ").toLowerCase().includes(query)) return false;
    return true;
  });
}

function renderNextActionRecipe(row, visibleCount, totalCount) {
  const target = document.getElementById("next-action-recipe");
  if (!target) return;
  if (!row) {
    target.innerHTML = `<strong>No matching action.</strong> Clear filters or search a broader category.`;
    return;
  }
  const type = escapeHtml(row["Action Type"] || "Action");
  const product = escapeHtml(row["Product / Listing"] || row.Action || "Selected row");
  const category = escapeHtml(row["Target Category"] || "Uncategorized");
  const score = escapeHtml(fmt(row["Action Score"], "Action Score") || "");
  const daily = escapeHtml(fmt(row["Expected Daily Sales"], "Expected Daily Sales") || "");
  const evidence = escapeHtml(row.Evidence || "No evidence note available.");
  const nextStep = escapeHtml(row["Next Step"] || "Review the source row and decide the listing move.");
  target.innerHTML = `<strong>${type}: ${product}</strong><br>${category} · score ${score} · ${daily} expected daily sales · showing ${fmt(visibleCount, "Listing Count")} of ${fmt(totalCount, "Listing Count")} actions.<br><strong>Evidence:</strong> ${evidence}<br><strong>Next step:</strong> ${nextStep}`;
}

function renderOpportunity() {
  const opp = dashboard.opportunity || {};
  const metrics = opp.metrics || {};
  const queue = opp.opportunityQueue || [];
  const launches = opp.launchQueue || [];
  const matrix = opp.intentProductMatrix || [];
  const health = opp.health || [];
  const baseline = opp.cronkBaseline || {};
  initNextActionFilters();
  const nextActions = dashboard.nextActions?.queue || [];
  const visibleNextActions = filteredNextActions(nextActions);
  const nextActionsSummary = document.getElementById("next-actions-summary");
  if (nextActionsSummary) {
    const top = visibleNextActions[0];
    nextActionsSummary.textContent = top
      ? `${fmt(visibleNextActions.length, "Listing Count")} visible of ${fmt(nextActions.length, "Listing Count")} ranked actions. Top move: ${top["Action Type"]} - ${top["Product / Listing"] || top.Action || "selected opportunity"}.`
      : "No next-action rows are available in this snapshot.";
  }
  renderNextActionRecipe(visibleNextActions[0], visibleNextActions.length, nextActions.length);
  renderTable("next-actions", visibleNextActions, [
    "Priority", "Action Type", "Action", "Target Category", "Product / Listing",
    "Action Score", "Expected Daily Sales", "Source Signal", "Confidence",
    "Evidence", "Next Step", "Market Listing URL", "My Listing URL"
  ], 40);

  const metricRows = [
    ["Top opportunity", queue[0]?.["Product Bet"] || "Unavailable"],
    ["Opportunity score", fmt(queue[0]?.["Opportunity Score"], "Opportunity Score") || "Unavailable"],
    ["SQL latest date", metrics.sqlLatestDate || "Unavailable"],
    ["Tracked SQL shops", fmt(metrics.sqlShops, "SQL Shops") || "Unavailable"],
    ["Cronk current 30D", fmt(baseline["Current 30D Sales"], "Current 30D Sales") || "Unavailable"],
    ["Cronk Etsy transactions", fmt(baseline.Transactions, "Transactions") || "Unavailable"]
  ];
  document.getElementById("opportunity-metrics").innerHTML = metricRows.map(([label, value]) => metric(label, value)).join("");

  document.getElementById("opportunity-summary").textContent =
    opp.summary || "Static opportunity snapshot is not available yet. Run the SQLite exporter to populate this section.";

  if (queue.length) {
    const leader = queue[0];
    const fit = leader["Cronk Research Fit"];
    document.getElementById("opportunity-callout").innerHTML =
      `<strong>${escapeHtml(leader["Product Bet"])}</strong> is the current best bet because it combines ${fmt(leader["Market Daily Sales"], "Market Daily Sales")} market daily sales, ${fmt(fit, "Cronk Research Fit")} Cronk Research fit, and ${escapeHtml(leader["Evidence Note"] || "usable evidence")}`;
    renderBar("opportunity-score-chart", queue, "Opportunity Score", "Product Bet", 12, "#0f766e");
  } else {
    document.getElementById("opportunity-callout").innerHTML = "No opportunity rows are available in this snapshot.";
    document.getElementById("opportunity-score-chart").innerHTML = `<div class="empty">Run the SQLite opportunity export to build the score chart.</div>`;
  }

  renderTable("opportunity-queue", queue, [
    "Launch Priority", "Product Bet", "Buyer Intent", "Opportunity Score", "Market Daily Sales",
    "Demand Score", "Cronk Research Fit", "Evidence Score", "Review Corpus Count",
    "Review Evidence Count", "Saturation Penalty", "Why It Matters"
  ], 40);

  renderTable("launch-queue", launches, [
    "Launch Priority", "Suggested Listings", "Primary Product Family", "Buyer Intent",
    "Launch Brief", "Source", "Opportunity Score"
  ], 30);

  renderTable("cronk-baseline", [baseline], [
    "Current 7D Sales", "Current 30D Sales", "Current Avg Daily Sales", "Active Listings",
    "Listings", "Transactions", "Receipts", "Reviews"
  ]);

  renderTable("intent-product-matrix", matrix, [
    "Buyer Intent", "LED Nameplate", "Acrylic Sign", "Coasters", "Hangers", "Metal/Wood Sign",
    "Market Daily Sales", "Best First Move"
  ], 40);

  renderTable("opportunity-health", health, ["Source", "Status", "Refresh Step", "Notes"], 20);
}

function renderMyMaravia() {
  const my = dashboard.myMaravia || {};
  const metrics = my.metrics || {};
  const metricRows = [
    ["All listings", fmt(metrics["MyMaravia Listings"], "MyMaravia Listings") || "0"],
    ["Active listings", fmt(metrics["Active Listings"], "Active Listings") || "0"],
    ["Market share", metrics["Current Market Share %"] == null ? "Unavailable" : fmt(metrics["Current Market Share %"], "Current Market Share %")],
    ["Fix conversion", fmt(metrics["Fix Conversion"], "Fix Conversion") || "0"],
    ["Saturated", fmt(metrics["Saturated / Niche Down"], "Saturated / Niche Down") || "0"],
    ["Coverage", metrics["Coverage %"] == null ? "Unavailable" : fmt(metrics["Coverage %"], "Coverage %")]
  ];

  document.getElementById("mymaravia-metrics").innerHTML = metricRows.map(([label, value]) => metric(label, value)).join("");
  document.getElementById("mymaravia-method").textContent = my.method || "";
  document.getElementById("mymaravia-summary").innerHTML =
    `<strong>${fmt(metrics["Active Listings"], "Active Listings") || 0} active listings</strong> are competing against ${fmt(metrics["Current Market Daily Sales"], "Current Market Daily Sales") || 0} estimated daily market sales across current categories. The priority queue below is sorted toward conversion problems, leader gaps, and crowded markets first.`;

  const categoryRows = my.categories || [];
  if (categoryRows.length) {
    const chartRows = categoryRows.slice().sort((a, b) => Number(b["Market Daily Sales"] || 0) - Number(a["Market Daily Sales"] || 0)).slice(0, 12).reverse();
    Plotly.newPlot("mymaravia-category-chart", [
      {
        type: "bar",
        orientation: "h",
        name: "Market daily sales",
        x: chartRows.map(row => row["Market Daily Sales"]),
        y: chartRows.map(row => row["Product Category"]),
        marker: { color: "#244c66" },
        hovertemplate: "%{y}<br>Market daily sales: %{x:,.1f}<extra></extra>"
      },
      {
        type: "bar",
        orientation: "h",
        name: "MyMaravia daily sales",
        x: chartRows.map(row => row["My Category Daily Sales"]),
        y: chartRows.map(row => row["Product Category"]),
        marker: { color: "#0b7a63" },
        hovertemplate: "%{y}<br>MyMaravia daily sales: %{x:,.1f}<extra></extra>"
      }
    ], {
      barmode: "group",
      margin: { l: 170, r: 18, t: 8, b: 46 },
      paper_bgcolor: "white",
      plot_bgcolor: "white",
      xaxis: { automargin: true },
      yaxis: { automargin: true },
      legend: { orientation: "h", y: -0.18 }
    }, plotConfig);
  } else {
    document.getElementById("mymaravia-category-chart").innerHTML = `<div class="empty">No MyMaravia category rows are available.</div>`;
  }

  renderTable("mymaravia-categories", my.categories || [], [
    "Product Category", "MyMaravia Listings", "Active Listings", "Market Long Tails", "Market Shops",
    "My Category Daily Sales", "Market Daily Sales", "My Market Share %", "Top Competitor Thumbnail",
    "Top Competitor", "Top Competitor Shop", "Top Competitor Daily Sales", "Top Competitor 30D Sales",
    "Top Competitor eRank 30D Sales", "Top Competitor Active Listings", "Top Competitor Listing URL",
    "Leader Gap Daily", "Market State",
    "Built Long Tails", "Needs Build", "Coverage %", "Top Open Daily Sales", "Top Open Long Tail",
    "Existing MyMaravia Long Tails"
  ]);

  const diagnosticStatus = document.getElementById("my-listing-status-filter")?.value || "";
  const listingState = document.getElementById("my-listing-state-filter")?.value || "";
  const listingQuery = (document.getElementById("my-listing-search")?.value || "").trim().toLowerCase();
  const allDiagnostics = my.listingDiagnostics || [];
  let diagnosticRows = allDiagnostics;
  if (diagnosticStatus) diagnosticRows = diagnosticRows.filter(row => row["Conquest Status"] === diagnosticStatus);
  if (listingState) diagnosticRows = diagnosticRows.filter(row => String(row.State || "").toLowerCase() === listingState);
  if (listingQuery) diagnosticRows = diagnosticRows.filter(row => Object.values(row).join(" ").toLowerCase().includes(listingQuery));
  document.getElementById("mymaravia-listing-count").textContent =
    diagnosticRows.length === allDiagnostics.length
      ? `Showing all ${fmt(allDiagnostics.length, "Listing Count")} listing matchups`
      : `Showing ${fmt(diagnosticRows.length, "Listing Count")} of ${fmt(allDiagnostics.length, "Listing Count")} listing matchups`;
  renderTable("mymaravia-listing-diagnostics", buildBattlePlanRows(diagnosticRows, my.myListings || []), [
    "Priority", "Conquest Status", "Target Category",
    "My Thumbnail", "My Listing", "My Actual Tags", "My Daily Sales", "My 30D Sales", "My Recent 30D Sales", "My Market Share %",
    "Competitor Thumbnail", "Competing Listing", "Competing Shop", "Competing Tags", "Competing Daily Sales", "Competing 30D Sales", "Competitor Market Share %",
    "Market Daily Sales", "Market Listings", "Leader Gap Daily", "Recommended Move", "My Listing URL", "Competitor Listing URL"
  ], 300);

  const category = document.getElementById("my-category-filter")?.value || "";
  const status = document.getElementById("my-status-filter")?.value || "";
  const query = (document.getElementById("my-long-tail-search")?.value || "").trim().toLowerCase();
  const allRows = my.longTailQueue || [];
  let rows = allRows;

  if (category) rows = rows.filter(row => row["Product Category"] === category);
  if (status) rows = rows.filter(row => row.Status === status);
  if (query) rows = rows.filter(row => Object.values(row).join(" ").toLowerCase().includes(query));

  const count = fmt(rows.length, "Listing Count");
  const total = fmt(allRows.length, "Listing Count");
  document.getElementById("mymaravia-long-tail-count").textContent =
    rows.length === allRows.length ? `Showing all ${total} long tails` : `Showing ${count} of ${total} long tails`;

  renderTable("mymaravia-long-tail-queue", rows, [
    "Status", "Product Category", "Market Thumbnail", "Market Daily Sales", "Market Long Tail",
    "Market Shop", "Matching MyMaravia Listing", "Match Tokens",
    "Build Recommendation", "Market Listing URL"
  ], 250);

  renderTable("mymaravia-listings", (my.myListings || []).map(withDailySales), [
    "Thumbnail", "Weekly Sales Graph", "Recent Daily Sales", "Recent Weekly Sales", "Weekly Trend", "State", "Product Category", "Est. Daily Sales", "Est. 30D Sales", "Product Title", "Actual Tags", "Tags", "Tags Source",
    "Recent 7D Sales", "Recent 30D Sales", "Recent 90D Sales", "Recent 180D Sales",
    "Recent Reviews", "Recent Avg Rating", "Review Corpus Count", "Review Corpus 90D", "Sales Rate Window Days",
    "Views", "Favorites", "Tags Count", "Listing URL"
  ], 500);
}

function renderListings() {
  const query = document.getElementById("listing-search").value.trim().toLowerCase();
  const production = document.getElementById("production-filter").value;
  selectedListingSubstrate = document.getElementById("substrate-filter")?.value || "";
  selectedListingTimeframePreset = document.getElementById("listing-timeframe-preset")?.value || "";
  const timeframeWindow = selectedListingTimeframeWindow();
  const allRows = getListingRows();
  let rows = allRows;
  if (production) {
    rows = rows.filter(row => row["Production Tag"] === production);
  }
  if (selectedListingSubstrate) {
    rows = rows.filter(row => String(row["Product Substrate Category"] || row["Product Category"] || "") === selectedListingSubstrate);
  }
  if (query) {
    rows = rows.filter(row => listingSearchText(row).includes(query));
  }
  const reviewRows = reviewListingRowsForListings(query, production, selectedListingSubstrate);
  rows = rows.concat(reviewRows);
  if (timeframeWindow) {
    rows = rows.map(row => listingTimeframeMetricRow(row, timeframeWindow));
  }
  rows = sortListingRows(rows);
  const count = fmt(rows.length, "Listing Count");
  const totalCount = allRows.length + reviewListingTotal();
  const total = fmt(totalCount, "Listing Count");
  const shown = Math.min(rows.length, LISTING_RENDER_LIMIT);
  const status = reviewListingStatusText(query, production, selectedListingSubstrate);
  const timeframeStatus = timeframeWindow ? `Last-year timeframe: ${timeframeWindow.display}.` : "";
  const baseText = rows.length === totalCount
    ? `Showing first ${fmt(shown, "Listing Count")} of ${total} listings`
    : `Showing first ${fmt(shown, "Listing Count")} of ${count} visible/matching listings from ${total} total`;
  document.getElementById("listing-count").textContent = [baseText, timeframeStatus, status].filter(Boolean).join(" ");
  const timeframeColumns = timeframeWindow ? [
    "Last Year Timeframe Window", "Last Year Timeframe Estimated Sales", "Last Year Timeframe Avg Daily Sales",
    "Last Year Timeframe Review Count", "Last Year Timeframe Weeks With Demand", "Last Year Timeframe Signal"
  ] : [];
  renderTable("top-listings", rows, [
    "Overall Rank", "Thumbnail", "Weekly Sales Graph", "Recent Daily Sales", "Recent Weekly Sales", "Weekly Trend", "Peak Sales Week", "Peak Daily Sales", "Peak Weekly Sales",
    ...timeframeColumns,
    "Shop", "Est. Daily Sales", "Est. 30D Sales", "Blank / Generic Sources", "Product Title", "Tags", "Tags Source", "Best Guess Tags", "Product Category", "Product Substrate Category",
    "Production Tag", "Customization Tag", "Tag Confidence", "Tag Evidence",
    "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D",
    "Review Corpus Avg Rating", "Review Corpus Latest ISO", "Evidence Confidence", "Last Review ISO", "Listing URL"
  ], LISTING_RENDER_LIMIT);
  renderListingCycle(selectedListingCycleKey);
}

const askStopWords = new Set([
  "about", "across", "after", "again", "against", "all", "also", "and", "answer",
  "are", "best", "between", "bring", "can", "category", "categories", "compare",
  "daily", "data", "day", "days", "does", "est", "estimated", "everything", "find",
  "for", "from", "give", "has", "have", "highest", "into", "list", "listing",
  "listings", "lowest", "make", "market", "most", "much", "need", "needs", "now",
  "ordered", "product", "products", "question", "sales", "sheet", "shop", "shops",
  "show", "sort", "than", "that", "the", "their", "there", "these", "thing",
  "things", "this", "top", "total", "what", "where", "which", "with", "within"
]);

function renderAskScope() {
  const rows = getListingRows();
  const shops = new Set(rows.map(row => row.Shop).filter(Boolean)).size;
  const categories = new Set(rows.map(row => comparisonCategory(row)).filter(Boolean)).size;
  const openLongTails = (dashboard.myMaravia?.longTailQueue || []).filter(row => row.Status === "Needs build").length;
  const corpusReviews = dashboard.reviewCorpus?.totalReviews || 0;
  const text = `${fmt(rows.length, "Listing Count")} listings, ${fmt(shops, "Shop Count")} shops, ${fmt(categories, "Listing Count")} categories, ${fmt(openLongTails, "Listing Count")} open MyMaravia long tails, ${fmt(corpusReviews, "Review Corpus Count")} review-corpus records.`;
  const scope = document.getElementById("ask-scope");
  if (scope) scope.textContent = text;
}

function normalizeQuestion(question) {
  return String(question || "").toLowerCase();
}

function askTokens(question) {
  return normalizeQuestion(question)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 2 && !askStopWords.has(token) && !/^\d+(d|-day|day)?$/.test(token));
}

function rowText(row) {
  return Object.values(row || {}).join(" ").toLowerCase();
}

function filterRowsByTokens(rows, tokens) {
  if (!tokens.length) return rows;
  const strict = rows.filter(row => {
    const text = rowText(row);
    return tokens.every(token => text.includes(token));
  });
  if (strict.length) return strict;
  const loose = rows.filter(row => {
    const text = rowText(row);
    return tokens.some(token => text.includes(token));
  });
  return loose.length ? loose : rows;
}

function applyQuestionScope(rows, question) {
  const q = normalizeQuestion(question);
  let scoped = rows;
  if (/mymaravia|my shop|my listings|mine\b/.test(q)) {
    scoped = rows.filter(row => /mymaravia/i.test(String(row.Shop || row.Source || "")));
  }
  const tokens = askTokens(question).filter(token => !["mymaravia", "coverage", "gaps", "gap"].includes(token));
  return filterRowsByTokens(scoped, tokens);
}

function askMetric(question) {
  return /30|thirty|month|monthly/.test(normalizeQuestion(question)) ? "Est. 30D Sales" : "Est. Daily Sales";
}

function sortRowsByMetric(rows, metric) {
  return rows.slice().sort((a, b) => {
    const delta = numericCell(a, metric) - numericCell(b, metric);
    if (delta) return -delta;
    return numericCell(a, "Overall Rank") - numericCell(b, "Overall Rank") ||
      String(a.Shop || "").localeCompare(String(b.Shop || "")) ||
      String(a["Product Title"] || "").localeCompare(String(b["Product Title"] || ""));
  });
}

function aggregateListings(rows, groupKey) {
  const groups = new Map();
  rows.forEach(row => {
    const name = String(row[groupKey] || "Uncategorized");
    if (!groups.has(name)) {
      groups.set(name, { name, rows: [], shops: new Set(), daily: 0, thirty: 0 });
    }
    const group = groups.get(name);
    group.rows.push(row);
    if (row.Shop) group.shops.add(row.Shop);
    group.daily += numericCell(row, "Est. Daily Sales");
    group.thirty += numericCell(row, "Est. 30D Sales");
  });
  return [...groups.values()].map(group => {
    const top = sortRowsByMetric(group.rows, "Est. Daily Sales")[0] || {};
    return {
      [groupKey]: group.name,
      "Est. Daily Sales": Number(group.daily.toFixed(1)),
      "Est. 30D Sales": Number(group.thirty.toFixed(1)),
      "Listing Count": group.rows.length,
      "Shop Count": group.shops.size,
      "Top Shop": top.Shop || "",
      "Top Listing": top["Product Title"] || ""
    };
  });
}

function result(title, summary, bullets = [], rows = [], columns = null, limit = 25) {
  return { title, summary, bullets, rows, columns, limit };
}

function sourceStatus(row) {
  const text = String(row["Blank / Generic Sources"] || "").trim();
  if (!text) return "Not researched";
  if (/^cannot buy/i.test(text)) return "No blank found";
  if (/^not researched/i.test(text)) return "Not researched";
  if (/https?:\/\//i.test(text)) return "Links available";
  return "Note";
}

function answerCategoryQuestion(question) {
  const allRows = getListingRows();
  const rows = applyQuestionScope(allRows, question);
  const metric = askMetric(question);
  const groups = aggregateListings(rows, "Product Substrate Category")
    .sort((a, b) => numericCell(b, metric) - numericCell(a, metric));
  const leader = groups[0];
  if (!leader) {
    return result("No matching category data", "I could not find category rows for that question.");
  }
  return result(
    "Category answer",
    `${leader["Product Substrate Category"]} leads this scope with ${fmt(leader[metric], metric)} ${metric.toLowerCase()} across ${fmt(leader["Listing Count"], "Listing Count")} listings and ${fmt(leader["Shop Count"], "Shop Count")} shops.`,
    [
      `Scoped rows: ${fmt(rows.length, "Listing Count")} of ${fmt(allRows.length, "Listing Count")} available listings.`,
      `Sorting by ${metric}.`
    ],
    groups,
    ["Product Substrate Category", "Est. Daily Sales", "Est. 30D Sales", "Listing Count", "Shop Count", "Top Shop", "Top Listing"]
  );
}

function answerShopQuestion(question) {
  const allRows = getListingRows();
  const rows = applyQuestionScope(allRows, question);
  const metric = askMetric(question);
  const groups = aggregateListings(rows, "Shop")
    .sort((a, b) => numericCell(b, metric) - numericCell(a, metric));
  const leader = groups[0];
  if (!leader) {
    return result("No matching shop data", "I could not find shop rows for that question.");
  }
  return result(
    "Shop answer",
    `${leader.Shop} leads this scope with ${fmt(leader[metric], metric)} ${metric.toLowerCase()} across ${fmt(leader["Listing Count"], "Listing Count")} listings.`,
    [
      `Scoped rows: ${fmt(rows.length, "Listing Count")} of ${fmt(allRows.length, "Listing Count")} available listings.`,
      `Sorting by ${metric}.`
    ],
    groups,
    ["Shop", "Est. Daily Sales", "Est. 30D Sales", "Listing Count", "Top Listing"]
  );
}

function answerListingQuestion(question) {
  const allRows = getListingRows();
  const rows = sortRowsByMetric(applyQuestionScope(allRows, question), askMetric(question));
  const metric = askMetric(question);
  const leader = rows[0];
  if (!leader) {
    return result("No matching listings", "I could not find listing rows for that question.");
  }
  return result(
    "Listing answer",
    `${leader.Shop || "Unknown shop"} has the strongest matching listing by ${metric.toLowerCase()}: ${leader["Product Title"] || "Untitled listing"} at ${fmt(leader[metric], metric)}.`,
    [
      `Scoped rows: ${fmt(rows.length, "Listing Count")} of ${fmt(allRows.length, "Listing Count")} available listings.`,
      `Use the table for the evidence trail and source links.`
    ],
    rows,
    ["Overall Rank", "Thumbnail", "Shop", "Est. Daily Sales", "Est. 30D Sales", "Product Title", "Best Guess Tags", "Product Substrate Category", "Production Tag", "Listing URL"]
  );
}

function answerSourceQuestion(question) {
  const allRows = getListingRows();
  const rows = sortRowsByMetric(applyQuestionScope(allRows, question), askMetric(question));
  const withStatus = rows.map(row => ({ ...row, "Source Status": sourceStatus(row) }));
  const linked = withStatus.filter(row => row["Source Status"] === "Links available").length;
  const noBlank = withStatus.filter(row => row["Source Status"] === "No blank found").length;
  const notResearched = withStatus.filter(row => row["Source Status"] === "Not researched").length;
  return result(
    "Blank and generic source answer",
    `${fmt(linked, "Listing Count")} of ${fmt(withStatus.length, "Listing Count")} scoped listings have blank or generic source links. ${fmt(noBlank, "Listing Count")} are marked as no blank found and ${fmt(notResearched, "Listing Count")} are still unresearched.`,
    [
      `Scoped rows: ${fmt(rows.length, "Listing Count")} of ${fmt(allRows.length, "Listing Count")} available listings.`,
      `Rows are sorted by ${askMetric(question)}.`
    ],
    withStatus,
    ["Source Status", "Shop", "Est. Daily Sales", "Est. 30D Sales", "Blank / Generic Sources", "Product Title", "Best Guess Tags", "Product Substrate Category", "Listing URL"]
  );
}

function answerMyMaraviaQuestion(question) {
  const q = normalizeQuestion(question);
  const my = dashboard.myMaravia || {};
  const metrics = my.metrics || {};
  const wantsCurrent = /current|already|have|my listings|what do i have/.test(q) && !/gap|missing|need|build/.test(q);
  if (wantsCurrent) {
    const rows = sortRowsByMetric(filterRowsByTokens(my.myListings || [], askTokens(question)), "Est. Daily Sales");
    return result(
      "MyMaravia current listings",
      `MyMaravia has ${fmt(metrics["MyMaravia Listings"], "MyMaravia Listings") || fmt(rows.length, "Listing Count")} current listings across ${fmt(metrics["Current Product Categories"], "Current Product Categories") || "the visible"} categories.`,
      [`Rows are sorted by estimated daily sales.`],
      rows,
      ["Thumbnail", "Product Category", "Est. Daily Sales", "Product Title", "Best Guess Tags", "Recent 180D Sales", "Recent Reviews", "Recent Avg Rating", "Views", "Favorites", "Listing URL"],
      50
    );
  }

  const queue = filterRowsByTokens(my.longTailQueue || [], askTokens(question).filter(token => !["mymaravia", "missing", "coverage", "build", "built", "gaps", "gap"].includes(token)));
  const needs = queue
    .filter(row => row.Status === "Needs build")
    .sort((a, b) => numericCell(b, "Market Daily Sales") - numericCell(a, "Market Daily Sales"));
  const top = needs[0];
  const summary = top
    ? `The largest MyMaravia coverage gap in this scope is ${top["Market Long Tail"] || top["Product Category"]} at ${fmt(top["Market Daily Sales"], "Market Daily Sales")} market daily sales.`
    : `I do not see open MyMaravia coverage gaps in this scope.`;
  return result(
    "MyMaravia coverage answer",
    summary,
    [
      `Coverage: ${metrics["Coverage %"] == null ? "unavailable" : fmt(metrics["Coverage %"], "Coverage %")}.`,
      `Open long tails in scope: ${fmt(needs.length, "Listing Count")}.`
    ],
    needs,
    ["Status", "Product Category", "Market Daily Sales", "Market 30D Sales", "Market Long Tail", "Market Shop", "Matching MyMaravia Listing", "Build Recommendation", "Market Listing URL"],
    50
  );
}

function answerOpportunityQuestion(question) {
  const rows = filterRowsByTokens(dashboard.opportunity?.opportunityQueue || [], askTokens(question))
    .sort((a, b) => numericCell(b, "Opportunity Score") - numericCell(a, "Opportunity Score"));
  const leader = rows[0];
  if (!leader) {
    return result("No opportunity rows", "The opportunity queue is not available in this snapshot.");
  }
  return result(
    "Opportunity answer",
    `${leader["Product Bet"]} is the strongest matching opportunity with an opportunity score of ${fmt(leader["Opportunity Score"], "Opportunity Score")} and ${fmt(leader["Market Daily Sales"], "Market Daily Sales")} market daily sales.`,
    [
      leader["Why It Matters"] || "The score blends demand, Cronk Research fit, evidence, momentum, and saturation.",
      `Rows are sorted by opportunity score.`
    ],
    rows,
    ["Launch Priority", "Product Bet", "Buyer Intent", "Opportunity Score", "Market Daily Sales", "Demand Score", "Cronk Research Fit", "Evidence Score", "Saturation Penalty", "Why It Matters"],
    25
  );
}

function answerTrendQuestion(question) {
  const q = normalizeQuestion(question);
  const direction = /down|fall|dropping|declin/.test(q) ? "Down" : /up|moving|rising|grow/.test(q) ? "Up" : "";
  let rows = dashboard.comparison?.shopTrends || [];
  if (direction) rows = rows.filter(row => row.Trend === direction);
  rows = filterRowsByTokens(rows, askTokens(question).filter(token => !["moving", "trend", "trends", "movement"].includes(token)))
    .sort((a, b) => Math.abs(numericCell(b, "Delta")) - Math.abs(numericCell(a, "Delta")));
  const leader = rows[0];
  if (!leader) {
    return result("No trend rows", "The shop movement rows are not available in this snapshot.");
  }
  return result(
    "Movement answer",
    `${leader.Shop} is the strongest matching movement row: ${leader.Trend || "Flat"} by ${fmt(leader.Delta, "Delta")} daily sales (${fmt(leader["Delta %"], "Delta %")}).`,
    [`Rows use the recent vs prior shop trend snapshot.`],
    rows,
    ["Shop", "Trend", "Recent Avg Daily Sales", "Prior Avg Daily Sales", "Delta", "Delta %", "Latest Complete Date", "Latest Complete Daily Sales", "Days Used"],
    40
  );
}

function answerReviewQuestion(question) {
  const corpus = dashboard.reviewCorpus || {};
  const q = normalizeQuestion(question);
  if (/how many|total|all|being used|use all|used/.test(q) && !/listing|product|category|substrate|led|nameplate|shop|company|seller|competitor/.test(q)) {
    const shopRows = (corpus.shopRollup || [])
      .slice()
      .sort((a, b) => numericCell(b, "Review Corpus Count") - numericCell(a, "Review Corpus Count"));
    return result(
      "Review corpus answer",
      `${fmt(corpus.totalReviews, "Review Corpus Count")} full-corpus review records are used in the backend aggregate calculations.`,
      [
        `${fmt(corpus.uniqueShops, "Shop Count")} shops and ${fmt(corpus.uniqueListingUrls, "Listing Count")} listing URLs are represented.`,
        `${fmt(corpus.matchedCurrentListingReviews, "Review Corpus Count")} reviews match current dashboard listing URLs; ${fmt(corpus.unmatchedReviewRecords, "Review Corpus Count")} unmatched records still feed overall/shop corpus rollups.`,
        `Latest corpus review date: ${corpus.latestReviewISO || "unavailable"}.`
      ],
      shopRows,
      ["Shop", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Review Corpus Avg Rating", "Review Corpus Latest ISO", "Review Corpus Listings"],
      60
    );
  }
  if (/shop|company|seller|competitor/.test(q)) {
    const shopRows = filterRowsByTokens(corpus.shopRollup || [], askTokens(question))
      .sort((a, b) => numericCell(b, "Review Corpus Count") - numericCell(a, "Review Corpus Count"));
    const leader = shopRows[0];
    return result(
      "Review corpus answer",
      `The UI now uses ${fmt(corpus.totalReviews, "Review Corpus Count")} full-corpus review records for aggregate calculations. ${leader ? `${leader.Shop} has the largest matching corpus count at ${fmt(leader["Review Corpus Count"], "Review Corpus Count")} reviews.` : "No matching shop rollup rows were found."}`,
      [
        `${fmt(corpus.uniqueShops, "Shop Count")} shops and ${fmt(corpus.uniqueListingUrls, "Listing Count")} listing URLs are represented in the review corpus.`,
        `${fmt(corpus.matchedCurrentListingReviews, "Review Corpus Count")} reviews match current dashboard listing URLs; unmatched records still feed overall/shop corpus rollups.`,
        `Review text and buyer names are not shipped to the public UI.`
      ],
      shopRows,
      ["Shop", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Review Corpus Avg Rating", "Review Corpus Latest ISO", "Review Corpus Listings"],
      60
    );
  }

  const rows = sortRowsByMetric(applyQuestionScope(getListingRows(), question), "Review Corpus Count")
    .filter(row => numericCell(row, "Review Corpus Count") || numericCell(row, "Recent Reviews") || row["Recent Avg Rating"]);
  const totalScopedCorpus = rows.reduce((sum, row) => sum + numericCell(row, "Review Corpus Count"), 0);
  const leader = rows[0];
  if (!rows.length) {
    return result(
      "Review corpus answer",
      `The UI now uses ${fmt(corpus.totalReviews, "Review Corpus Count")} full-corpus review records, but none of the current listing rows match this specific question.`,
      [
        `${fmt(corpus.uniqueShops, "Shop Count")} shops and ${fmt(corpus.uniqueListingUrls, "Listing Count")} listing URLs are represented in the review corpus.`,
        `Raw review text, buyer names, and photos are not published.`
      ]
    );
  }
  return result(
    "Review corpus answer",
    `${fmt(totalScopedCorpus, "Review Corpus Count")} full-corpus reviews match this listing scope. ${leader.Shop || "The leading row"} has the highest matching listing at ${fmt(leader["Review Corpus Count"], "Review Corpus Count")} corpus reviews.`,
    [
      `${fmt(corpus.totalReviews, "Review Corpus Count")} total review records are used in the backend aggregates.`,
      `${fmt(corpus.matchedCurrentListingReviews, "Review Corpus Count")} records match current dashboard listing URLs.`,
      `Rows are sorted by full-corpus review count.`
    ],
    rows,
    ["Shop", "Product Category", "Product Substrate Category", "Product Title", "Best Guess Tags", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Review Corpus Avg Rating", "Review Corpus Latest ISO", "Recent Reviews", "Recent Avg Rating", "Est. Daily Sales", "Listing URL"],
    50
  );
}

function answerSeasonalityQuestion(question) {
  const corpus = dashboard.reviewCorpus || {};
  const q = normalizeQuestion(question);
  let rows = (corpus.seasonalityCandidates || []).slice();
  const tokens = askTokens(question).filter(token => ![
    "cycle", "cyclical", "season", "seasonal", "seasonality", "year", "full", "history", "data", "shop", "shops"
  ].includes(token));
  if (tokens.length) {
    const scoped = filterRowsByTokens(rows, tokens);
    if (scoped.length) rows = scoped;
  }
  rows.sort((a, b) =>
    numericCell(b, "eRank 30D Sales") - numericCell(a, "eRank 30D Sales") ||
    numericCell(b, "Review Corpus 365D") - numericCell(a, "Review Corpus 365D")
  );
  const leader = rows[0];
  const monthlyRows = leader
    ? (corpus.shopMonthly || []).filter(row => companyName(row.Shop) === companyName(leader.Shop))
    : [];
  return result(
    "Review cycle answer",
    leader
      ? `${leader.Shop} is the biggest full-year cycle-check candidate in scope: ${fmt(leader["eRank 30D Sales"], "eRank 30D Sales")} current eRank 30-day sales, ${fmt(leader["Review Corpus 365D"], "Review Corpus 365D")} reviews in the latest 365 days, and ${fmt(leader["Review Corpus Months Covered"], "Review Corpus Months Covered")} months covered.`
      : "No full-year review-cycle candidates matched that scope.",
    [
      `${fmt(corpus.totalReviews, "Review Corpus Count")} total SQL review records are available, from ${corpus.earliestReviewISO || "unknown"} through ${corpus.latestReviewISO || "unknown"}.`,
      `${fmt((corpus.seasonalityCandidates || []).length, "Shop Count")} shops have full-year review coverage by the dashboard's criteria.`,
      leader && monthlyRows.length ? `${leader.Shop} peak review month is ${leader["Peak Review Month"] || "unavailable"} with ${fmt(leader["Peak Review Month Count"], "Review Corpus Count")} reviews.` : ""
    ],
    rows,
    [
      "Shop", "eRank 30D Sales", "eRank 7D Sales", "Review Corpus 365D", "Review Corpus 90D",
      "Review Corpus Count", "Review Corpus Earliest ISO", "Review Corpus Latest ISO",
      "Review Corpus Months Covered", "Peak Review Month", "Peak Review Month Count", "Seasonality Index",
      "Active Listings"
    ],
    50
  );
}

function answerVariationQuestion() {
  return result(
    "Styles and variations",
    "The sheet-facing dashboard does not currently expose customer ordered styles, options, or personalization fields. Those values are stored in the private Etsy SQL transaction raw_json, not in this public snapshot.",
    [
      "For MyMaravia orders, Etsy transaction JSON can include SKU, Styles, Base Option, Single Coaster or Set, and Personalization.",
      "Competitor public review scraping generally cannot see the buyer's ordered variation unless Etsy renders it publicly."
    ],
    dashboard.myMaravia?.myListings || [],
    ["Thumbnail", "Product Category", "Product Title", "Best Guess Tags", "Est. Daily Sales", "Recent 180D Sales", "Listing URL"],
    25
  );
}

function answerBuyerMomentQuestion(question) {
  const scoring = dashboard.buyerMoments?.opportunityScoring || {};
  const threshold = numericCell(scoring, "highOpportunityThreshold") || BUYER_MOMENT_HIGH_OPPORTUNITY_SCORE;
  const q = normalizeQuestion(question);
  const tokens = askTokens(question).filter(token => ![
    "buyer", "moment", "moments", "opportunity", "opportunities", "high", "best",
    "build", "gift", "micro", "local", "review", "signal"
  ].includes(token));
  let rows = filterRowsByTokens(buyerMomentCatalog(), tokens);
  if (/high|opportun|best|build|next/.test(q)) {
    rows = rows.filter(row =>
      numericCell(row, "Buyer Moment Opportunity Score") >= threshold ||
      numericCell(row, "High Opportunity Listings") > 0
    );
  }
  if (/local|review|signal/.test(q)) {
    rows = rows.filter(row => numericCell(row, "Local Review Signal Listings") > 0);
  }
  rows = rows.sort((a, b) =>
    numericCell(b, "Buyer Moment Opportunity Score") - numericCell(a, "Buyer Moment Opportunity Score") ||
    numericCell(b, "High Opportunity Listings") - numericCell(a, "High Opportunity Listings") ||
    numericCell(b, "Local Review Signal Listings") - numericCell(a, "Local Review Signal Listings") ||
    String(a["Buyer Moment"]).localeCompare(String(b["Buyer Moment"]))
  );
  const leader = rows[0];
  if (!leader) {
    return result("Buyer moment answer", "No buyer-moment opportunity rows matched that question.");
  }
  return result(
    "Buyer moment answer",
    `${leader["Buyer Moment"]} is the strongest matching buyer moment at ${fmt(leader["Buyer Moment Opportunity Score"], "Buyer Moment Opportunity Score")} opportunity score, with ${fmt(leader["High Opportunity Listings"], "Listing Count")} high-opportunity listings.`,
    [
      `${fmt(scoring.listingMatches || 0, "Listing Count")} buyer-moment listing matches are scored; ${fmt(scoring.highOpportunityListingMatches || 0, "Listing Count")} clear the ${fmt(threshold, "Buyer Moment Opportunity Score")} high-opportunity threshold.`,
      `${fmt(scoring.listingMatchesWithLocalReviewSignal || 0, "Listing Count")} scored rows have local review signal.`,
      scoring.source || "Score blends rank, review velocity, engagement, shop strength, moment fit, category fit, and MyMaravia build fit."
    ],
    rows,
    [
      "Buyer Moment", "Parent Buyer Moment", "Source Run", "Moment Timeframe",
      "Buyer Moment Opportunity Score", "Opportunity Band", "High Opportunity Listings",
      "Local Review Signal Listings", "Top Opportunity Shop", "Top Opportunity Listing", "Buyer Moment Tags"
    ],
    40
  );
}

function answerSheetQuestion(question) {
  const q = normalizeQuestion(question);
  if (!q.trim()) {
    return result("Ask the sheet", "Type a question about listings, shops, categories, buyer moments, sales, coverage, blanks, or opportunities.");
  }
  if (/variation|style|option|personalization|customer ordered|ordered/.test(q)) return answerVariationQuestion(question);
  if (/buyer\s*moment|gift moment|micro moment|moment opportun|seasonal moment|high-opportunity/.test(q)) return answerBuyerMomentQuestion(question);
  if (/mymaravia|my shop|my listings|coverage|gap|missing|need.*build|build queue/.test(q)) return answerMyMaraviaQuestion(question);
  if (/opportun|launch|priority|next|should.*build|best bet/.test(q)) return answerOpportunityQuestion(question);
  if (/blank|generic|source|supplier|local stock|buy blank/.test(q)) return answerSourceQuestion(question);
  if (/cycle|cyclical|season|seasonal|seasonality|year back|full year|annual/.test(q)) return answerSeasonalityQuestion(question);
  if (/trend|moving|movement|momentum|rising|declin|dropping|falling/.test(q)) return answerTrendQuestion(question);
  if (/review|rating|stars/.test(q)) return answerReviewQuestion(question);
  if (/shop|seller|competitor/.test(q)) return answerShopQuestion(question);
  if (/categor|substrate|rollup|family|cluster/.test(q)) return answerCategoryQuestion(question);
  return answerListingQuestion(question);
}

function renderAskResult(answer) {
  const target = document.getElementById("sheet-answer");
  const table = document.getElementById("sheet-answer-table");
  if (!target || !table) return;
  const bullets = (answer.bullets || []).filter(Boolean);
  target.innerHTML = `
    <h3>${escapeHtml(answer.title)}</h3>
    <p>${escapeHtml(answer.summary)}</p>
    ${bullets.length ? `<ul>${bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
  `;
  if (answer.rows && answer.rows.length) {
    renderTable("sheet-answer-table", answer.rows, answer.columns, answer.limit || 25);
  } else {
    table.innerHTML = "";
  }
}

function submitSheetQuestion() {
  const input = document.getElementById("sheet-question");
  const question = input?.value || "";
  renderAskResult(answerSheetQuestion(question));
}

function renderRaw() {
  const select = document.getElementById("raw-select");
  const key = select.value;
  renderTable("raw-table", rawPreviewRows(key), rawPreviewColumns(key));
}

function activateView(viewId) {
  const view = document.getElementById(viewId);
  if (!view) return;
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach(section => {
    section.classList.toggle("active", section.id === viewId);
  });
  window.dispatchEvent(new Event("resize"));
  if (viewId === "listings") renderListings();
  requestAnimationFrame(updateAllBottomScrollbars);
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
      activateView(button.dataset.view);
    });
  });
}

function initRawSelect() {
  const select = document.getElementById("raw-select");
  Object.keys(dashboard.rawPreviews || {}).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key.replaceAll("_", " ");
    select.appendChild(option);
  });
  select.addEventListener("change", renderRaw);
  renderRaw();
}

function initProductionFilter() {
  const select = document.getElementById("production-filter");
  const selected = select.value;
  select.innerHTML = `<option value="">All production methods</option>`;
  const counts = new Map();
  getListingRows().forEach(row => {
    const tag = row["Production Tag"] || "Unclassified";
    counts.set(tag, (counts.get(tag) || 0) + 1);
  });
  Object.entries(reviewListingManifest()?.productionTagCounts || {}).forEach(([tag, count]) => {
    counts.set(tag, (counts.get(tag) || 0) + Number(count || 0));
  });
  [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([tag, count]) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = `${tag} (${count})`;
      select.appendChild(option);
    });
  if ([...select.options].some(option => option.value === selected)) {
    select.value = selected;
  }
}

function initListingSubstrateFilter() {
  const select = document.getElementById("substrate-filter");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = `<option value="">All product substrates</option>`;
  const counts = new Map();
  getListingRows().forEach(row => {
    const category = String(row["Product Substrate Category"] || row["Product Category"] || "Uncategorized");
    counts.set(category, (counts.get(category) || 0) + 1);
  });
  Object.entries(reviewListingManifest()?.categoryCounts || {}).forEach(([category, count]) => {
    counts.set(category, (counts.get(category) || 0) + Number(count || 0));
  });
  [...counts.entries()]
    .filter(([category]) => category)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([category, count]) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = `${category} (${count})`;
      select.appendChild(option);
    });
  if ([...select.options].some(option => option.value === selected)) {
    select.value = selected;
  }
}

function syncListingTimeframeInputs() {
  const preset = document.getElementById("listing-timeframe-preset")?.value || "";
  const startInput = document.getElementById("listing-timeframe-start");
  const endInput = document.getElementById("listing-timeframe-end");
  const definition = listingTimeframePresetDefinition(preset);
  if (!startInput || !endInput || !definition || preset === LISTING_TIMEFRAME_CUSTOM_ID) return;
  startInput.value = definition.start;
  endInput.value = definition.end;
}

function markListingTimeframeCustom() {
  const select = document.getElementById("listing-timeframe-preset");
  if (select && (document.getElementById("listing-timeframe-start")?.value || document.getElementById("listing-timeframe-end")?.value)) {
    select.value = LISTING_TIMEFRAME_CUSTOM_ID;
  }
  selectedListingTimeframePreset = select?.value || "";
}

function initListingTimeframeControls() {
  const preset = document.getElementById("listing-timeframe-preset");
  const startInput = document.getElementById("listing-timeframe-start");
  const endInput = document.getElementById("listing-timeframe-end");
  if (!preset || !startInput || !endInput || preset.dataset.ready === "true") return;
  preset.addEventListener("change", () => {
    selectedListingTimeframePreset = preset.value;
    syncListingTimeframeInputs();
    renderListings();
  });
  [startInput, endInput].forEach(input => {
    input.addEventListener("input", () => {
      markListingTimeframeCustom();
      scheduleRenderListings();
    });
  });
  preset.dataset.ready = "true";
}

function initListingFilters() {
  initProductionFilter();
  initListingSubstrateFilter();
  initListingTimeframeControls();
}

function initComparisonFilters() {
  const categorySelect = document.getElementById("comparison-category-filter");
  const productionSelect = document.getElementById("comparison-production-filter");
  const categoryCounts = new Map();
  const productionCounts = new Map();

  getListingRows().forEach(row => {
    const category = comparisonCategory(row);
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    const production = row["Production Tag"] || "Unclassified";
    productionCounts.set(production, (productionCounts.get(production) || 0) + 1);
  });

  if (categorySelect && categorySelect.dataset.ready !== "true") {
    [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .forEach(([category, count]) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = `${category} (${count})`;
        categorySelect.appendChild(option);
      });
    categorySelect.dataset.ready = "true";
  }

  if (productionSelect && productionSelect.dataset.ready !== "true") {
    [...productionCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .forEach(([tag, count]) => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = `${tag} (${count})`;
        productionSelect.appendChild(option);
      });
    productionSelect.dataset.ready = "true";
  }

  ["comparison-category-filter", "comparison-production-filter", "comparison-sort", "comparison-search"].forEach(id => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener("input", renderCategoryWorkspace);
    element.addEventListener("change", renderCategoryWorkspace);
    element.dataset.bound = "true";
  });
}

function initMyMaraviaFilters() {
  const categorySelect = document.getElementById("my-category-filter");
  if (!categorySelect) return;

  const existingValues = new Set([...categorySelect.options].map(option => option.value));
  (dashboard.myMaravia?.categories || [])
    .map(row => row["Product Category"])
    .filter(Boolean)
    .forEach(category => {
      if (existingValues.has(category)) return;
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
      existingValues.add(category);
    });

  [
    "my-category-filter", "my-status-filter", "my-long-tail-search",
    "my-listing-status-filter", "my-listing-state-filter", "my-listing-search"
  ].forEach(id => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener("input", renderMyMaravia);
    element.addEventListener("change", renderMyMaravia);
    element.dataset.bound = "true";
  });
}

function initMarketControlFilters() {
  const segmentSelect = document.getElementById("market-segment-filter");
  if (!segmentSelect) return;

  if (segmentSelect.dataset.ready !== "true") {
    marketSegmentCategories().forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      segmentSelect.appendChild(option);
    });
    segmentSelect.dataset.ready = "true";
  }

  const segment = activeMarketSegment();
  if (segment) segmentSelect.value = segment;

  ["market-segment-filter", "market-segment-sort", "market-segment-search"].forEach(id => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener("input", () => {
      if (id === "market-segment-filter") selectedMarketSegment = element.value;
      renderMarketControl();
    });
    element.addEventListener("change", () => {
      if (id === "market-segment-filter") selectedMarketSegment = element.value;
      renderMarketControl();
    });
    element.dataset.bound = "true";
  });
}

function initCompanyProfile() {
  const allCompanies = companyStats();
  if (!selectedCompany) {
    selectedCompany = allCompanies.has("MyMaravia") ? "MyMaravia" : companyOptions()[0]?.name || "";
  }
  renderCompanyOptions();

  const select = document.getElementById("company-select");
  if (select.dataset.bound !== "true") {
    select.addEventListener("change", () => {
      selectCompanyProfile(select.value, { searchValue: "" });
    });
    select.dataset.bound = "true";
  }

  const search = document.getElementById("company-search");
  if (search && search.dataset.bound !== "true") {
    search.addEventListener("input", renderCompanySuggestions);
    search.addEventListener("focus", renderCompanySuggestions);
    search.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        hideCompanySuggestions();
      }
      if (event.key === "Enter") {
        const firstSuggestion = companySearchSuggestions(search.value)[0];
        if (!firstSuggestion) return;
        event.preventDefault();
        selectCompanyProfile(firstSuggestion.name, { searchValue: firstSuggestion.name });
      }
    });
    search.dataset.bound = "true";
  }

  if (document.body.dataset.companyLinksBound !== "true") {
    document.addEventListener("click", event => {
      if (!event.target.closest(".company-search-wrap")) {
        hideCompanySuggestions();
      }

      const companyTarget = event.target.closest(".company-link");
      if (companyTarget) {
        openCompanyProfile(companyTarget.dataset.company || companyTarget.textContent);
        return;
      }

      const productionTarget = event.target.closest(".production-link");
      if (productionTarget) {
        selectedCompanyProduction = productionTarget.dataset.production || productionTarget.textContent || "";
        renderCompanyProfile();
        document.getElementById("company-listings")?.scrollIntoView({ block: "start" });
        return;
      }

      const cycleTarget = event.target.closest(".cycle-link");
      if (cycleTarget) {
        openListingCycle(cycleTarget.dataset.cycleKey);
      }
    });
    document.body.dataset.companyLinksBound = "true";
  }

  const clearProduction = document.getElementById("company-production-clear");
  if (clearProduction && clearProduction.dataset.bound !== "true") {
    clearProduction.addEventListener("click", () => {
      selectedCompanyProduction = "";
      renderCompanyProfile();
    });
    clearProduction.dataset.bound = "true";
  }

  renderCompanyProfile();
}

function initAsk() {
  const input = document.getElementById("sheet-question");
  const submit = document.getElementById("sheet-question-submit");
  if (!input || !submit) return;
  if (submit && submit.dataset.bound !== "true") {
    submit.addEventListener("click", submitSheetQuestion);
    submit.dataset.bound = "true";
  }
  if (input && input.dataset.bound !== "true") {
    input.addEventListener("keydown", event => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        submitSheetQuestion();
      }
    });
    input.dataset.bound = "true";
  }
  document.querySelectorAll(".ask-actions .prompt-button[data-question]").forEach(button => {
    if (button.dataset.bound === "true") return;
    button.addEventListener("click", () => {
      const question = button.dataset.question || "";
      if (input) input.value = question;
      renderAskResult(answerSheetQuestion(question));
    });
    button.dataset.bound = "true";
  });
}

function renderAll() {
  document.getElementById("snapshot-note").innerHTML =
    `${escapeHtml(dashboard.meta.source)} Generated ${escapeHtml(dashboard.meta.generatedAt)} from cache modified ${escapeHtml(dashboard.meta.sourceWorkbookModifiedAt)}.`;
  document.getElementById("workbook-link").href = dashboard.meta.workbookUrl;
  renderOpportunity();
  initMyMaraviaFilters();
  renderMyMaravia();
  initMarketControlFilters();
  renderMarketControl();
  renderMetrics();
  renderStatusTable("latest-ok", dashboard.automation.latestOk, ["Status", "Run Timestamp", "Pipeline / Stage", "Automation Version", "eRank Sales Date", "Next Action"]);
  renderStatusTable("latest-problem", dashboard.automation.latestProblem, ["Status", "Run Timestamp", "Pipeline / Stage", "Blocker / Issue", "Next Action"]);
  renderOverallChart();
  renderImportChart();
  renderMarketTrend();
  renderTopShops();
  initComparisonFilters();
  renderCategoryWorkspace();
  renderBar("demand-intent-chart", dashboard.comparison.demandIntentRollup || [], "Total Est. 30D Sales", "Demand Intent Cluster", 20, "#0f766e");
  renderTable("demand-intent-table", dashboard.comparison.demandIntentRollup, ["Demand Intent Cluster", "Total Est. 30D Sales", "Listing Count", "Shop Count", "Top Substrates"], 40);
  renderLineByGroup("shop-trend-chart", dashboard.comparison.shopTrendChart || [], "Date", "Daily Sales", "Shop");
  renderTrendTable("shop-trends", dashboard.comparison.shopTrends, ["Shop", "Trend", "Recent Avg Daily Sales", "Prior Avg Daily Sales", "Delta", "Delta %", "Latest Complete Date", "Latest Complete Daily Sales", "Total Daily Sales In Range", "Days Used", "Review Count", "Sales Per Review Used", "Trend Confidence", "Trend Source"], 120);
  initCompanyProfile();
  initListingFilters();
  renderListings();
  initBuyerMomentFilters();
  renderBuyerMoments();
  renderAskScope();
  initAsk();
  renderBar("category-rollup-chart", dashboard.listing.categoryRollup || [], "Total Est. Daily Sales", "Product Substrate Category", 15, "#1f5fbf");
  renderTable("category-rollup-table", dashboard.listing.categoryRollup, ["Product Substrate Category", "Total Est. Daily Sales", "Total Est. 30D Sales", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Review Corpus Listings", "Listing Count", "Shop Count"], 40);
  renderBar("demand-summary-chart", dashboard.listing.demandSummary || [], "Total Est. Daily Sales", "Demand Intent Cluster", 20, "#0f766e");
  renderTable("demand-summary-table", dashboard.listing.demandSummary, ["Demand Intent Cluster", "Total Est. Daily Sales", "Listing Count", "Review Count", "Review Corpus Count", "Review Corpus 90D", "Review Corpus Listings", "Avg Daily Sales / Listing", "Shop Count"], 50);
  renderStatusTable("data-freshness-table", dashboard.operations.dataFreshness || [], ["Status", "Source", "Freshness Read", "Last Updated", "Data Through", "Record Count", "Decision Impact", "Refresh Step"], 40);
  renderStatusTable("taxonomy-quality-table", dashboard.operations.taxonomyQuality || [], ["Status", "Check", "Finding", "Affected Rows", "Example", "Decision Impact", "Next Action"], 40);
  renderTable("coverage-queue", dashboard.operations.coverageQueue, ["Shop", "eRank 7D Sales", "eRank 30D Sales", "Avg Daily Sales (30D)", "Has Tab", "Tab Status", "Review Ledger Rows", "Last Evidence Run", "Last Scrape Status", "Next Action"], 80);
  renderStatusTable("recent-runs", dashboard.automation.recentRuns, ["Status", "Run Timestamp", "Pipeline / Stage", "Automation Version", "Source / Context", "eRank Sales Date", "Counts / Metrics", "Blocker / Issue", "Next Action"], 60);
  renderTable("quality-table", dashboard.market.quality, ["Date", "Raw Rows", "Unique Shops", "Duplicate Shop-Date Pairs", "Raw Market Sales", "Deduped Market Sales", "Potential Inflation", "Likely Partial Final Day", "Source Files"], 120);
  initRawSelect();
}

async function boot() {
  setupTabs();
  const response = await fetch(`assets/data.json?v=${DATA_ASSET_VERSION}`);
  dashboard = await response.json();
  renderAll();
  document.getElementById("top-shop-metric").addEventListener("change", renderTopShops);
  document.getElementById("listing-search").addEventListener("input", scheduleRenderListings);
  document.getElementById("production-filter").addEventListener("change", renderListings);
  document.getElementById("substrate-filter").addEventListener("change", renderListings);
  document.getElementById("listing-sort").addEventListener("change", renderListings);
}

boot().catch(error => {
  document.body.innerHTML = `<main class="shell"><section class="panel"><h1>Dashboard failed to load</h1><p class="subtle">${escapeHtml(error.message)}</p></section></main>`;
});
