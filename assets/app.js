let dashboard;
let selectedCompany = "";
let selectedCompanyProduction = "";
let selectedListingCycleKey = "";
let selectedListingSubstrate = "";
let selectedListingTimeframePreset = "";
let selectedBuyerMomentId = "";
let selectedImportBuyerMomentId = "";
let selectedMarketSegment = "";
let selectedMarketSizeProduct = "";
let selectedNextActionKey = "";
let publicStatus = null;
let nextActionTraceCache = new Map();
let buyerMomentRowsCache = new Map();
let buyerMomentSummariesCache = null;
let buyerMomentCatalogCache = null;
let buyerMomentTopListingRowsCache = null;
let buyerMomentListingCycleRowsCache = new Map();
let customBuyerMomentRange = null;
let reviewMappingGapControlSignature = "";
let reviewShopCoverageControlSignature = "";
const CUSTOM_BUYER_MOMENT_ID = "custom-date-range";
const DATA_ASSET_VERSION = "market-penetration-20260611-3";
const STATUS_ASSET_VERSION = "public-status-20260611-1";
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
const REVIEW_SHOP_COVERAGE_RESULT_LIMIT = 500;
const LISTING_TIMEFRAME_CUSTOM_ID = "custom";
const LISTING_TIMEFRAME_PRESETS = {
  "mothers-day": { label: "Mother's Day season", start: "04-15", end: "05-25" },
  "graduation": { label: "Graduation season", start: "04-15", end: "06-15" },
  "christmas": { label: "Christmas season", start: "11-01", end: "12-31" }
};
let listingRenderTimer = null;
let appliedListingFilters = null;
let listingSearchDirty = false;
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
const reviewShopCoverageState = {
  rows: [],
  loaded: false,
  loading: false,
  error: ""
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
  "Affected Rows", "Affected Shops", "Record Count", "Review 90D", "Review 365D",
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
  "Primary Market Daily Sales", "Primary Market 30D Sales", "Broad Market Daily Sales",
  "Broad Market 30D Sales", "Segment Market Daily Sales", "Segment Market 30D Sales",
  "Build Queue Daily Sales", "Build Queue 30D Sales", "Listing Evidence Daily Sales",
  "Open Long Tails", "Evidence Listings", "Tracked Shops", "My Listing Count", "Weighted Coverage %",
  "Preview Daily Sales", "Preview Listing Count", "Taxonomy Confidence",
  "Last Year Timeframe Estimated Sales", "Last Year Timeframe Avg Daily Sales",
  "Last Year Timeframe Review Count", "Last Year Timeframe Weeks", "Last Year Timeframe Weeks With Demand",
  "Review-Derived Listings", "Full Identity Listings", "Title Gap Listings", "Identity Gap Listings",
  "Action Score", "Expected Daily Sales", "Tag Rows", "Unique Tags Scanned", "Found Within Scan",
  "Not Found Within Scan", "Tag Count", "Tags Found In Scan", "Tags Not In Scan",
  "Best API Rank", "Median Found API Rank", "Search Result Count", "Scan Depth", "Results Scanned",
  "Best Top 20 Tags", "Reviewed Listings", "Competitor Shops", "Competitor Reviews 365D",
  "Competitor Reviews 90D", "Estimated Competitor Orders 365D", "MyMaravia Active Listings",
  "MyMaravia All Listings", "MyMaravia Orders 365D", "MyMaravia Reviews 365D",
  "Estimated Order Share %", "Review Share %", "Reviews 365D", "Reviews 90D", "Total Reviews",
  "Avg Rating", "Signal", "Reviewed Shops", "Resolved Shops", "Open Shops", "Resolved %",
  "Window Complete Shops", "Depth Satisfied Shops", "Empty / Zero Shops", "Partial Shops",
  "Capped Shops", "Queued Shops", "Untracked Shops", "Other Status Shops",
  "Recent Target Runs", "Recent Discovery Output Rows", "Recent Shops Promoted",
  "Recent Review Rows Written", "Recent Rate Limit Errors", "Candidate Shop IDs",
  "Discovery Output Rows", "Shops Promoted", "Review Rows Written", "Rate Limit Errors", "Seconds"
]);

const defaultDailySalesSortColumns = [
  "Expected Daily Sales",
  "Last Year Timeframe Avg Daily Sales",
  "Moment Avg Daily Sales",
  "Estimated Daily Sales",
  "Market Daily Sales",
  "Segment Daily Sales",
  "Category Est. Daily Sales",
  "Total Est. Daily Sales",
  "Est. Daily Sales",
  "Recent Daily Sales",
  "Top Open Daily Sales",
  "Best Listing Daily",
  "Covered Competitor Daily",
  "Leader Gap Daily",
  "Top Competitor Daily Sales",
  "Competing Daily Sales",
  "My Category Daily Sales",
  "My Daily Sales",
  "Tracked Est. Daily Sales",
  "Current Market Daily Sales",
  "Current Avg Daily Sales",
  "Avg Daily Sales (30D)",
  "Recent Avg Daily Sales",
  "Latest Complete Daily Sales",
  "Recent Matching-Shop Avg Daily Sales",
  "Daily Sales"
];

const defaultWeeklySalesSortColumns = [
  "Estimated Weekly Sales",
  "Recent Weekly Sales",
  "Prior Weekly Sales",
  "Peak Weekly Sales",
  "Moment Avg Weekly Sales"
];

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
  "Change Type", "Decision Impact", "Previous Snapshot", "Current Snapshot",
  "Resolved State", "Resolution Status", "Resolution Read", "Resolved At", "Resolved Listing URL",
  "Cycle Confidence", "Weekly Trend", "Buyer Moment", "Moment Timeframe", "Moment Window", "Matched Cues",
  "Moment Source", "Buyer Moment Tags", "Opportunity Band", "MyMaravia Build Read", "Build Fit Reason",
  "Local Review Signal", "Build Fit Segment", "Top Opportunity Listing", "Top Opportunity Shop", "Top Listing", "Top Shop", "Target Category", "My Listing",
  "Competing Listing", "Competing Shop", "Competing Tags", "My Listing URL", "Competitor Listing URL",
  "Best Listing", "Top Competitor Row", "Repeated Match Cues", "Cue / Action",
  "Evidence", "Next Edit", "Market Control Read", "Last Year Timeframe Window", "Last Year Timeframe Signal",
  "Action", "Product / Listing", "Source Signal", "Next Step", "Product / Segment",
  "Market Size Source", "Market Size Read", "Product Family", "Taxonomy Evidence",
  "Snapshot Read", "Finding", "Segment", "Replacement Read", "Possible Replacement Listing",
  "Replacement Match Tokens", "Replacement URL", "Example Dropped Listing", "Dropped Listing IDs",
  "Recommended Action", "Recovery Decision", "Why It Matters", "Evidence Read", "First Listing IDs",
  "Top Listing Titles", "Open First Listing URL", "Batch Action", "Market Read", "Matched Terms",
  "Execution Read", "Suggested Final Decision", "Decision Fields To Fill", "No-Write Confirmation Gate",
  "Execution Step", "Current Etsy Listing URL", "Replacement Lead", "Decision Read",
  "Validation Read", "Allowed Decision Statuses", "Allowed Final Decisions", "Import Check",
  "Candidate Final Decision", "Final Decision Options", "Decision Status Options",
  "Candidate Reason", "Review Prompt", "Decision Guard", "Market Evidence", "TSV Fill Reminder",
  "Package Title", "Recommended Path", "Top Template Title", "Top Template URL", "Unresolved Facts",
  "Unsafe Reuse Warning", "No Write Gate", "Suggested Decision", "Suggestion Rationale",
  "Template Starter", "Starter Brief", "Required Facts", "Market Evidence To Review", "Evidence URL",
  "Do Not Reuse", "Next Gate", "Source Audit Checklist", "Fact Capture Fields", "Evidence Targets",
  "Reject If", "Decision Output", "Editable Fields", "Allowed Audit Statuses", "Source Audit URL",
  "Source Queries", "Primary Source Targets", "Field Fill Plan", "Acceptance Criteria",
  "Adjacent Evidence Link", "Adjacent Evidence Read", "Suggested Fact Status", "Needs Brandon Decision",
  "Tag", "Rank Read", "Suggested Tag Action", "Rank Caveat", "Search Method", "Method"
]);

const thumbnailColumns = new Set(["Thumbnail", "Listing Thumbnail", "Market Thumbnail", "Top Competitor Thumbnail", "My Thumbnail", "Competitor Thumbnail"]);
const sourceLinkColumns = new Set(["Blank / Generic Sources"]);
const companyColumns = new Set(["Shop", "Market Shop", "Top Shop"]);
const badgeColumns = new Set(["Conquest Status", "Market State", "Opportunity Band", "MyMaravia Build Read", "Local Review Signal", "Action Type", "Confidence", "Change Type", "Investigation Status", "Resolution Status", "Resolved State", "Recovery Status", "Batch Status", "Market Signal", "Execution Status", "Decision Fill State", "Template Readiness", "Top Match Confidence", "Suggested Decision", "Audit Status", "Research Status", "Rank Status"]);
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

async function loadPublicStatus() {
  try {
    const response = await fetch(`assets/status.json?v=${STATUS_ASSET_VERSION}`, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

function compactCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "unknown";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(number);
}

function renderPublicStatus() {
  const target = document.getElementById("pipeline-status-card");
  if (!target) return;
  if (!publicStatus) {
    target.hidden = true;
    return;
  }
  const mapping = publicStatus.reviewListingMapping || {};
  const backlog = publicStatus.coverageBacklog || {};
  const active = publicStatus.activeDeepening || {};
  const publish = publicStatus.publish || {};
  const activeRunText = publicStatus.activeWriterAlive ? "Running" : "Idle";
  const changedRows = active.reviewRowsChanged ? `${compactCount(active.reviewRowsChanged)} rows changed` : "No active deepening rows";
  const shopProgress = active.queuedCandidates
    ? `${compactCount(active.shopsCompleted)} / ${compactCount(active.queuedCandidates)} shops`
    : active.shopsCompleted
      ? `${compactCount(active.shopsCompleted)} shops`
      : "No active shop count";
  target.hidden = false;
  target.innerHTML = `
    <div class="pipeline-status-copy">
      <div class="status-kicker">Scrape heartbeat</div>
      <strong>${escapeHtml(activeRunText)} · ${escapeHtml(publicStatus.currentPhase || "unknown")}</strong>
      <span>${escapeHtml(publicStatus.nextSafeAction || "")}</span>
    </div>
    <div class="pipeline-status-grid">
      <div><span>Ledger reviews</span><strong>${compactCount(publicStatus.reviewLedgerCount)}</strong></div>
      <div><span>Rollup</span><strong>${escapeHtml(publicStatus.rollupFreshnessStatus || "unknown")}</strong></div>
      <div><span>Mapping gaps</span><strong>${compactCount(mapping.rowsMissingListingMetadata || 0)}</strong></div>
      <div><span>Queued backlog</span><strong>${compactCount(backlog.queuedTotal || 0)}</strong></div>
      <div><span>Active batch</span><strong>${escapeHtml(shopProgress)}</strong></div>
      <div><span>Batch rows</span><strong>${escapeHtml(changedRows)}</strong></div>
      <div><span>Public data reviews</span><strong>${compactCount(publish.lastSuccessfulPublicDataReviewCount)}</strong></div>
      <div><span>Status updated</span><strong>${escapeHtml(publicStatus.generatedAt || "unknown")}</strong></div>
    </div>
  `;
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
  return `<a class="cycle-link${active}" href="${escapeHtml(listingCycleUrl(key))}" data-cycle-key="${escapeHtml(key)}">Open graph</a>`;
}

function listingCycleUrl(cycleKey) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", "listings");
  writeListingUrlState(url.searchParams);
  setUrlParam(url.searchParams, "listCycle", cycleKey);
  url.hash = "listing-cycle-panel";
  return `${url.pathname}${url.search}${url.hash}`;
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

function hasMetricValue(rows, column) {
  return rows.some(row => {
    const value = row[column];
    if (value === null || value === undefined || value === "") return false;
    return Number.isFinite(Number(String(value).replace(/[$,%]/g, "").replace(/,/g, "")));
  });
}

function defaultSalesSortColumn(rows, columns) {
  const cols = new Set(columns || Object.keys(rows[0] || {}));
  const dailyColumn = defaultDailySalesSortColumns.find(column => cols.has(column) && hasMetricValue(rows, column));
  if (dailyColumn) return dailyColumn;
  return defaultWeeklySalesSortColumns.find(column => cols.has(column) && hasMetricValue(rows, column)) || "";
}

function sortRowsForDefaultSales(rows, columns, options = {}) {
  if (options.preserveOrder) return rows;
  const column = options.sortColumn || defaultSalesSortColumn(rows, columns);
  if (!column) return rows;
  return rows.slice().sort((a, b) => {
    const delta = numericCell(b, column) - numericCell(a, column);
    if (delta) return delta;
    return numericCell(a, "Priority") - numericCell(b, "Priority") ||
      numericCell(a, "Overall Rank") - numericCell(b, "Overall Rank") ||
      numericCell(a, "Launch Priority") - numericCell(b, "Launch Priority") ||
      String(a.Shop || a["Market Shop"] || "").localeCompare(String(b.Shop || b["Market Shop"] || "")) ||
      String(a["Product Title"] || a["Market Long Tail"] || a["Product / Listing"] || "").localeCompare(String(b["Product Title"] || b["Market Long Tail"] || b["Product / Listing"] || ""));
  });
}

function renderTable(targetId, rows, columns = null, limit = null, options = {}) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const baseRows = Array.isArray(rows) ? rows : [];
  const requestedCols = columns || Object.keys(baseRows[0] || {});
  const sortedRows = sortRowsForDefaultSales(baseRows, requestedCols, options);
  const data = limit ? sortedRows.slice(0, limit) : sortedRows;
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
        : targetId === "listing-state-recovery-batches-table" && col === "Copy Handoff"
          ? recoveryBatchHandoffCell(row)
        : targetId === "company-production" && col === "Production Tag"
          ? productionLinkCell(row[col])
        : targetId === "company-snapshot" && col === "Listing Detail"
          ? companySidecarDetailCell(row)
        : targetId === "review-shop-coverage-details" && col === "Listing Detail"
          ? reviewShopListingDetailCell(row)
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
  const cls = /blocked|partial|error|fail|fix|issue|investigate|unavailable|missing|stale/i.test(text)
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

function renderTrendTable(targetId, rows, columns, limit, options = {}) {
  const baseRows = Array.isArray(rows) ? rows : [];
  const cols = columns || Object.keys(baseRows[0] || {});
  const mapped = sortRowsForDefaultSales(baseRows, cols, options).map(row => ({ ...row, Trend: trendBadge(row.Trend) }));
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

function listingControlState() {
  const search = (document.getElementById("listing-search")?.value || "").trim();
  return {
    search,
    query: search.toLowerCase(),
    production: document.getElementById("production-filter")?.value || "",
    substrate: document.getElementById("substrate-filter")?.value || "",
    sort: document.getElementById("listing-sort")?.value || "",
    timeframe: document.getElementById("listing-timeframe-preset")?.value || "",
    start: document.getElementById("listing-timeframe-start")?.value || "",
    end: document.getElementById("listing-timeframe-end")?.value || ""
  };
}

function listingFilterSignature(filters) {
  return JSON.stringify([
    filters.search || "",
    filters.production || "",
    filters.substrate || "",
    filters.sort || "",
    filters.timeframe || "",
    filters.start || "",
    filters.end || ""
  ]);
}

function updateListingSearchButtonState() {
  const button = document.getElementById("listing-search-submit");
  if (!button) return;
  button.classList.toggle("needs-apply", listingSearchDirty);
}

function ensureAppliedListingFilters() {
  if (!appliedListingFilters) appliedListingFilters = listingControlState();
  return appliedListingFilters;
}

function setAppliedListingFiltersFromControls() {
  appliedListingFilters = listingControlState();
  selectedListingSubstrate = appliedListingFilters.substrate;
  selectedListingTimeframePreset = appliedListingFilters.timeframe;
  listingSearchDirty = false;
  updateListingSearchButtonState();
  return appliedListingFilters;
}

function markListingSearchDirty() {
  const currentFilters = listingControlState();
  const appliedFilters = appliedListingFilters || currentFilters;
  listingSearchDirty = listingFilterSignature(currentFilters) !== listingFilterSignature(appliedFilters);
  updateListingSearchButtonState();
}

function applyListingSearch({ updateUrl = true } = {}) {
  window.clearTimeout(listingRenderTimer);
  setAppliedListingFiltersFromControls();
  if (updateUrl) updateViewUrl("listings");
  renderListings();
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
  const isMyApiRow = row =>
    companyName(row.Shop).toLowerCase() === "mymaravia" &&
    /etsy api|mymaravia etsy/i.test(String(row.Source || row["Evidence Confidence"] || ""));
  const shouldPreferIncoming = (existing, incoming) => isMyApiRow(incoming) && !isMyApiRow(existing);
  rows.forEach(row => {
    const key = `${row.Shop || ""}|${row["Listing URL"] || row["Product Title"] || ""}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...row });
      return;
    }
    const preferIncoming = shouldPreferIncoming(existing, row);
    const base = preferIncoming ? row : existing;
    const secondary = preferIncoming ? existing : row;
    const merged = { ...base };
    Object.entries(secondary).forEach(([column, value]) => {
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
  const [payload, row] = await Promise.all([
    ensureReviewCycleChunk(parsed.chunkIndex),
    ensureReviewListingRowForCycle(cycleKey, parsed)
  ]);
  const encoded = payload.rows?.[parsed.rowIndex]?.[0] || "";
  return { row, rows: reviewListingCycleWeeks(encoded, manifest, row) };
}

async function ensureReviewListingRowForCycle(cycleKey, parsed) {
  const cached = reviewListingState.rowByCycleKey.get(cycleKey);
  if (cached) return cached;
  const rows = await fetchReviewListingRows(parsed.chunkIndex, { cacheRows: true, trackRows: true });
  rows.forEach(row => {
    if (row["Weekly Cycle Key"]) {
      reviewListingState.rowByCycleKey.set(row["Weekly Cycle Key"], row);
    }
  });
  return reviewListingState.rowByCycleKey.get(cycleKey) || rows[parsed.rowIndex] || {};
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
      target.innerHTML = "";
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
  if (options.updateUrl !== false) {
    updateViewUrl("listings");
  }
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

function listingTimeframePresetDefinition(preset, filters = null) {
  if (preset === "last-30") return last30ListingTimeframePreset();
  if (preset === LISTING_TIMEFRAME_CUSTOM_ID) {
    return {
      label: "Custom range",
      start: filters?.start ?? document.getElementById("listing-timeframe-start")?.value ?? "",
      end: filters?.end ?? document.getElementById("listing-timeframe-end")?.value ?? ""
    };
  }
  return LISTING_TIMEFRAME_PRESETS[preset] || null;
}

function listingMonthDayParts(value) {
  const match = String(value || "").trim().match(/^(\d{2})-(\d{2})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1) return null;
  const maxDay = new Date(Date.UTC(2025, month, 0)).getUTCDate();
  const normalizedDay = Math.min(day, maxDay);
  return {
    month,
    day: normalizedDay,
    normalized: `${String(month).padStart(2, "0")}-${String(normalizedDay).padStart(2, "0")}`
  };
}

function isValidMonthDay(value) {
  const parts = listingMonthDayParts(value);
  return Boolean(parts && parts.normalized === String(value || "").trim());
}

function normalizedMonthDay(value) {
  return listingMonthDayParts(value)?.normalized || "";
}

function monthDayToIso(monthDay, year) {
  const normalized = normalizedMonthDay(monthDay);
  return normalized ? `${year}-${normalized}` : "";
}

function selectedListingTimeframeWindow(filters = null) {
  const preset = filters?.timeframe || selectedListingTimeframePreset || document.getElementById("listing-timeframe-preset")?.value || "";
  if (!preset) return null;
  const definition = listingTimeframePresetDefinition(preset, filters);
  if (!definition) return null;
  const startMonthDay = normalizedMonthDay(definition.start);
  const endMonthDay = normalizedMonthDay(definition.end);
  if (!startMonthDay || !endMonthDay) {
    return {
      invalid: true,
      label: definition.label || "Custom range",
      display: "Enter valid MM-DD dates"
    };
  }
  const targetYear = listingReferenceDate().getUTCFullYear() - 1;
  const endYear = endMonthDay < startMonthDay ? targetYear + 1 : targetYear;
  const range = {
    start: monthDayToIso(startMonthDay, targetYear),
    end: monthDayToIso(endMonthDay, endYear)
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

function listingHasTimeframeSignal(row) {
  const signal = String(row["Last Year Timeframe Signal"] || "");
  if (signal.startsWith("Loading")) return true;
  return numericCell(row, "Last Year Timeframe Estimated Sales") > 0 ||
    numericCell(row, "Last Year Timeframe Review Count") > 0 ||
    numericCell(row, "Last Year Timeframe Weeks With Demand") > 0;
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
  const sort = forcedSort || document.getElementById("buyer-moment-sort")?.value || "velocity-desc";
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
      updateViewUrl("buyer-moments");
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
  updateViewUrl("buyer-moments");
}

function clearCustomRange() {
  customBuyerMomentRange = null;
  selectedBuyerMomentId = "";
  const startInput = document.getElementById("buyer-moment-range-start");
  const endInput = document.getElementById("buyer-moment-range-end");
  if (startInput) startInput.value = "";
  if (endInput) endInput.value = "";
  renderBuyerMoments();
  updateViewUrl("buyer-moments");
}

function handleBuyerMomentFilterChange() {
  renderBuyerMoments();
  updateViewUrl("buyer-moments");
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
    element.addEventListener(eventName, handleBuyerMomentFilterChange);
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

function marketSizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function marketSizeTokens(value) {
  return marketSizeText(value).split(/\s+/).filter(token => token.length > 1);
}

function marketSizeRowText(row) {
  if (row.__marketSizeText) return row.__marketSizeText;
  const text = marketSizeText(Object.keys(row || {})
    .filter(key => !key.startsWith("__"))
    .map(key => row[key])
    .join(" "));
  Object.defineProperty(row, "__marketSizeText", {
    value: text,
    configurable: true,
    writable: true
  });
  return text;
}

function marketSizeMatchesTokens(row, tokens, requireAll = true) {
  if (!tokens.length) return true;
  const text = marketSizeRowText(row);
  return requireAll
    ? tokens.every(token => text.includes(token))
    : tokens.some(token => text.includes(token));
}

function marketSizeCategoryName(row) {
  return String(
    row?.["Product / Segment"] ||
    row?.["Product Substrate Category"] ||
    row?.["Product Category"] ||
    row?.["Target Category"] ||
    ""
  ).trim();
}

function marketSizeEntry(entries, name) {
  const product = String(name || "Uncategorized").trim() || "Uncategorized";
  if (!entries.has(product)) {
    entries.set(product, {
      "Product / Segment": product,
      "Category Aliases": "",
      "Primary Market Daily Sales": 0,
      "Primary Market 30D Sales": 0,
      "Broad Market Daily Sales": 0,
      "Broad Market 30D Sales": 0,
      "Segment Market Daily Sales": 0,
      "Segment Market 30D Sales": 0,
      "Build Queue Daily Sales": 0,
      "Build Queue 30D Sales": 0,
      "Listing Evidence Daily Sales": 0,
      "Evidence Listings": 0,
      "Tracked Shops": 0,
      "My Daily Sales": 0,
      "My Market Share %": null,
      "Coverage %": null,
      "Weighted Coverage %": null,
      "Open Long Tails": 0,
      "Top Open Daily Sales": 0,
      "Top Open Long Tail": "",
      "Top Competitor Daily Sales": 0,
      "Leader Gap Daily": 0,
      "Market Size Source": "",
      "Market Size Read": "",
      __shops: new Set(),
      __texts: new Set(),
      __sources: new Set(),
      __listingCount: 0,
      __myListingDaily: 0
    });
  }
  return entries.get(product);
}

function marketSizeAddText(entry, ...values) {
  values.filter(Boolean).forEach(value => entry.__texts.add(String(value)));
}

function marketSizeProductRowsRaw() {
  const entries = new Map();
  (dashboard.listing?.categoryRollup || []).forEach(row => {
    const entry = marketSizeEntry(entries, row["Product Substrate Category"] || row["Product Category"]);
    entry["Broad Market Daily Sales"] = Math.max(entry["Broad Market Daily Sales"], numericCell(row, "Total Est. Daily Sales"));
    entry["Broad Market 30D Sales"] = Math.max(entry["Broad Market 30D Sales"], numericCell(row, "Total Est. 30D Sales"));
    entry["Evidence Listings"] = Math.max(entry["Evidence Listings"], numericCell(row, "Listing Count"));
    entry["Tracked Shops"] = Math.max(entry["Tracked Shops"], numericCell(row, "Shop Count"));
    entry["Review Corpus Count"] = numericCell(row, "Review Corpus Count");
    entry["Review Corpus 90D"] = numericCell(row, "Review Corpus 90D");
    entry["Review Corpus 365D"] = numericCell(row, "Review Corpus 365D");
    entry.__sources.add("Category rollup");
    marketSizeAddText(entry, Object.values(row).join(" "));
  });

  (dashboard.myMaravia?.categories || []).forEach(row => {
    const entry = marketSizeEntry(entries, row["Product Category"]);
    entry["Category Aliases"] ||= row["Category Aliases"] || "";
    entry["Segment Market Daily Sales"] = Math.max(entry["Segment Market Daily Sales"], numericCell(row, "Market Daily Sales"));
    entry["Segment Market 30D Sales"] = Math.max(entry["Segment Market 30D Sales"], numericCell(row, "Market Daily Sales") * 30);
    entry["My Daily Sales"] = Math.max(entry["My Daily Sales"], numericCell(row, "My Category Daily Sales"));
    entry["My Market Share %"] = row["My Market Share %"] ?? entry["My Market Share %"];
    entry["Coverage %"] = row["Coverage %"] ?? entry["Coverage %"];
    entry["Weighted Coverage %"] = row["Coverage %"] ?? entry["Weighted Coverage %"];
    entry["Top Open Daily Sales"] = Math.max(entry["Top Open Daily Sales"], numericCell(row, "Top Open Daily Sales"));
    entry["Top Open Long Tail"] ||= row["Top Open Long Tail"] || "";
    entry["Top Competitor Daily Sales"] = Math.max(entry["Top Competitor Daily Sales"], numericCell(row, "Top Competitor Daily Sales"));
    entry["Leader Gap Daily"] = Math.max(entry["Leader Gap Daily"], numericCell(row, "Leader Gap Daily"));
    entry["Active Listings"] = numericCell(row, "Active Listings");
    entry["MyMaravia Listings"] = numericCell(row, "MyMaravia Listings");
    entry.__sources.add("MyMaravia segment");
    marketSizeAddText(entry, Object.values(row).join(" "));
  });

  (dashboard.myMaravia?.longTailQueue || []).forEach(row => {
    const entry = marketSizeEntry(entries, row["Product Category"]);
    entry["Category Aliases"] ||= row["Category Aliases"] || "";
    entry["Build Queue Daily Sales"] += numericCell(row, "Market Daily Sales");
    entry["Build Queue 30D Sales"] += numericCell(row, "Market 30D Sales");
    entry["Open Long Tails"] += row.Status === "Needs build" ? 1 : 0;
    if (numericCell(row, "Market Daily Sales") > numericCell(entry, "Top Open Daily Sales")) {
      entry["Top Open Daily Sales"] = numericCell(row, "Market Daily Sales");
      entry["Top Open Long Tail"] = row["Market Long Tail"] || "";
    }
    if (row["Market Shop"]) entry.__shops.add(row["Market Shop"]);
    entry.__sources.add("Build queue");
    marketSizeAddText(entry, Object.values(row).join(" "));
  });

  getListingRows().forEach(row => {
    const category = marketSizeCategoryName(row);
    if (!category) return;
    const entry = marketSizeEntry(entries, category);
    entry["Listing Evidence Daily Sales"] += numericCell(row, "Est. Daily Sales");
    entry.__listingCount += 1;
    entry.__myListingDaily += /mymaravia/i.test(String(row.Shop || row.Source || "")) ? numericCell(row, "Est. Daily Sales") : 0;
    if (row.Shop) entry.__shops.add(row.Shop);
    entry.__sources.add("Listing evidence");
    marketSizeAddText(entry, Object.values(row).join(" "));
  });

  return [...entries.values()].map(entry => {
    const broad = numericCell(entry, "Broad Market Daily Sales");
    const segment = numericCell(entry, "Segment Market Daily Sales");
    const build = numericCell(entry, "Build Queue Daily Sales");
    const listing = numericCell(entry, "Listing Evidence Daily Sales");
    const primary = segment || broad || build || listing;
    const primary30 = entry["Segment Market 30D Sales"] || entry["Broad Market 30D Sales"] || entry["Build Queue 30D Sales"] || primary * 30;
    const myDaily = Math.max(numericCell(entry, "My Daily Sales"), entry.__myListingDaily);
    const share = entry["My Market Share %"] ?? percentShare(myDaily, primary + myDaily);
    const coverage = entry["Coverage %"] ?? null;
    const read = coverage !== null && numericCell(entry, "Open Long Tails") > 0
      ? "Open build gap"
      : myDaily > 0
        ? "Covered / optimize"
        : primary > 0
          ? "Market exists; no MyMaravia signal"
          : "Evidence only";
    return {
      "Product / Segment": entry["Product / Segment"],
      "Category Aliases": entry["Category Aliases"],
      "Primary Market Daily Sales": Number(primary.toFixed(2)),
      "Primary Market 30D Sales": Math.round(primary30),
      "Broad Market Daily Sales": Number(broad.toFixed(2)),
      "Broad Market 30D Sales": Math.round(numericCell(entry, "Broad Market 30D Sales")),
      "Segment Market Daily Sales": Number(segment.toFixed(2)),
      "Build Queue Daily Sales": Number(build.toFixed(2)),
      "Build Queue 30D Sales": Math.round(numericCell(entry, "Build Queue 30D Sales")),
      "Listing Evidence Daily Sales": Number(listing.toFixed(2)),
      "Evidence Listings": Math.max(numericCell(entry, "Evidence Listings"), entry.__listingCount),
      "Tracked Shops": Math.max(numericCell(entry, "Tracked Shops"), entry.__shops.size),
      "My Daily Sales": Number(myDaily.toFixed(2)),
      "My Market Share %": share,
      "Coverage %": coverage,
      "Open Long Tails": numericCell(entry, "Open Long Tails"),
      "Top Open Daily Sales": numericCell(entry, "Top Open Daily Sales"),
      "Top Open Long Tail": entry["Top Open Long Tail"],
      "Top Competitor Daily Sales": numericCell(entry, "Top Competitor Daily Sales"),
      "Leader Gap Daily": numericCell(entry, "Leader Gap Daily"),
      "Review Corpus Count": numericCell(entry, "Review Corpus Count"),
      "Review Corpus 90D": numericCell(entry, "Review Corpus 90D"),
      "Review Corpus 365D": numericCell(entry, "Review Corpus 365D"),
      "Market Size Source": [...entry.__sources].join(" + "),
      "Market Size Read": read,
      __marketSizeText: marketSizeText([
        entry["Product / Segment"],
        entry["Category Aliases"],
        entry["Top Open Long Tail"],
        [...entry.__texts].join(" ")
      ].join(" "))
    };
  });
}

function marketSizeFilterState() {
  const product = document.getElementById("market-size-product-filter")?.value || selectedMarketSizeProduct || "";
  return {
    product,
    source: document.getElementById("market-size-source-filter")?.value || "",
    sort: document.getElementById("market-size-sort")?.value || "primary-desc",
    search: (document.getElementById("market-size-search")?.value || "").trim(),
    tokens: marketSizeTokens(document.getElementById("market-size-search")?.value || "")
  };
}

function marketSizeEvidenceCategorySet(state) {
  const names = new Set();
  if (state.product) names.add(state.product);
  if (!state.tokens.length) return names;
  const rows = [
    ...(dashboard.myMaravia?.longTailQueue || []),
    ...getListingRows(),
    ...(dashboard.myMaravia?.categories || []),
    ...(dashboard.listing?.categoryRollup || [])
  ];
  let matched = rows.filter(row => marketSizeMatchesTokens(row, state.tokens, true));
  if (!matched.length) matched = rows.filter(row => marketSizeMatchesTokens(row, state.tokens, false));
  matched.forEach(row => {
    const category = marketSizeCategoryName(row);
    if (category) names.add(category);
  });
  return names;
}

function marketSizeSourceMatches(row, source) {
  if (!source) return true;
  if (source === "rollup") return numericCell(row, "Broad Market Daily Sales") > 0;
  if (source === "segment") return numericCell(row, "Segment Market Daily Sales") > 0;
  if (source === "build") return numericCell(row, "Build Queue Daily Sales") > 0;
  if (source === "listing") return numericCell(row, "Evidence Listings") > 0;
  return true;
}

function marketSizeRelevanceScore(row, state) {
  if (!state.tokens.length) return 0;
  const query = marketSizeText(state.search);
  const productText = marketSizeText([
    row["Product / Segment"],
    row["Category Aliases"],
    row["Top Open Long Tail"]
  ].join(" "));
  const fullText = marketSizeRowText(row);
  let score = 0;
  if (query && productText.includes(query)) score += 120;
  if (query && fullText.includes(query)) score += 60;
  if (state.tokens.every(token => productText.includes(token))) score += 80;
  if (state.tokens.every(token => fullText.includes(token))) score += 30;
  score += state.tokens.filter(token => productText.includes(token)).length * 12;
  score += state.tokens.filter(token => fullText.includes(token)).length * 3;
  return score;
}

function marketSizeProductRows(state = marketSizeFilterState()) {
  const categories = marketSizeEvidenceCategorySet(state);
  let rows = marketSizeProductRowsRaw().filter(row => marketSizeSourceMatches(row, state.source));
  if (state.product) {
    rows = rows.filter(row => row["Product / Segment"] === state.product);
  }
  if (state.tokens.length) {
    rows = rows.filter(row => categories.has(row["Product / Segment"]) || marketSizeMatchesTokens(row, state.tokens, true));
  }
  if (state.tokens.length > 1 && !state.product) {
    const strongRows = rows.filter(row => marketSizeRelevanceScore(row, state) >= 100);
    if (strongRows.length) rows = strongRows;
  }
  rows.sort((a, b) => {
    if (state.tokens.length && !state.product) {
      const scoreDelta = marketSizeRelevanceScore(b, state) - marketSizeRelevanceScore(a, state);
      if (scoreDelta) return scoreDelta;
    }
    if (state.sort === "gap-desc") {
      return numericCell(b, "Leader Gap Daily") - numericCell(a, "Leader Gap Daily") ||
        numericCell(b, "Primary Market Daily Sales") - numericCell(a, "Primary Market Daily Sales");
    }
    if (state.sort === "coverage-asc") {
      const coverageA = a["Coverage %"] === null || a["Coverage %"] === undefined ? 999 : numericCell(a, "Coverage %");
      const coverageB = b["Coverage %"] === null || b["Coverage %"] === undefined ? 999 : numericCell(b, "Coverage %");
      return coverageA - coverageB ||
        numericCell(b, "Primary Market Daily Sales") - numericCell(a, "Primary Market Daily Sales");
    }
    if (state.sort === "listings-desc") {
      return numericCell(b, "Evidence Listings") - numericCell(a, "Evidence Listings") ||
        numericCell(b, "Primary Market Daily Sales") - numericCell(a, "Primary Market Daily Sales");
    }
    if (state.sort === "name-asc") {
      return String(a["Product / Segment"]).localeCompare(String(b["Product / Segment"]));
    }
    return numericCell(b, "Primary Market Daily Sales") - numericCell(a, "Primary Market Daily Sales") ||
      String(a["Product / Segment"]).localeCompare(String(b["Product / Segment"]));
  });
  return rows;
}

function marketSizeProductOptions() {
  return marketSizeProductRowsRaw()
    .filter(row => numericCell(row, "Primary Market Daily Sales") > 0 || numericCell(row, "Evidence Listings") > 0)
    .sort((a, b) => numericCell(b, "Primary Market Daily Sales") - numericCell(a, "Primary Market Daily Sales") ||
      String(a["Product / Segment"]).localeCompare(String(b["Product / Segment"])))
    .map(row => row["Product / Segment"]);
}

function marketSizeLongTailRows(state, productRows) {
  const categories = new Set(productRows.map(row => row["Product / Segment"]));
  let rows = (dashboard.myMaravia?.longTailQueue || [])
    .filter(row => categories.has(row["Product Category"]));
  if (state.tokens.length && !state.product) {
    const direct = rows.filter(row => marketSizeMatchesTokens(row, state.tokens, true));
    if (direct.length) rows = direct;
  }
  const totalDaily = rows.reduce((sum, row) => sum + numericCell(row, "Market Daily Sales"), 0);
  return rows
    .slice()
    .sort((a, b) => numericCell(b, "Market Daily Sales") - numericCell(a, "Market Daily Sales"))
    .map((row, index) => ({
      ...row,
      "Rank": index + 1,
      "Segment Share %": percentShare(row["Market Daily Sales"], totalDaily)
    }));
}

function marketSizeListingRows(state, productRows) {
  const categories = new Set(productRows.map(row => row["Product / Segment"]));
  let rows = getListingRows()
    .filter(row => categories.has(marketSizeCategoryName(row)));
  if (state.tokens.length && !state.product) {
    const direct = rows.filter(row => marketSizeMatchesTokens(row, state.tokens, true));
    if (direct.length) rows = direct;
  }
  return rows
    .slice()
    .sort((a, b) => numericCell(b, "Est. Daily Sales") - numericCell(a, "Est. Daily Sales"))
    .map(row => ({ ...row, "Market Size Match": marketSizeCategoryName(row) }));
}

function marketSizeShopRows(longTailRows) {
  const groups = new Map();
  longTailRows.forEach(row => {
    const shop = row["Market Shop"] || "Unknown";
    if (!groups.has(shop)) {
      groups.set(shop, {
        "Shop": shop,
        "Segment Daily Sales": 0,
        "Segment 30D Sales": 0,
        "Market Listings": 0,
        "Best Listing Daily": 0,
        "Best Listing": "",
        "Market Listing URL": ""
      });
    }
    const group = groups.get(shop);
    group["Segment Daily Sales"] += numericCell(row, "Market Daily Sales");
    group["Segment 30D Sales"] += numericCell(row, "Market 30D Sales");
    group["Market Listings"] += 1;
    if (numericCell(row, "Market Daily Sales") > numericCell(group, "Best Listing Daily")) {
      group["Best Listing Daily"] = numericCell(row, "Market Daily Sales");
      group["Best Listing"] = row["Market Long Tail"] || "";
      group["Market Listing URL"] = row["Market Listing URL"] || "";
    }
  });
  return [...groups.values()]
    .map(row => ({
      ...row,
      "Segment Daily Sales": Number(row["Segment Daily Sales"].toFixed(2)),
      "Segment 30D Sales": Math.round(row["Segment 30D Sales"])
    }))
    .sort((a, b) => numericCell(b, "Segment Daily Sales") - numericCell(a, "Segment Daily Sales"));
}

function marketSizeCoverageRows(productRows) {
  const categories = new Set(productRows.map(row => row["Product / Segment"]));
  return (dashboard.myMaravia?.categories || [])
    .filter(row => categories.has(row["Product Category"]))
    .slice()
    .sort((a, b) => numericCell(b, "Market Daily Sales") - numericCell(a, "Market Daily Sales"));
}

function marketSizeDemandRows(state, productRows) {
  const categories = new Set(productRows.map(row => row["Product / Segment"]));
  const detailRows = (dashboard.rawPreviews?.demand_detail || [])
    .filter(row => categories.has(row["Product Substrate Category"]) || categories.has(row["Product Substrate"]))
    .filter(row => !state.tokens.length || marketSizeMatchesTokens(row, state.tokens, true));
  if (detailRows.length) {
    const groups = new Map();
    detailRows.forEach(row => {
      const cluster = row["Demand Intent Cluster"] || "Unclustered demand";
      if (!groups.has(cluster)) {
        groups.set(cluster, {
          "Demand Intent Cluster": cluster,
          "Preview Daily Sales": 0,
          "Preview Listing Count": 0,
          "Top Product Substrate": row["Product Substrate Category"] || row["Product Substrate"] || "",
          "Evidence Strength": row["Evidence Strength"] || ""
        });
      }
      const group = groups.get(cluster);
      group["Preview Daily Sales"] += numericCell(row, "Est. 30D Sales") / 30;
      group["Preview Listing Count"] += 1;
    });
    return [...groups.values()]
      .map(row => ({ ...row, "Preview Daily Sales": Number(row["Preview Daily Sales"].toFixed(2)) }))
      .sort((a, b) => numericCell(b, "Preview Daily Sales") - numericCell(a, "Preview Daily Sales"));
  }
  return (dashboard.listing?.demandSummary || [])
    .filter(row => !state.tokens.length || marketSizeMatchesTokens(row, state.tokens, false))
    .slice()
    .sort((a, b) => numericCell(b, "Total Est. Daily Sales") - numericCell(a, "Total Est. Daily Sales"));
}

function renderMarketSize() {
  const metricTarget = document.getElementById("market-size-metrics");
  if (!metricTarget) return;
  const state = marketSizeFilterState();
  selectedMarketSizeProduct = state.product;
  const productRows = marketSizeProductRows(state);
  const longTailRows = marketSizeLongTailRows(state, productRows);
  const listingRows = marketSizeListingRows(state, productRows);
  const shopRows = marketSizeShopRows(longTailRows);
  const coverageRows = marketSizeCoverageRows(productRows);
  const demandRows = marketSizeDemandRows(state, productRows);
  const daily = productRows.reduce((sum, row) => sum + numericCell(row, "Primary Market Daily Sales"), 0);
  const thirty = productRows.reduce((sum, row) => sum + numericCell(row, "Primary Market 30D Sales"), 0);
  const myDaily = productRows.reduce((sum, row) => sum + numericCell(row, "My Daily Sales"), 0);
  const openLongTails = productRows.reduce((sum, row) => sum + numericCell(row, "Open Long Tails"), 0);
  const evidenceListings = productRows.reduce((sum, row) => sum + numericCell(row, "Evidence Listings"), 0);
  const weightedCoverageBase = productRows.reduce((sum, row) => {
    const coverage = row["Coverage %"];
    return coverage === null || coverage === undefined ? sum : sum + numericCell(row, "Primary Market Daily Sales");
  }, 0);
  const weightedCoverage = weightedCoverageBase
    ? productRows.reduce((sum, row) => {
        const coverage = row["Coverage %"];
        return coverage === null || coverage === undefined
          ? sum
          : sum + numericCell(row, "Coverage %") * numericCell(row, "Primary Market Daily Sales");
      }, 0) / weightedCoverageBase
    : null;
  const myShare = percentShare(myDaily, daily + myDaily);
  const top = productRows[0] || {};
  const scope = state.product || state.search || "all products and segments";

  metricTarget.innerHTML = [
    ["Products", fmt(productRows.length, "Listing Count")],
    ["Market daily sales", fmt(Number(daily.toFixed(2)), "Primary Market Daily Sales") || "0"],
    ["Market 30D sales", fmt(Math.round(thirty), "Primary Market 30D Sales") || "0"],
    ["Evidence listings", fmt(evidenceListings, "Evidence Listings") || "0"],
    ["Open long tails", fmt(openLongTails, "Open Long Tails") || "0"],
    ["My share", myShare === null ? "0%" : fmt(myShare, "My Market Share %")]
  ].map(([label, value]) => metric(label, value)).join("");

  const count = document.getElementById("market-size-count");
  if (count) {
    count.textContent = `Showing ${fmt(productRows.length, "Listing Count")} product markets, ${fmt(longTailRows.length, "Listing Count")} long-tail rows, and ${fmt(listingRows.length, "Listing Count")} listing evidence rows for ${scope}.`;
  }
  const summary = document.getElementById("market-size-summary");
  if (summary) {
    summary.innerHTML = productRows.length
      ? `<strong>${escapeHtml(top["Product / Segment"])}</strong> is the largest visible match at ${escapeHtml(fmt(top["Primary Market Daily Sales"], "Primary Market Daily Sales"))} estimated daily sales and ${escapeHtml(fmt(top["Primary Market 30D Sales"], "Primary Market 30D Sales"))} estimated 30-day sales. Coverage across this view is ${weightedCoverage === null ? "not available" : escapeHtml(fmt(Number(weightedCoverage.toFixed(1)), "Coverage %"))}; use the evidence tables below to see which shops and listings are driving the read.`
      : `No market-size rows match ${escapeHtml(scope)}.`;
  }

  if (productRows.length) {
    renderBar("market-size-chart", productRows, "Primary Market Daily Sales", "Product / Segment", 20, "#244c66");
  } else {
    document.getElementById("market-size-chart").innerHTML = `<div class="empty">No market-size rows match the current filters.</div>`;
  }
  renderTable("market-size-products", productRows, [
    "Product / Segment", "Primary Market Daily Sales", "Primary Market 30D Sales",
    "Broad Market Daily Sales", "Segment Market Daily Sales", "Build Queue Daily Sales",
    "Evidence Listings", "Tracked Shops", "My Daily Sales", "My Market Share %",
    "Coverage %", "Open Long Tails", "Top Open Daily Sales", "Leader Gap Daily",
    "Top Open Long Tail", "Market Size Source", "Market Size Read"
  ], 120, { preserveOrder: true });
  renderTable("market-size-shops", shopRows, [
    "Shop", "Segment Daily Sales", "Segment 30D Sales", "Market Listings",
    "Best Listing Daily", "Best Listing", "Market Listing URL"
  ], 40, { preserveOrder: true });
  renderTable("market-size-demand", demandRows, [
    "Demand Intent Cluster", "Total Est. Daily Sales", "Total Est. 30D Sales", "Preview Daily Sales",
    "Preview Listing Count", "Listing Count", "Review Count", "Avg Daily Sales / Listing",
    "Shop Count", "Top Product Substrate", "Evidence Strength"
  ], 30, { preserveOrder: true });
  renderTable("market-size-long-tails", longTailRows, [
    "Rank", "Product Category", "Market Thumbnail", "Market Daily Sales", "Market 30D Sales",
    "Segment Share %", "Status", "Market Shop", "Market Long Tail",
    "Matching MyMaravia Listing", "Match Tokens", "Build Recommendation", "Market Listing URL"
  ], 250, { preserveOrder: true });
  renderTable("market-size-listings", listingRows, [
    "Overall Rank", "Thumbnail", "Shop", "Est. Daily Sales", "Est. 30D Sales",
    "Product Title", "Market Size Match", "Product Substrate Category", "Production Tag",
    "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Listing URL"
  ], 250, { preserveOrder: true });
  renderTable("market-size-coverage", coverageRows, [
    "Product Category", "Market Daily Sales", "My Category Daily Sales", "My Market Share %",
    "Coverage %", "Active Listings", "MyMaravia Listings", "Needs Build",
    "Top Open Daily Sales", "Top Competitor Daily Sales", "Leader Gap Daily",
    "Top Open Long Tail", "Existing MyMaravia Long Tails"
  ], 80, { preserveOrder: true });
}

function marketPenetrationFlatRows(segments, key) {
  return segments.flatMap(segment =>
    (Array.isArray(segment[key]) ? segment[key] : []).map(row => ({
      "Market": segment["Market"],
      ...row
    }))
  );
}

function renderMarketPenetration() {
  const metricTarget = document.getElementById("market-penetration-metrics");
  if (!metricTarget) return;
  const payload = dashboard.marketPenetration || {};
  const segments = Array.isArray(payload.segments) ? payload.segments : [];
  const calibration = payload.calibration || {};
  const coverageAudit = payload.coverageAudit || {};
  const coverageSummary = coverageAudit.summary || {};
  const totalReviews365 = segments.reduce((sum, row) => sum + numericCell(row, "Competitor Reviews 365D"), 0);
  const totalReviews90 = segments.reduce((sum, row) => sum + numericCell(row, "Competitor Reviews 90D"), 0);
  const totalCompetitorOrders = segments.reduce((sum, row) => sum + numericCell(row, "Estimated Competitor Orders 365D"), 0);
  const totalMyOrders = segments.reduce((sum, row) => sum + numericCell(row, "MyMaravia Orders 365D"), 0);
  const totalActiveListings = segments.reduce((sum, row) => sum + numericCell(row, "MyMaravia Active Listings"), 0);
  const orderShare = percentShare(totalMyOrders, totalCompetitorOrders + totalMyOrders);
  const bestShare = segments
    .slice()
    .sort((a, b) => numericCell(b, "Estimated Order Share %") - numericCell(a, "Estimated Order Share %"))[0] || {};

  metricTarget.innerHTML = [
    ["Markets", fmt(segments.length, "Listing Count") || "0"],
    ["Competitor reviews 365D", fmt(totalReviews365, "Competitor Reviews 365D") || "0"],
    ["Competitor reviews 90D", fmt(totalReviews90, "Competitor Reviews 90D") || "0"],
    ["Est. competitor orders", fmt(Math.round(totalCompetitorOrders), "Estimated Competitor Orders 365D") || "0"],
    ["MyMaravia orders 365D", fmt(totalMyOrders, "MyMaravia Orders 365D") || "0"],
    ["My active listings", fmt(totalActiveListings, "MyMaravia Active Listings") || "0"],
    ["Blended order share", orderShare === null ? "0%" : fmt(orderShare, "Estimated Order Share %")],
    ["Strongest share", bestShare["Market"] ? `${bestShare["Market"]} ${fmt(bestShare["Estimated Order Share %"], "Estimated Order Share %")}` : "Unavailable"],
    ["Recent target runs", fmt(coverageSummary["Recent Target Runs"], "Recent Target Runs") || "0"],
    ["Recent shops promoted", fmt(coverageSummary["Recent Shops Promoted"], "Recent Shops Promoted") || "0"],
    ["Recent review rows", fmt(coverageSummary["Recent Review Rows Written"], "Recent Review Rows Written") || "0"],
    ["Rate-limit errors", fmt(coverageSummary["Recent Rate Limit Errors"], "Recent Rate Limit Errors") || "0"]
  ].map(([label, value]) => metric(label, value)).join("");

  const summary = document.getElementById("market-penetration-summary");
  if (summary) {
    const reviewRate = Number(calibration.reviewOrderRatePercent || 0);
    summary.innerHTML = segments.length
      ? `Strict review-backed read across hangers, LED nameplates, and license plates. Competitor orders are directionally estimated from MyMaravia's ${escapeHtml(fmt(reviewRate, "Review Share %"))} 365-day review/order ratio; use the top-shop and listing tables to see where each market is concentrated.`
      : `No market penetration rows are available in this snapshot.`;
  }

  const chartTarget = document.getElementById("market-penetration-chart");
  const chartRows = segments
    .slice()
    .sort((a, b) => numericCell(a, "Estimated Order Share %") - numericCell(b, "Estimated Order Share %"));
  if (chartTarget && chartRows.length) {
    const maxShare = Math.max(1, ...chartRows.map(row => numericCell(row, "Estimated Order Share %")));
    Plotly.newPlot("market-penetration-chart", [{
      type: "bar",
      orientation: "h",
      x: chartRows.map(row => numericCell(row, "Estimated Order Share %")),
      y: chartRows.map(row => row["Market"]),
      text: chartRows.map(row => `${fmt(row["Estimated Order Share %"], "Estimated Order Share %")} order share`),
      textposition: "auto",
      marker: { color: "#0f766e" },
      hovertemplate: "%{y}<br>Estimated order share: %{x:.1f}%<extra></extra>"
    }], {
      margin: { l: 130, r: 20, t: 20, b: 45 },
      xaxis: { title: "Estimated MyMaravia order share", range: [0, maxShare * 1.25], ticksuffix: "%" },
      yaxis: { automargin: true },
      height: Math.max(260, chartRows.length * 70),
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)"
    }, plotConfig);
  } else if (chartTarget) {
    chartTarget.innerHTML = `<div class="empty">No market penetration rows are available in this snapshot.</div>`;
  }

  renderTable("market-penetration-segments", segments, [
    "Market", "Read", "Reviewed Listings", "Competitor Shops",
    "Competitor Reviews 365D", "Competitor Reviews 90D", "Estimated Competitor Orders 365D",
    "MyMaravia Active Listings", "MyMaravia All Listings", "MyMaravia Orders 365D",
    "MyMaravia Reviews 365D", "Estimated Order Share %", "Review Share %",
    "Latest Competitor Review"
  ], 20, { preserveOrder: true });
  const coverageSummaryTarget = document.getElementById("market-penetration-coverage-summary");
  if (coverageSummaryTarget) {
    coverageSummaryTarget.textContent = coverageAudit.read || "No indexing coverage audit is available in this snapshot.";
  }
  renderTable("market-penetration-coverage", Array.isArray(coverageAudit.segmentCoverage) ? coverageAudit.segmentCoverage : [], [
    "Market", "Coverage Read", "Reviewed Listings", "Reviewed Shops",
    "Resolved Shops", "Open Shops", "Resolved %", "Window Complete Shops",
    "Depth Satisfied Shops", "Empty / Zero Shops", "Partial Shops", "Capped Shops",
    "Queued Shops", "Untracked Shops", "Other Status Shops", "Freshest Capture"
  ], 20, { preserveOrder: true });
  renderTable("market-penetration-yield", Array.isArray(coverageAudit.queryBankYield) ? coverageAudit.queryBankYield : [], [
    "Generated At", "Query Bank", "Market", "Candidate Shop IDs", "Discovery Output Rows",
    "Shops Promoted", "Review Rows Written", "Rate Limit Errors", "Seconds", "Run"
  ], 12, { preserveOrder: true });
  renderTable("market-penetration-shops", marketPenetrationFlatRows(segments, "Top Shops"), [
    "Market", "Shop", "Reviewed Listings", "Reviews 365D", "Reviews 90D"
  ], 60, { preserveOrder: true });
  renderTable("market-penetration-my-listings", marketPenetrationFlatRows(segments, "MyMaravia Listings"), [
    "Market", "State", "Subsegment", "Title", "Recent 30D Sales", "Est. Daily Sales", "URL"
  ], 75, { preserveOrder: true });
  renderTable("market-penetration-listings", marketPenetrationFlatRows(segments, "Top Listings"), [
    "Market", "Shop", "Subsegment", "Reviews 365D", "Reviews 90D", "Total Reviews",
    "Avg Rating", "Title", "URL"
  ], 90, { preserveOrder: true });
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

function sortListingRows(rows, selectedSort = null) {
  const sort = (selectedSort ?? document.getElementById("listing-sort").value) || "daily-desc";
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
      stats.set(clean, { name: clean, listings: 0, reviewListings: 0, daily: 0, thirty: 0, eRank30: 0, score: 0 });
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
  reviewShopCoverageState.rows.forEach(row => {
    const stat = ensure(row.Shop);
    if (!stat) return;
    stat.reviewListings = Math.max(stat.reviewListings, numericCell(row, "Review-Derived Listings"));
    stat.score = Math.max(stat.score, numericCell(row, "Review Corpus Count"));
  });

  stats.forEach(stat => {
    stat.score = Math.max(stat.thirty, stat.eRank30, stat.score);
  });
  return stats;
}

function reviewShopCoverageLookup() {
  return companyLookup(reviewShopCoverageState.rows || []);
}

function reviewShopCoverageRowForCompany(company) {
  return reviewShopCoverageLookup().get(companyName(company)) || {};
}

function companyOptionSuffix(stat) {
  if (stat.listings) return `${fmt(stat.listings, "Listing Count")} inline listings`;
  if (stat.reviewListings) return `${fmt(stat.reviewListings, "Listing Count")} reviewed listings`;
  return `${fmt(stat.eRank30, "30D Sales")} eRank 30D`;
}

function companyOptions(filter = "") {
  const query = filter.trim().toLowerCase();
  return [...companyStats().values()]
    .filter(stat => !query || stat.name.toLowerCase().includes(query))
    .sort((a, b) => {
      const priority = name => /^(mymaravia|cronk research)$/i.test(name) ? 0 : 1;
      return priority(a.name) - priority(b.name) ||
        Number(b.score || 0) - Number(a.score || 0) ||
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
    option.textContent = `${stat.name} (${companyOptionSuffix(stat)})`;
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
    button.textContent = `${stat.name} (${companyOptionSuffix(stat)})`;
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
  if (document.getElementById("company")?.classList.contains("active")) {
    updateViewUrl("company");
  }
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

function companyReviewEvidence(corpusShop, shopCoverage) {
  const evidence = { ...(shopCoverage || {}) };
  Object.entries(corpusShop || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") evidence[key] = value;
  });
  if (!evidence["Review Corpus Listings"] && evidence["Review-Derived Listings"]) {
    evidence["Review Corpus Listings"] = evidence["Review-Derived Listings"];
  }
  if (!evidence["Review Corpus Latest ISO"] && evidence["Latest Review ISO"]) {
    evidence["Review Corpus Latest ISO"] = evidence["Latest Review ISO"];
  }
  return evidence;
}

function renderCompanyProfile() {
  bindReviewShopCoverageActions();
  loadReviewShopCoverageRows();
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
  const shopCoverage = reviewShopCoverageRowForCompany(company);
  const reviewEvidence = companyReviewEvidence(corpusShop, shopCoverage);
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
    ["Reviewed listings", fmt(shopCoverage["Review-Derived Listings"], "Review-Derived Listings") || "0"],
    ["Corpus reviews", fmt(reviewEvidence["Review Corpus Count"], "Review Corpus Count") || "0"],
    ["Review months", fmt(reviewEvidence["Review Corpus Months Covered"], "Review Corpus Months Covered") || "0"],
    ["Full-year history", reviewEvidence["Full Year Review Coverage"] || "No"]
  ].map(([label, value]) => metric(label, value)).join("");

  const eRank30 = numericCell(coverage, "eRank 30D Sales") || numericCell(topShop, "30D Sales");
  const calloutBits = [
    `${fmt(listings.length, "Listing Count")} tracked listing rows`,
    `${fmt(categories.size, "Listing Count")} product categories`,
    `${fmt(productionRows.length, "Listing Count")} production methods`
  ];
  if (eRank30) calloutBits.push(`${fmt(eRank30, "30D Sales")} eRank 30-day sales`);
  if (numericCell(reviewEvidence, "Review Corpus Count")) {
    const sourceRead = numericCell(corpusShop, "Review Corpus Count") ? "full-corpus" : "sidecar";
    calloutBits.push(
      `${fmt(reviewEvidence["Review Corpus Count"], "Review Corpus Count")} ${sourceRead} reviews, ${fmt(reviewEvidence["Review Corpus 90D"], "Review Corpus 90D")} in the latest 90 days`
    );
  }
  if (numericCell(shopCoverage, "Review-Derived Listings")) {
    calloutBits.push(
      `${fmt(shopCoverage["Review-Derived Listings"], "Review-Derived Listings")} reviewed listing URLs in shop coverage, ${fmt(shopCoverage["Full Identity Listings"], "Full Identity Listings")} with full identity`
    );
  } else if (reviewShopCoverageState.loading) {
    calloutBits.push("loading all-shop coverage sidecar");
  }
  if (reviewEvidence["Full Year Review Coverage"] === "Yes") {
    calloutBits.push(
      `full-year review coverage from ${reviewEvidence["Review Corpus Earliest ISO"] || "unknown"} to ${reviewEvidence["Review Corpus Latest ISO"] || "unknown"}`
    );
  }
  if (trend["Trend Source"]) {
    calloutBits.push(`${trend["Trend Confidence"] || "Estimated"} sales trend from ${trend["Trend Source"]}`);
  }
  if (views || favorites || recentReviews) {
    calloutBits.push(`${fmt(views, "Views")} views, ${fmt(favorites, "Favorites")} favorites, ${fmt(recentReviews, "Recent Reviews")} recent reviews in visible listing data`);
  }
  document.getElementById("company-callout").textContent = calloutBits.join(" · ");
  renderStatusTable("company-accuracy-health", dashboard.operations?.companyProfileAccuracyHealth || [], [
    "Status", "Check", "Finding", "Expected", "Decision Impact", "Next Action"
  ], 6);

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
    "Review-Derived Listings": shopCoverage["Review-Derived Listings"] ?? "",
    "Full Identity Listings": shopCoverage["Full Identity Listings"] ?? "",
    "Title Gap Listings": shopCoverage["Title Gap Listings"] ?? "",
    "Identity Gap Listings": shopCoverage["Identity Gap Listings"] ?? "",
    "Review Corpus Count": reviewEvidence["Review Corpus Count"] ?? "",
    "Review Corpus 90D": reviewEvidence["Review Corpus 90D"] ?? "",
    "Review Corpus 365D": reviewEvidence["Review Corpus 365D"] ?? "",
    "Review Corpus Listings": reviewEvidence["Review Corpus Listings"] ?? "",
    "Review Corpus Avg Rating": reviewEvidence["Review Corpus Avg Rating"] ?? "",
    "Review Corpus Earliest ISO": reviewEvidence["Review Corpus Earliest ISO"] ?? "",
    "Review Corpus Latest ISO": reviewEvidence["Review Corpus Latest ISO"] ?? "",
    "Review Corpus Span Days": reviewEvidence["Review Corpus Span Days"] ?? "",
    "Review Corpus Months Covered": reviewEvidence["Review Corpus Months Covered"] ?? "",
    "Full Year Review Coverage": reviewEvidence["Full Year Review Coverage"] ?? "",
    "Peak Review Month": reviewEvidence["Peak Review Month"] ?? "",
    "Peak Review Month Count": reviewEvidence["Peak Review Month Count"] ?? "",
    "Seasonality Index": reviewEvidence["Seasonality Index"] ?? "",
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
    "Listing Detail": company,
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

function updateViewUrl(viewId) {
  if (!window.history?.replaceState) return;
  const url = new URL(window.location.href);
  if (viewId) url.searchParams.set("view", viewId);
  writeViewUrlState(url.searchParams, viewId);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function initialDashboardView() {
  const viewId = new URLSearchParams(window.location.search).get("view") || "";
  const view = document.getElementById(viewId);
  return view?.classList.contains("view") ? viewId : "";
}

function nextActionFilterState() {
  return {
    preset: document.getElementById("next-action-preset-filter")?.value || "",
    type: document.getElementById("next-action-type-filter")?.value || "",
    trace: document.getElementById("next-action-trace-filter")?.value || "",
    search: (document.getElementById("next-action-search")?.value || "").trim(),
    action: selectedNextActionKey
  };
}

function setNextActionShareStatus(text) {
  const target = document.getElementById("next-action-link-status");
  if (target) target.textContent = text || "";
}

function setSelectIfOption(id, value) {
  const select = document.getElementById(id);
  if (!select || !value) return;
  if ([...select.options].some(option => option.value === value)) {
    select.value = value;
  }
}

function setUrlParam(params, key, value) {
  const text = String(value ?? "").trim();
  text ? params.set(key, text) : params.delete(key);
}

function inputValue(id) {
  return document.getElementById(id)?.value || "";
}

function setInputFromParam(params, id, key) {
  const input = document.getElementById(id);
  const value = params.get(key);
  if (input && value !== null) input.value = value;
}

function writeListingUrlState(params) {
  const filters = appliedListingFilters || listingControlState();
  setUrlParam(params, "listSearch", filters.search);
  setUrlParam(params, "listProduction", filters.production);
  setUrlParam(params, "listSubstrate", filters.substrate);
  setUrlParam(params, "listSort", filters.sort);
  setUrlParam(params, "listTimeframe", filters.timeframe);
  setUrlParam(params, "listStart", filters.start);
  setUrlParam(params, "listEnd", filters.end);
  setUrlParam(params, "listCycle", selectedListingCycleKey);
}

function applyListingUrlState() {
  const params = new URLSearchParams(window.location.search);
  setInputFromParam(params, "listing-search", "listSearch");
  setInputFromParam(params, "listing-timeframe-start", "listStart");
  setInputFromParam(params, "listing-timeframe-end", "listEnd");
  setSelectIfOption("production-filter", params.get("listProduction") || "");
  setSelectIfOption("substrate-filter", params.get("listSubstrate") || "");
  setSelectIfOption("listing-sort", params.get("listSort") || "");
  setSelectIfOption("listing-timeframe-preset", params.get("listTimeframe") || "");
  selectedListingCycleKey = params.get("listCycle") || selectedListingCycleKey || "";
  setAppliedListingFiltersFromControls();
}

function writeBuyerMomentUrlState(params) {
  setUrlParam(params, "bmMoment", selectedBuyerMomentId);
  setUrlParam(params, "bmSource", inputValue("buyer-moment-source-filter"));
  setUrlParam(params, "bmSort", inputValue("buyer-moment-sort"));
  setUrlParam(params, "bmCalendar", inputValue("buyer-moment-calendar-search"));
  setUrlParam(params, "bmSearch", inputValue("buyer-moment-search"));
  const customActive = selectedBuyerMomentId === CUSTOM_BUYER_MOMENT_ID;
  setUrlParam(params, "bmStart", customActive ? inputValue("buyer-moment-range-start") : "");
  setUrlParam(params, "bmEnd", customActive ? inputValue("buyer-moment-range-end") : "");
  const filters = activeBuyerMomentFilters();
  setUrlParam(params, "bmFilters", filters.join(","));
}

function applyBuyerMomentUrlState() {
  const params = new URLSearchParams(window.location.search);
  setSelectIfOption("buyer-moment-source-filter", params.get("bmSource") || "");
  setSelectIfOption("buyer-moment-sort", params.get("bmSort") || "");
  setInputFromParam(params, "buyer-moment-calendar-search", "bmCalendar");
  setInputFromParam(params, "buyer-moment-search", "bmSearch");
  setInputFromParam(params, "buyer-moment-range-start", "bmStart");
  setInputFromParam(params, "buyer-moment-range-end", "bmEnd");
  const start = params.get("bmStart");
  const end = params.get("bmEnd");
  const moment = params.get("bmMoment");
  if (start && end && (!moment || moment === CUSTOM_BUYER_MOMENT_ID)) {
    customBuyerMomentRange = normalizeDateRange(start, end);
  }
  if (moment) selectedBuyerMomentId = moment;
  if (!moment && start && end) selectedBuyerMomentId = CUSTOM_BUYER_MOMENT_ID;
  const activeFilters = new Set(String(params.get("bmFilters") || "").split(",").filter(Boolean));
  BUYER_MOMENT_FILTER_IDS.forEach(([key, id]) => {
    const input = document.getElementById(id);
    if (input) input.checked = activeFilters.has(key);
  });
}

function writeCompanyUrlState(params) {
  setUrlParam(params, "company", selectedCompany || inputValue("company-select"));
  setUrlParam(params, "companyProduction", selectedCompanyProduction);
}

function applyCompanyUrlState() {
  const params = new URLSearchParams(window.location.search);
  const company = companyName(params.get("company") || "");
  const stats = companyStats();
  const companyMatch = company
    ? [...stats.keys()].find(name => name.toLowerCase() === company.toLowerCase())
    : "";
  if (companyMatch) {
    selectedCompany = companyMatch;
    const search = document.getElementById("company-search");
    if (search) search.value = companyMatch;
  }
  selectedCompanyProduction = params.get("companyProduction") || "";
}

function writeMarketSizeUrlState(params) {
  setUrlParam(params, "msProduct", inputValue("market-size-product-filter"));
  setUrlParam(params, "msSource", inputValue("market-size-source-filter"));
  setUrlParam(params, "msSort", inputValue("market-size-sort"));
  setUrlParam(params, "msSearch", inputValue("market-size-search"));
}

function applyMarketSizeUrlState() {
  const params = new URLSearchParams(window.location.search);
  setSelectIfOption("market-size-product-filter", params.get("msProduct") || "");
  setSelectIfOption("market-size-source-filter", params.get("msSource") || "");
  setSelectIfOption("market-size-sort", params.get("msSort") || "");
  setInputFromParam(params, "market-size-search", "msSearch");
  selectedMarketSizeProduct = document.getElementById("market-size-product-filter")?.value || "";
}

function writeViewUrlState(params, viewId) {
  if (viewId === "listings") writeListingUrlState(params);
  if (viewId === "buyer-moments") writeBuyerMomentUrlState(params);
  if (viewId === "company") writeCompanyUrlState(params);
  if (viewId === "market-size") writeMarketSizeUrlState(params);
}

function applyNextActionUrlState() {
  const params = new URLSearchParams(window.location.search);
  setSelectIfOption("next-action-preset-filter", params.get("naPreset") || "");
  setSelectIfOption("next-action-type-filter", params.get("naType") || "");
  setSelectIfOption("next-action-trace-filter", params.get("naTrace") || "");
  const search = params.get("naSearch");
  const input = document.getElementById("next-action-search");
  if (input && search !== null) input.value = search;
  selectedNextActionKey = params.get("naAction") || "";
}

function nextActionShareUrl(state = nextActionFilterState()) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", "opportunity");
  state.preset ? url.searchParams.set("naPreset", state.preset) : url.searchParams.delete("naPreset");
  state.type ? url.searchParams.set("naType", state.type) : url.searchParams.delete("naType");
  state.trace ? url.searchParams.set("naTrace", state.trace) : url.searchParams.delete("naTrace");
  state.search ? url.searchParams.set("naSearch", state.search) : url.searchParams.delete("naSearch");
  state.action ? url.searchParams.set("naAction", state.action) : url.searchParams.delete("naAction");
  return url;
}

function updateNextActionUrl() {
  if (!window.history?.replaceState) return;
  const url = nextActionShareUrl();
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

async function copyNextActionViewLink() {
  const url = nextActionShareUrl().toString();
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    setNextActionShareStatus(selectedNextActionKey ? "Action link copied." : "View link copied.");
  } else {
    setNextActionShareStatus(url);
  }
}

function resetNextActionView() {
  const preset = document.getElementById("next-action-preset-filter");
  const type = document.getElementById("next-action-type-filter");
  const trace = document.getElementById("next-action-trace-filter");
  const search = document.getElementById("next-action-search");
  if (preset) preset.value = "";
  if (type) type.value = "";
  if (trace) trace.value = "";
  if (search) search.value = "";
  selectedNextActionKey = "";
  setNextActionShareStatus("");
  updateNextActionUrl();
  renderOpportunity();
}

function handleNextActionFilterChange() {
  setNextActionShareStatus("");
  renderOpportunity();
  updateNextActionUrl();
}

function initNextActionFilters() {
  ["next-action-preset-filter", "next-action-type-filter", "next-action-trace-filter", "next-action-search"].forEach(id => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener("input", handleNextActionFilterChange);
    element.addEventListener("change", handleNextActionFilterChange);
    element.dataset.bound = "true";
  });
  const copy = document.getElementById("next-action-copy-link");
  if (copy && copy.dataset.bound !== "true") {
    copy.addEventListener("click", () => {
      copyNextActionViewLink().catch(() => setNextActionShareStatus("Copy failed."));
    });
    copy.dataset.bound = "true";
  }
  const reset = document.getElementById("next-action-reset-view");
  if (reset && reset.dataset.bound !== "true") {
    reset.addEventListener("click", resetNextActionView);
    reset.dataset.bound = "true";
  }
}

function nextActionPresetMatches(row, preset) {
  if (!preset) return true;
  const type = String(row["Action Type"] || "");
  const text = Object.values(row).join(" ").toLowerCase();
  if (preset === "nameplates") return /name\s*plates?|nameplates?|desk sign|office sign|medical desk|teacher desk|led desk/.test(text);
  if (preset === "launch") return type === "Launch";
  if (preset === "build") return type === "Build" || type === "Launch";
  if (preset === "fix") return type === "Fix";
  if (preset === "scale") return type === "Scale";
  if (preset === "seasonal") return type === "Seasonal";
  return true;
}

function filteredNextActions(rows) {
  const preset = document.getElementById("next-action-preset-filter")?.value || "";
  const type = document.getElementById("next-action-type-filter")?.value || "";
  const trace = document.getElementById("next-action-trace-filter")?.value || "";
  const query = (document.getElementById("next-action-search")?.value || "").trim().toLowerCase();
  return rows.filter(row => {
    if (type && row["Action Type"] !== type) return false;
    if (!nextActionPresetMatches(row, preset)) return false;
    if (!nextActionTraceFilterMatches(row, trace)) return false;
    if (query && !Object.values(row).join(" ").toLowerCase().includes(query)) return false;
    return true;
  });
}

function legacyNextActionKey(row) {
  const priority = String(row?.Priority ?? "").trim();
  return priority ? priority : "";
}

function nextActionKey(row) {
  if (!row) return "";
  const explicit = String(row["Action ID"] || row["Action Key"] || "").trim();
  if (explicit) return explicit;
  const parts = [
    row["Action Type"],
    row.Action,
    row["Target Category"],
    row["Product / Listing"],
    row["Market Listing URL"],
    row["My Listing URL"],
    row["Source Signal"]
  ].map(value => String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase());
  const basis = parts.join("|");
  let hash = 2166136261;
  for (let index = 0; index < basis.length; index += 1) {
    hash ^= basis.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return `a${hash.toString(36)}`;
}

function nextActionMatches(row, key) {
  if (!key) return false;
  return nextActionKey(row) === key || legacyNextActionKey(row) === key;
}

function selectedNextActionFromRows(rows) {
  if (selectedNextActionKey) {
    const selected = rows.find(row => nextActionMatches(row, selectedNextActionKey));
    if (selected) {
      selectedNextActionKey = nextActionKey(selected);
      return selected;
    }
    selectedNextActionKey = "";
  }
  return rows[0] || null;
}

function selectNextAction(key) {
  selectedNextActionKey = key || "";
  setNextActionShareStatus(selectedNextActionKey ? "Selected action ready to share." : "");
  renderOpportunity();
  updateNextActionUrl();
}

function renderNextActionTable(rows, columns, limit = 40, selectedRow = null) {
  const target = document.getElementById("next-actions");
  if (!target) return;
  let data = rows.slice(0, limit);
  if (selectedNextActionKey && selectedRow && !data.some(row => nextActionMatches(row, selectedNextActionKey))) {
    data = [selectedRow, ...data.slice(0, Math.max(0, limit - 1))];
  }
  if (!data.length) {
    target.innerHTML = `<div class="empty">No rows available in this snapshot.</div>`;
    return;
  }
  const cols = ["Recipe", ...columns];
  const header = cols.map(col => `<th class="${wrappedColumns.has(col) ? "wrap" : ""}">${escapeHtml(col)}</th>`).join("");
  const body = data.map(row => {
    const key = nextActionKey(row);
    const active = nextActionMatches(row, selectedNextActionKey);
    const cells = cols.map(col => {
      const cls = wrappedColumns.has(col) ? "wrap" : "";
      const value = col === "Recipe"
        ? `<button class="action-select-button${active ? " active" : ""}" type="button" data-next-action-key="${escapeHtml(key)}">${active ? "Open" : "Open"}</button>`
        : col === "Trace Strength"
          ? actionTraceStrengthBadge(row)
        : col === "Trace Audit"
          ? escapeHtml(actionTraceAuditRead(row))
        : col.toLowerCase().includes("url")
          ? linkCell(row[col])
          : escapeHtml(fmt(row[col], col));
      return `<td class="${cls}">${value}</td>`;
    }).join("");
    return `<tr class="${active ? "selected-action-row" : ""}">${cells}</tr>`;
  }).join("");
  target.innerHTML = tableShell(header, body);
  target.querySelectorAll("[data-next-action-key]").forEach(button => {
    button.addEventListener("click", () => selectNextAction(button.dataset.nextActionKey || ""));
  });
  syncBottomScrollbar(target);
}

function uniqueRecipeItems(items, limit = 6) {
  const seen = new Set();
  const result = [];
  items.forEach(item => {
    const text = String(item || "").replace(/\s+/g, " ").trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) return;
    seen.add(key);
    result.push(text);
  });
  return result.slice(0, limit);
}

function actionTitlePhrases(row) {
  const title = row["Product / Listing"] || row.Action || "";
  const chunks = String(title)
    .split(/\s*(?:,|\||;)\s*/)
    .map(part => part.replace(/\s+/g, " ").trim())
    .filter(part => part.length > 2);
  return uniqueRecipeItems(chunks.length ? chunks : [title, row["Target Category"]], 4);
}

function actionTagIdeas(row) {
  const category = String(row["Target Category"] || "").trim();
  const phrases = actionTitlePhrases(row);
  const title = `${row["Product / Listing"] || ""} ${category}`.toLowerCase();
  const extras = [];
  if (/pet|dog|collar/.test(title)) extras.push("pet name plate", "dog collar tag", "engraved pet gift");
  if (/nameplate|desk sign|office/.test(title)) extras.push("desk nameplate", "office name sign", "custom desk sign");
  if (/wedding|bride|bridal/.test(title)) extras.push("wedding party gift", "bridesmaid gift", "custom wedding");
  if (/teacher|classroom|school/.test(title)) extras.push("teacher gift", "classroom decor", "personalized teacher");
  if (/night light|led|acrylic|light/.test(title)) extras.push("custom night light", "acrylic photo gift", "personalized light");
  return uniqueRecipeItems([
    category,
    ...phrases,
    ...extras,
    "personalized gift",
    "custom engraved",
    "made to order"
  ].map(item => item.slice(0, 28)), 8);
}

function actionThumbnailAngle(row) {
  const text = `${row["Product / Listing"] || ""} ${row["Target Category"] || ""}`.toLowerCase();
  if (/pet|dog|collar/.test(text)) return "Show the collar or plate installed, with the pet name and phone line readable in the first crop.";
  if (/nameplate|desk sign|office/.test(text)) return "Lead with the finished name or role plate on a desk, angled enough to show material edge and base.";
  if (/wedding|bride|bridal/.test(text)) return "Use a clean wedding-context flat lay with the personalization readable before any lifestyle props.";
  if (/night light|led|acrylic|light/.test(text)) return "Show the lit acrylic or night-light effect first, then a second angle that proves the personalization path.";
  if (/sign|plaque|plate/.test(text)) return "Make the finished personalized surface the whole first frame, with substrate and mounting detail visible.";
  return "Lead with the finished personalized product, crop tight enough that the custom text is readable at thumbnail size.";
}

function actionListingBuilderBriefItems(row) {
  if (String(row["Action Type"] || "") !== "Launch") return [];
  return uniqueRecipeItems([
    row["Launch Brief"] || "",
    row["Draft Title Pattern"] ? `Title pattern: ${row["Draft Title Pattern"]}` : "",
    row["Draft Batch"] ? `First draft batch: ${row["Draft Batch"]}` : "",
    row["Representative Listing"] ? `Market exemplar: ${row["Representative Listing"]}${row["Market Shop"] ? ` (${row["Market Shop"]})` : ""}` : "",
  ], 5);
}

function actionImageQueueItems(row) {
  if (String(row["Action Type"] || "") !== "Launch") return [];
  return uniqueRecipeItems([
    row["Media Queue"] || "",
    /led|nameplate|desk sign|office/i.test(`${row["Product / Listing"] || ""} ${row["Target Category"] || ""}`)
      ? "Route media through the LED nameplate workflow: long horizontal acrylic panel, warm edge glow, wood base choices, readable role/name text, and no concept-board final hero."
      : "",
  ], 4);
}

function actionPersonalizationField(row) {
  if (row["Personalization Brief"]) return row["Personalization Brief"];
  const text = `${row["Product / Listing"] || ""} ${row["Target Category"] || ""}`.toLowerCase();
  if (/pet|dog|collar/.test(text)) return "Pet name, phone number, collar color or plate finish, and optional icon.";
  if (/nameplate|desk sign|office/.test(text)) return "Name, title or role, logo line, font choice, base/light color, and proof preference.";
  if (/wedding|bride|bridal/.test(text)) return "Name, date, role, hanger/item color, font choice, and quantity notes.";
  if (/photo|portrait|statuette|cutout/.test(text)) return "Uploaded photo, crop preference, name/date text, and proof approval.";
  if (/night light|led|acrylic|light/.test(text)) return "Name/text, light/base color, motif, font, and proof preference.";
  return "Name/text, date or role if relevant, color/finish, font choice, and proof preference.";
}

function actionPriceNote(row) {
  const daily = fmt(row["Expected Daily Sales"], "Expected Daily Sales");
  const score = fmt(row["Action Score"], "Action Score");
  return `Use the linked market leader as the live price anchor; this row is ranked at score ${score || "n/a"} with ${daily || "n/a"} expected daily sales.`;
}

function actionBlankNote(row) {
  const type = String(row["Action Type"] || "");
  if (type === "Build" || type === "Launch") return "Blank slate: do not copy the source listing verbatim; borrow the buyer promise, then write fresh title, tags, and personalization copy.";
  if (type === "Fix") return "Audit blanks first: title lead, tag coverage, thumbnail proof, variation clarity, and personalization instructions.";
  if (type === "Scale") return "Keep the working listing, then fill weak or generic fields before widening the product family.";
  return "Check source listing details before acting; the next-action row carries public-safe summary evidence only.";
}

function actionListingSearch(row) {
  return listingIdFromUrl(row["Market Listing URL"]) ||
    listingIdFromUrl(row["My Listing URL"]) ||
    actionTitlePhrases(row)[0] ||
    row["Target Category"] ||
    row.Action ||
    "";
}

function listingRowByUrl(value) {
  const id = listingIdFromUrl(value);
  if (!id) return null;
  return getListingRows().find(row => listingIdFromUrl(row["Listing URL"] || row["Market Listing URL"] || row["My Listing URL"]) === id) || null;
}

function actionEvidenceCompanyTrace(row) {
  const direct = [
    row.Shop,
    row["Market Shop"],
    row["Top Shop"],
    row["Top Competitor Shop"],
    row["Competing Shop"],
    row["Competitor Shop"],
    row["Top Opportunity Shop"],
    row["Source Shop"]
  ].map(companyName).find(Boolean);
  if (direct) return { company: direct, confidence: "action shop" };
  const listingRow = listingRowByUrl(row["Market Listing URL"]) || listingRowByUrl(row["My Listing URL"]);
  if (listingRow?.Shop) return { company: companyName(listingRow.Shop), confidence: "matched listing" };
  const evidenceMatch = String(row.Evidence || "").match(/\bfrom\s+([^;,.]+)/i);
  const company = companyName(evidenceMatch?.[1] || "");
  return company ? { company, confidence: "evidence text" } : { company: "", confidence: "" };
}

function actionEvidenceCompany(row) {
  return actionEvidenceCompanyTrace(row).company;
}

function actionEvidencePhrases(row) {
  const generic = /^(for him|for her|him|her|mom|dad|gift|gifts|custom|personalized|personalised|made to order)$/i;
  return actionTitlePhrases(row)
    .map(item => item.toLowerCase())
    .filter(item => item.length >= 8 && !generic.test(item));
}

function actionTraceTokens(row) {
  const stopwords = new Set([
    "with", "your", "from", "this", "that", "gift", "gifts", "custom", "personalized",
    "personalised", "birthday", "anniversary", "mother", "father", "mothers", "fathers",
    "for", "and", "the", "her", "him", "mom", "dad"
  ]);
  return uniqueRecipeItems(
    `${row["Product / Listing"] || ""} ${row["Target Category"] || ""}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(token => token.length >= 4 && !stopwords.has(token)),
    16
  );
}

function actionBuyerMomentTrace(row) {
  const listingId = listingIdFromUrl(row["Market Listing URL"]) || listingIdFromUrl(row["My Listing URL"]);
  const category = recipeText(row["Target Category"]);
  const phrases = actionEvidencePhrases(row);
  const tokens = actionTraceTokens(row);
  const rows = buyerMomentTopListingRows();
  const scored = rows.map(item => {
    const text = Object.values(item).join(" ").toLowerCase();
    const itemId = listingIdFromUrl(item["Listing URL"]);
    const tokenHits = tokens.filter(token => text.includes(token));
    let score = 0;
    if (listingId && itemId === listingId) score += 1000;
    if (category && String(item["Product Substrate Category"] || item["Product Category"] || "").toLowerCase() === category.toLowerCase()) score += 120;
    if (phrases.some(phrase => phrase && text.includes(phrase))) score += 120;
    if (tokenHits.length >= 2) score += tokenHits.length * 18;
    if (tokenHits.length >= 4) score += 60;
    if (category && text.includes(category.toLowerCase())) score += 40;
    return { item, score };
  }).filter(result => result.score > 0);
  scored.sort((a, b) =>
    b.score - a.score ||
    numericCell(b.item, "Buyer Moment Opportunity Score") - numericCell(a.item, "Buyer Moment Opportunity Score") ||
    numericCell(b.item, "Moment Estimated Sales") - numericCell(a.item, "Moment Estimated Sales")
  );
  const match = scored[0]?.item || null;
  const matchedListingId = match && listingId && listingIdFromUrl(match["Listing URL"]) === listingId;
  const matchText = match ? Object.values(match).join(" ").toLowerCase() : "";
  const matchingPhrase = phrases.find(phrase => matchText.includes(phrase));
  const matchingToken = tokens.find(token => matchText.includes(token));
  const confidence = matchedListingId
    ? "exact listing"
    : matchingPhrase
      ? "title phrase"
      : matchingToken
        ? "title token"
        : match
          ? "category match"
          : "fallback search";
  const matchedQuery = matchedListingId
    ? listingId
    : matchingPhrase || matchingToken || match?.["Product Substrate Category"] || match?.["Product Category"] || match?.Keyword || match?.["Product Title"] || category || actionTitlePhrases(row)[0] || "";
  return {
    match,
    momentId: match?.["Moment ID"] || "",
    moment: match?.["Buyer Moment"] || "",
    query: matchedQuery,
    confidence
  };
}

function actionTraceItems(row) {
  const listingSearch = actionListingSearch(row);
  const listingConfidence = listingIdFromUrl(row["Market Listing URL"]) || listingIdFromUrl(row["My Listing URL"])
    ? "exact listing"
    : "search cue";
  const buyerTrace = actionBuyerMomentTrace(row);
  const companyTrace = actionEvidenceCompanyTrace(row);
  const sourceTrace = recipeText(row["Evidence Trace"]);
  return [
    listingSearch ? { label: "Listings", value: listingSearch, confidence: listingConfidence } : null,
    buyerTrace.moment ? { label: "Buyer Moment", value: `${buyerTrace.moment} / ${buyerTrace.query}`, confidence: buyerTrace.confidence } : buyerTrace.query ? { label: "Buyer Moment", value: buyerTrace.query, confidence: buyerTrace.confidence } : null,
    companyTrace.company ? { label: "Company", value: companyTrace.company, confidence: companyTrace.confidence } : null,
    sourceTrace ? { label: "Source", value: sourceTrace, confidence: "generated trace" } : null
  ].filter(Boolean);
}

function cachedActionTraceItems(row) {
  const key = nextActionKey(row);
  if (key && nextActionTraceCache.has(key)) return nextActionTraceCache.get(key);
  const items = actionTraceItems(row);
  if (key) nextActionTraceCache.set(key, items);
  return items;
}

function actionTraceConfidenceScore(item) {
  const confidence = String(item?.confidence || "").toLowerCase();
  if (confidence === "exact listing") return 34;
  if (confidence === "title phrase") return 26;
  if (confidence === "action shop") return 22;
  if (confidence === "matched listing") return 20;
  if (confidence === "title token") return 18;
  if (confidence === "category match") return 14;
  if (confidence === "evidence text") return 12;
  if (confidence === "generated trace") return 10;
  if (confidence === "search cue") return 8;
  if (confidence === "fallback search") return 4;
  return 0;
}

function actionTraceStrength(row) {
  const items = cachedActionTraceItems(row);
  const score = items.reduce((total, item) => total + actionTraceConfidenceScore(item), 0);
  const exactListings = items.filter(item => item.confidence === "exact listing").length;
  const hasCompany = items.some(item => item.label === "Company");
  const hasSource = items.some(item => item.label === "Source");
  const hasBuyerMoment = items.some(item => item.label === "Buyer Moment");
  if (score >= 76 && exactListings >= 1 && hasCompany && hasSource) {
    return { label: "Strong source", tier: "strong", score, exactListings, hasCompany, hasSource, hasBuyerMoment };
  }
  if (score >= 48 && hasSource && (exactListings >= 1 || hasBuyerMoment || hasCompany)) {
    return { label: "Good source", tier: "good", score, exactListings, hasCompany, hasSource, hasBuyerMoment };
  }
  return { label: "Needs audit", tier: "audit", score, exactListings, hasCompany, hasSource, hasBuyerMoment };
}

function actionTraceStrengthBadge(row) {
  const trace = actionTraceStrength(row);
  const cls = trace.tier === "strong" ? "good" : trace.tier === "good" ? "flat" : "warn";
  return `<span class="badge ${cls}" title="${escapeHtml(trace.score)} trace points">${escapeHtml(trace.label)}</span>`;
}

function nextActionTraceFilterMatches(row, filter) {
  if (!filter) return true;
  const trace = actionTraceStrength(row);
  if (filter === "strong") return trace.tier === "strong";
  if (filter === "good") return trace.tier === "strong" || trace.tier === "good";
  if (filter === "audit") return trace.tier === "audit";
  if (filter === "exact") return trace.exactListings > 0;
  return true;
}

function nextActionTraceMix(rows) {
  const counts = { strong: 0, good: 0, audit: 0, exact: 0 };
  rows.forEach(row => {
    const trace = actionTraceStrength(row);
    counts[trace.tier] += 1;
    if (trace.exactListings > 0) counts.exact += 1;
  });
  return counts;
}

function actionTraceAuditItems(row) {
  const items = cachedActionTraceItems(row);
  const trace = actionTraceStrength(row);
  const exactListings = trace.exactListings;
  const hasCompany = trace.hasCompany;
  const hasSource = trace.hasSource;
  const hasBuyerMoment = trace.hasBuyerMoment;
  const isLaunch = String(row["Action Type"] || "") === "Launch";
  const sourceTrace = String(row["Evidence Trace"] || "");
  const result = [];
  if (exactListings === 0) {
    result.push("Attach a representative market listing URL so Listings and Buyer Moment traces can open on exact evidence.");
  }
  if (!hasCompany) {
    result.push("Add a Market Shop or Top Opportunity Shop once the representative listing is chosen.");
  }
  if (!hasBuyerMoment && isLaunch) {
    result.push("Map this product-family launch to the closest buyer moment or keep it explicitly marked as rollup-only.");
  }
  if (!hasSource) {
    result.push("Add an Evidence Trace note that names the source path used to create the action.");
  }
  if (/no single market listing is attached/i.test(sourceTrace)) {
    result.push("Treat as a planning-row opportunity until 1-3 exemplar listings are attached from the demand rollup.");
  }
  if (!result.length) {
    result.push("No trace audit flags; source trail is ready for listing work.");
  }
  return uniqueRecipeItems(result, 5);
}

function actionTraceAuditRead(row) {
  const trace = actionTraceStrength(row);
  if (trace.tier !== "audit") return "Source trail ready";
  return actionTraceAuditItems(row).join(" ");
}

function actionEvidenceTrail(row) {
  return cachedActionTraceItems(row).map(item => `${item.label}: ${item.value} [${item.confidence}]`);
}

function openActionListingEvidence(row) {
  const query = actionListingSearch(row);
  const search = document.getElementById("listing-search");
  const production = document.getElementById("production-filter");
  const substrate = document.getElementById("substrate-filter");
  const timeframe = document.getElementById("listing-timeframe-preset");
  const start = document.getElementById("listing-timeframe-start");
  const end = document.getElementById("listing-timeframe-end");
  if (search) search.value = query;
  if (production) production.value = "";
  if (substrate) substrate.value = "";
  if (timeframe) timeframe.value = "";
  if (start) start.value = "";
  if (end) end.value = "";
  setAppliedListingFiltersFromControls();
  activateView("listings");
  setNextActionShareStatus(query ? `Listings evidence opened for ${query}.` : "Listings evidence opened.");
  requestAnimationFrame(() => document.getElementById("top-listings")?.scrollIntoView({ block: "start" }));
}

function openActionBuyerMomentEvidence(row) {
  const trace = actionBuyerMomentTrace(row);
  const source = document.getElementById("buyer-moment-source-filter");
  const calendarSearch = document.getElementById("buyer-moment-calendar-search");
  const listingSearch = document.getElementById("buyer-moment-search");
  if (source) source.value = "";
  BUYER_MOMENT_FILTER_IDS.forEach(([, id]) => {
    const input = document.getElementById(id);
    if (input) input.checked = false;
  });
  if (calendarSearch) calendarSearch.value = trace.moment || "";
  if (listingSearch) listingSearch.value = trace.query || "";
  selectedBuyerMomentId = trace.momentId || "";
  activateView("buyer-moments");
  renderBuyerMoments();
  setNextActionShareStatus(trace.moment ? `Buyer Moment evidence opened: ${trace.moment}.` : "Buyer Moment evidence opened.");
  requestAnimationFrame(() => document.getElementById("buyer-moment-listings")?.scrollIntoView({ block: "start" }));
}

function openActionCompanyEvidence(row) {
  const company = actionEvidenceCompany(row);
  if (!company || !companyStats().has(company)) {
    setNextActionShareStatus("No matching company profile found for this action.");
    return;
  }
  openCompanyProfile(company);
  setNextActionShareStatus(`Company evidence opened: ${company}.`);
  requestAnimationFrame(() => document.getElementById("company-listings")?.scrollIntoView({ block: "start" }));
}

function recipeList(items) {
  return `<ul class="action-recipe-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function optionalRecipeBlock(title, items) {
  const rows = uniqueRecipeItems(items);
  return rows.length ? `<div class="action-recipe-block"><h3>${escapeHtml(title)}</h3>${recipeList(rows)}</div>` : "";
}

function recipeTraceList(items) {
  return `<ul class="action-recipe-list">${items.map(item => `
    <li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)} <span class="badge flat">${escapeHtml(item.confidence)}</span></li>
  `).join("")}</ul>`;
}

function recipeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function recipeTextList(title, items) {
  const rows = uniqueRecipeItems(items).map(item => `- ${recipeText(item)}`);
  return [`## ${title}`, ...(rows.length ? rows : ["- Not available."])].join("\n");
}

function optionalRecipeTextList(title, items) {
  const rows = uniqueRecipeItems(items);
  return rows.length ? recipeTextList(title, rows) : "";
}

function actionRecipeExportText(row, visibleCount, totalCount) {
  const type = recipeText(row["Action Type"] || "Action");
  const product = recipeText(row["Product / Listing"] || row.Action || "Selected row");
  const category = recipeText(row["Target Category"] || "Uncategorized");
  const score = recipeText(fmt(row["Action Score"], "Action Score") || "n/a");
  const daily = recipeText(fmt(row["Expected Daily Sales"], "Expected Daily Sales") || "n/a");
  const exactLink = nextActionShareUrl({ ...nextActionFilterState(), action: nextActionKey(row) }).toString();
  const sourceNotes = uniqueRecipeItems([
    `${row["Source Signal"] || "Source signal"} - ${row.Confidence || "confidence pending"}`,
    row["Evidence Trace"] || "",
    row.Evidence || "No evidence note available.",
    row["Market Listing URL"] ? "Market source link is available for live price, title, and thumbnail validation." : "",
    row["My Listing URL"] ? "Existing MyMaravia listing is attached for comparison." : "No MyMaravia listing is attached yet."
  ], 4);
  return [
    `# ${type}: ${product}`,
    "",
    `Priority: ${recipeText(fmt(row.Priority, "Priority") || "n/a")}`,
    `Target category: ${category}`,
    `Action score: ${score}`,
    `Expected daily sales: ${daily}`,
    `Visible actions: ${recipeText(fmt(visibleCount, "Listing Count"))} of ${recipeText(fmt(totalCount, "Listing Count"))}`,
    `Dashboard link: ${exactLink}`,
    row["Market Listing URL"] ? `Market source: ${recipeText(row["Market Listing URL"])}` : null,
    row["My Listing URL"] ? `MyMaravia listing: ${recipeText(row["My Listing URL"])}` : null,
    "",
    optionalRecipeTextList("Listing Builder Brief", actionListingBuilderBriefItems(row)),
    "",
    optionalRecipeTextList("Image Queue", actionImageQueueItems(row)),
    "",
    recipeTextList("Title Phrases", actionTitlePhrases(row)),
    "",
    recipeTextList("Thumbnail Angle", [actionThumbnailAngle(row)]),
    "",
    recipeTextList("Tags To Test", actionTagIdeas(row)),
    "",
    recipeTextList("Price", [actionPriceNote(row)]),
    "",
    recipeTextList("Personalization", [actionPersonalizationField(row)]),
    "",
    recipeTextList("Source Notes", sourceNotes),
    "",
    recipeTextList("Evidence Trail", actionEvidenceTrail(row)),
    "",
    recipeTextList("Source Audit", actionTraceAuditItems(row)),
    "",
    recipeTextList("Blank Notes", [actionBlankNote(row)]),
    "",
    recipeTextList("Next Step", [row["Next Step"] || "Review the source row and decide the listing move."]),
    "",
    recipeTextList("Evidence", [row.Evidence || "No evidence note available."])
  ].filter(line => line !== null).join("\n");
}

async function copyNextActionRecipe(row, visibleCount, totalCount) {
  const text = actionRecipeExportText(row, visibleCount, totalCount);
  if (!navigator.clipboard?.writeText) {
    setNextActionShareStatus("Recipe copy unavailable in this browser.");
    return;
  }
  await navigator.clipboard.writeText(text);
  setNextActionShareStatus("Recipe copied for listing work.");
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
  const evidence = row.Evidence || "No evidence note available.";
  const nextStep = row["Next Step"] || "Review the source row and decide the listing move.";
  const company = actionEvidenceCompany(row);
  const links = [
    `<button class="link-button" type="button" data-next-action-recipe-copy="${escapeHtml(nextActionKey(row))}">Copy recipe</button>`,
    `<button class="link-button" type="button" data-next-action-listings-trace="${escapeHtml(nextActionKey(row))}">Trace listings</button>`,
    `<button class="link-button" type="button" data-next-action-buyer-trace="${escapeHtml(nextActionKey(row))}">Trace buyer moment</button>`,
    company ? `<button class="link-button" type="button" data-next-action-company-trace="${escapeHtml(nextActionKey(row))}">Trace company</button>` : "",
    row["Market Listing URL"] ? `<a class="link-button" href="${escapeHtml(row["Market Listing URL"])}" target="_blank" rel="noreferrer">Market source</a>` : "",
    row["My Listing URL"] ? `<a class="link-button" href="${escapeHtml(row["My Listing URL"])}" target="_blank" rel="noreferrer">My listing</a>` : ""
  ].filter(Boolean).join("");
  const titlePhrases = actionTitlePhrases(row);
  const tagIdeas = actionTagIdeas(row);
  const listingBuilderBrief = actionListingBuilderBriefItems(row);
  const imageQueue = actionImageQueueItems(row);
  const sourceNotes = uniqueRecipeItems([
    `${row["Source Signal"] || "Source signal"} · ${row.Confidence || "confidence pending"}`,
    row["Evidence Trace"] || "",
    row.Evidence || "No evidence note available.",
    row["Market Listing URL"] ? "Market source link is available for live price, title, and thumbnail validation." : "",
    row["My Listing URL"] ? "Existing MyMaravia listing is attached for comparison." : "No MyMaravia listing is attached yet."
  ], 4);
  target.innerHTML = `
    <div class="action-recipe">
      <div class="action-recipe-head">
        <div>
          <div class="action-recipe-title">
            <strong>${type}: ${product}</strong>
            <span class="badge good">Priority ${escapeHtml(fmt(row.Priority, "Priority") || "")}</span>
          </div>
          <div class="action-recipe-meta">${category} · score ${score} · ${daily} expected daily sales · showing ${fmt(visibleCount, "Listing Count")} of ${fmt(totalCount, "Listing Count")} actions.</div>
        </div>
        <div class="action-recipe-links">${links}</div>
      </div>
      <div class="action-recipe-grid">
        ${optionalRecipeBlock("Listing Builder Brief", listingBuilderBrief)}
        ${optionalRecipeBlock("Image Queue", imageQueue)}
        <div class="action-recipe-block"><h3>Title Phrases</h3>${recipeList(titlePhrases)}</div>
        <div class="action-recipe-block"><h3>Thumbnail Angle</h3>${recipeList([actionThumbnailAngle(row)])}</div>
        <div class="action-recipe-block"><h3>Tags To Test</h3>${recipeList(tagIdeas)}</div>
        <div class="action-recipe-block"><h3>Price</h3>${recipeList([actionPriceNote(row)])}</div>
        <div class="action-recipe-block"><h3>Personalization</h3>${recipeList([actionPersonalizationField(row)])}</div>
        <div class="action-recipe-block"><h3>Source Notes</h3>${recipeList(sourceNotes)}</div>
        <div class="action-recipe-block"><h3>Evidence Trail</h3>${recipeTraceList(cachedActionTraceItems(row))}</div>
        <div class="action-recipe-block"><h3>Source Audit</h3>${recipeList(actionTraceAuditItems(row))}</div>
        <div class="action-recipe-block"><h3>Blank Notes</h3>${recipeList([actionBlankNote(row)])}</div>
        <div class="action-recipe-block"><h3>Next Step</h3>${recipeList([nextStep])}</div>
        <div class="action-recipe-block"><h3>Evidence</h3>${recipeList([evidence])}</div>
      </div>
    </div>`;
  const copyRecipe = target.querySelector("[data-next-action-recipe-copy]");
  if (copyRecipe) {
    copyRecipe.addEventListener("click", () => {
      copyNextActionRecipe(row, visibleCount, totalCount).catch(() => setNextActionShareStatus("Recipe copy failed."));
    });
  }
  const listingsTrace = target.querySelector("[data-next-action-listings-trace]");
  if (listingsTrace) listingsTrace.addEventListener("click", () => openActionListingEvidence(row));
  const buyerTrace = target.querySelector("[data-next-action-buyer-trace]");
  if (buyerTrace) buyerTrace.addEventListener("click", () => openActionBuyerMomentEvidence(row));
  const companyTrace = target.querySelector("[data-next-action-company-trace]");
  if (companyTrace) companyTrace.addEventListener("click", () => openActionCompanyEvidence(row));
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
  const selectedNextAction = selectedNextActionFromRows(visibleNextActions);
  const traceMix = nextActionTraceMix(visibleNextActions);
  const nextActionsSummary = document.getElementById("next-actions-summary");
  if (nextActionsSummary) {
    nextActionsSummary.textContent = selectedNextAction
      ? `${fmt(visibleNextActions.length, "Listing Count")} visible of ${fmt(nextActions.length, "Listing Count")} ranked actions. Trace: ${fmt(traceMix.strong, "Listing Count")} strong, ${fmt(traceMix.good, "Listing Count")} good, ${fmt(traceMix.audit, "Listing Count")} audit. Selected: priority ${fmt(selectedNextAction.Priority, "Priority")} ${selectedNextAction["Action Type"]} - ${selectedNextAction["Product / Listing"] || selectedNextAction.Action || "selected opportunity"}.`
      : "No next-action rows are available in this snapshot.";
  }
  renderNextActionRecipe(selectedNextAction, visibleNextActions.length, nextActions.length);
  renderNextActionTable(visibleNextActions, [
    "Priority", "Action Type", "Action", "Target Category", "Product / Listing",
    "Action Score", "Expected Daily Sales", "Source Signal", "Confidence", "Trace Strength", "Trace Audit",
    "Evidence", "Next Step", "Market Listing URL", "My Listing URL"
  ], 40, selectedNextAction);

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
  renderStatusTable("mymaravia-accuracy-health", my.accuracyHealth || [], [
    "Status", "Check", "Finding", "Expected", "Decision Impact", "Next Action"
  ], 8);
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

  const stateAudit = my.stateChangeAudit || {};
  const stateSummary = Array.isArray(stateAudit.summary) ? stateAudit.summary : [];
  const stateRows = Array.isArray(stateAudit.rows) ? stateAudit.rows : [];
  const stateChangeText = document.getElementById("mymaravia-state-change-summary");
  if (stateChangeText) {
    const summaryBits = stateSummary
      .map(row => `${fmt(row.Listings, "Listing Count")} ${String(row["Change Type"] || "").toLowerCase()}`)
      .filter(Boolean);
    const resolutionBit = stateAudit.resolutionRead ? ` Resolver: ${stateAudit.resolutionRead}.` : "";
    stateChangeText.textContent = stateRows.length
      ? `Latest Etsy refresh run ${stateAudit.latestRunId || "unknown"}: ${summaryBits.join(" / ")}.${resolutionBit}`
      : "No captured active/draft listing state changes in this snapshot.";
  }
  renderTable("mymaravia-state-change-table", stateRows, [
    "Change Type", "Previous State", "Current State", "Listing ID", "Product Title",
    "Resolved State", "Resolution Status", "Resolution Read", "Resolved At",
    "Decision Impact", "Resolved Listing URL", "Listing URL", "Previous Snapshot", "Current Snapshot"
  ], 120, { preserveOrder: true });

  const tagRank = my.tagRankMonitor || {};
  const tagSummary = tagRank.summary || {};
  const tagScanDepth = tagSummary.scanDepth || "";
  const tagRankText = document.getElementById("mymaravia-tag-rank-summary");
  if (tagRankText) {
    if (tagSummary.status === "OK") {
      tagRankText.textContent =
        `Generated ${tagSummary.generatedAt || "unknown"} from live Etsy active listings; API score rank scan depth ${tagScanDepth || "unknown"}.`;
    } else {
      tagRankText.textContent = tagSummary.rankCaveat || "Tag-rank monitor has not been generated yet.";
    }
  }
  const tagMetricRows = [
    ["Active listings", fmt(tagSummary.activeListingCount, "Active Listings") || "0"],
    ["Unique tags scanned", fmt(tagSummary.uniqueTagCount, "Unique Tags Scanned") || "0"],
    ["Listing-tag rows", fmt(tagSummary.tagRowCount, "Tag Rows") || "0"],
    ["Found in scan", fmt(tagSummary.foundWithinScan, "Found Within Scan") || "0"],
    ["Not found", fmt(tagSummary.notFoundWithinScan, "Not Found Within Scan") || "0"],
    ["Best top-20 tags", fmt(tagSummary.bestTop20TagCount, "Best Top 20 Tags") || "0"]
  ];
  const tagRankMetrics = document.getElementById("mymaravia-tag-rank-metrics");
  if (tagRankMetrics) tagRankMetrics.innerHTML = tagMetricRows.map(([label, value]) => metric(label, value)).join("");
  const tagRankCaveat = document.getElementById("mymaravia-tag-rank-caveat");
  if (tagRankCaveat) tagRankCaveat.textContent = tagSummary.rankCaveat || "";
  renderTable("mymaravia-tag-rank-weak-tags", tagRank.weakTagRows || [], [
    "Product Title", "Tag", "API Score Rank", "Search Result Count", "Rank Read", "Suggested Tag Action", "Listing URL"
  ], 80, { preserveOrder: true });
  renderTable("mymaravia-tag-rank-listings", tagRank.listingRows || [], [
    "Product Title", "State", "Tag Count", "Tags Found In Scan", "Tags Not In Scan",
    "Best API Rank", "Median Found API Rank", "Rank Read", "Favorites", "Listing URL", "Tags"
  ], 120, { preserveOrder: true });
  renderTable("mymaravia-tag-rank-detail", tagRank.detailRows || [], [
    "Product Title", "Tag #", "Tag", "API Score Rank", "Rank Status", "Search Result Count",
    "Results Scanned", "Rank Read", "Suggested Tag Action", "Listing URL"
  ], 900, { preserveOrder: true });

  const diagnosticStatus = document.getElementById("my-listing-status-filter")?.value || "";
  const listingState = document.getElementById("my-listing-state-filter")?.value || "";
  const listingQuery = (document.getElementById("my-listing-search")?.value || "").trim().toLowerCase();
  const allDiagnostics = my.listingDiagnostics || [];
  let diagnosticRows = allDiagnostics;
  if (diagnosticStatus) diagnosticRows = diagnosticRows.filter(row => String(row["Conquest Status"] || "").toLowerCase() === diagnosticStatus.toLowerCase());
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
  if (status) rows = rows.filter(row => String(row.Status || "").toLowerCase() === status.toLowerCase());
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

function handleListingInputChange() {
  markListingSearchDirty();
}

function handleListingFilterChange() {
  markListingSearchDirty();
}

function renderListings() {
  const filters = ensureAppliedListingFilters();
  const query = filters.query;
  const production = filters.production;
  selectedListingSubstrate = filters.substrate;
  selectedListingTimeframePreset = filters.timeframe;
  const timeframeWindow = selectedListingTimeframeWindow(filters);
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
  let timeframeStatus = "";
  const hasValidTimeframe = timeframeWindow && !timeframeWindow.invalid;
  if (timeframeWindow?.invalid) {
    rows = [];
    timeframeStatus = `Custom timeframe is invalid: ${timeframeWindow.display}.`;
  } else if (hasValidTimeframe) {
    rows = rows
      .map(row => listingTimeframeMetricRow(row, timeframeWindow))
      .filter(listingHasTimeframeSignal);
    timeframeStatus = `Last-year timeframe: ${timeframeWindow.display}. Showing only listings with sales/review signal in that range.`;
  }
  rows = sortListingRows(rows, filters.sort);
  const count = fmt(rows.length, "Listing Count");
  const totalCount = allRows.length + reviewListingTotal();
  const total = fmt(totalCount, "Listing Count");
  const shown = Math.min(rows.length, LISTING_RENDER_LIMIT);
  const status = reviewListingStatusText(query, production, selectedListingSubstrate);
  const baseText = rows.length === totalCount
    ? `Showing first ${fmt(shown, "Listing Count")} of ${total} listings`
    : `Showing first ${fmt(shown, "Listing Count")} of ${count} visible/matching listings from ${total} total`;
  document.getElementById("listing-count").textContent = [baseText, timeframeStatus, status].filter(Boolean).join(" ");
  const timeframeColumns = hasValidTimeframe ? [
    "Last Year Timeframe Window", "Last Year Timeframe Estimated Sales", "Last Year Timeframe Avg Daily Sales",
    "Last Year Timeframe Review Count", "Last Year Timeframe Weeks With Demand", "Last Year Timeframe Signal"
  ] : [];
  renderTable("top-listings", rows, [
    "Overall Rank", "Thumbnail", "Weekly Sales Graph", "Recent Daily Sales", "Recent Weekly Sales", "Weekly Trend", "Peak Sales Week", "Peak Daily Sales", "Peak Weekly Sales",
    ...timeframeColumns,
    "Shop", "Est. Daily Sales", "Est. 30D Sales", "Blank / Generic Sources", "Product Title", "Tags", "Tags Source", "Best Guess Tags", "Product Category", "Product Substrate Category", "Product Family", "Taxonomy Confidence", "Taxonomy Evidence",
    "Production Tag", "Customization Tag", "Tag Confidence", "Tag Evidence",
    "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D",
    "Review Corpus Avg Rating", "Review Corpus Latest ISO", "Evidence Confidence", "Last Review ISO", "Listing URL"
  ], LISTING_RENDER_LIMIT);
  renderListingCycle(selectedListingCycleKey);
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
  if (viewId === "company") {
    renderCompanyOptions();
    renderCompanyProfile();
  }
  if (viewId === "market-size") renderMarketSize();
  if (viewId === "market-penetration") renderMarketPenetration();
  updateViewUrl(viewId);
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
    handleListingFilterChange();
  });
  [startInput, endInput].forEach(input => {
    input.addEventListener("input", () => {
      markListingTimeframeCustom();
      handleListingFilterChange();
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

  const syncCountedOptions = (select, counts) => {
    if (!select) return;
    [...select.options].forEach(option => {
      if (option.dataset.generated === "true") option.remove();
    });
    const normalizedCounts = new Map(
      [...counts.entries()].map(([value, count]) => [String(value).toLowerCase(), { value, count }])
    );
    const existing = new Set();
    [...select.options].forEach(option => {
      if (!option.dataset.baseLabel) option.dataset.baseLabel = option.textContent;
      const normalizedValue = String(option.value || "").toLowerCase();
      if (normalizedValue) existing.add(normalizedValue);
      const match = normalizedCounts.get(normalizedValue);
      if (normalizedValue && !match) {
        option.hidden = true;
        option.disabled = true;
      } else {
        option.hidden = false;
        option.disabled = false;
      }
      option.textContent = match
        ? `${option.dataset.baseLabel} (${match.count.toLocaleString()})`
        : option.dataset.baseLabel;
    });
    if (select.selectedOptions[0]?.disabled) select.value = "";
    [...counts.entries()]
      .filter(([value]) => value && !existing.has(String(value).toLowerCase()))
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
      .forEach(([value, count]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = `${value} (${count.toLocaleString()})`;
        option.dataset.generated = "true";
        select.appendChild(option);
      });
  };
  const diagnosticCounts = new Map();
  (dashboard.myMaravia?.listingDiagnostics || []).forEach(row => {
    const status = String(row["Conquest Status"] || "").trim();
    if (status) diagnosticCounts.set(status, (diagnosticCounts.get(status) || 0) + 1);
  });
  const queueStatusCounts = new Map();
  (dashboard.myMaravia?.longTailQueue || []).forEach(row => {
    const status = String(row.Status || "").trim();
    if (status) queueStatusCounts.set(status, (queueStatusCounts.get(status) || 0) + 1);
  });
  syncCountedOptions(document.getElementById("my-listing-status-filter"), diagnosticCounts);
  syncCountedOptions(document.getElementById("my-status-filter"), queueStatusCounts);

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

function initListingStateRecoveryFilters() {
  const rows = dashboard.operations?.listingStateRecoveryQueue || [];
  const segmentSelect = document.getElementById("listing-state-recovery-segment-filter");
  const statusSelect = document.getElementById("listing-state-recovery-status-filter");
  if (!segmentSelect || !statusSelect) return;

  if (segmentSelect.dataset.ready !== "true") {
    const segments = [...new Set(rows.map(row => row.Segment).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    segments.forEach(segment => {
      const option = document.createElement("option");
      option.value = segment;
      option.textContent = segment;
      segmentSelect.appendChild(option);
    });
    segmentSelect.dataset.ready = "true";
  }

  if (statusSelect.dataset.ready !== "true") {
    const statuses = [...new Set(rows.map(row => row["Recovery Status"]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    statuses.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      statusSelect.appendChild(option);
    });
    statusSelect.dataset.ready = "true";
  }

  ["listing-state-recovery-segment-filter", "listing-state-recovery-status-filter"].forEach(id => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener("change", () => {
      setListingStateRecoveryCopyStatus("");
      renderOperations();
    });
    element.dataset.bound = "true";
  });

  const copy = document.getElementById("listing-state-recovery-copy");
  if (copy && copy.dataset.bound !== "true") {
    copy.addEventListener("click", () => {
      copyListingStateRecoveryHandoff().catch(() => setListingStateRecoveryCopyStatus("Handoff copy failed."));
    });
    copy.dataset.bound = "true";
  }

  const decisionCopy = document.getElementById("listing-state-recovery-decision-copy");
  if (decisionCopy && decisionCopy.dataset.bound !== "true") {
    decisionCopy.addEventListener("click", () => {
      copyListingStateRecoveryDecisionTsv().catch(() => setListingStateRecoveryCopyStatus("Decision TSV copy failed."));
    });
    decisionCopy.dataset.bound = "true";
  }

  const executionDecisionCopy = document.getElementById("listing-state-recovery-execution-decision-copy");
  if (executionDecisionCopy && executionDecisionCopy.dataset.bound !== "true") {
    executionDecisionCopy.addEventListener("click", () => {
      copyListingStateRecoveryExecutionDecisionTsv()
        .catch(() => setListingStateRecoveryExecutionCopyStatus("Execution TSV copy failed."));
    });
    executionDecisionCopy.dataset.bound = "true";
  }

  const intakeBriefCopy = document.getElementById("listing-state-recovery-intake-copy");
  if (intakeBriefCopy && intakeBriefCopy.dataset.bound !== "true") {
    intakeBriefCopy.addEventListener("click", () => {
      copyListingStateRecoveryDecisionIntakeBrief()
        .catch(() => setListingStateRecoveryIntakeCopyStatus("Decision intake copy failed."));
    });
    intakeBriefCopy.dataset.bound = "true";
  }

  const intakeTsvCopy = document.getElementById("listing-state-recovery-intake-tsv-copy");
  if (intakeTsvCopy && intakeTsvCopy.dataset.bound !== "true") {
    intakeTsvCopy.addEventListener("click", () => {
      copyListingStateRecoveryDecisionIntakeTsv()
        .catch(() => setListingStateRecoveryIntakeCopyStatus("Decision intake TSV copy failed."));
    });
    intakeTsvCopy.dataset.bound = "true";
  }

  const reset = document.getElementById("listing-state-recovery-reset");
  if (reset && reset.dataset.bound !== "true") {
    reset.addEventListener("click", () => {
      segmentSelect.value = "";
      statusSelect.value = "";
      setListingStateRecoveryCopyStatus("");
      renderOperations();
    });
    reset.dataset.bound = "true";
  }
}

function filteredListingStateRecoveryQueue() {
  const rows = dashboard.operations?.listingStateRecoveryQueue || [];
  const segment = document.getElementById("listing-state-recovery-segment-filter")?.value || "";
  const status = document.getElementById("listing-state-recovery-status-filter")?.value || "";
  return rows.filter(row => {
    if (segment && row.Segment !== segment) return false;
    if (status && row["Recovery Status"] !== status) return false;
    return true;
  });
}

function listingStateRecoveryFilterRead() {
  const segment = document.getElementById("listing-state-recovery-segment-filter")?.value || "";
  const status = document.getElementById("listing-state-recovery-status-filter")?.value || "";
  return {
    segment,
    status,
    label: [
      segment ? `Segment: ${segment}` : "Segment: All",
      status ? `Status: ${status}` : "Status: All"
    ].join(" | ")
  };
}

function setListingStateRecoveryCopyStatus(message) {
  const target = document.getElementById("listing-state-recovery-copy-status");
  if (target) target.textContent = message || "";
}

function setListingStateRecoveryExecutionCopyStatus(message) {
  const target = document.getElementById("listing-state-recovery-execution-copy-status");
  if (target) target.textContent = message || "";
}

function setListingStateRecoveryIntakeCopyStatus(message) {
  const target = document.getElementById("listing-state-recovery-intake-copy-status");
  if (target) target.textContent = message || "";
}

function countByRecoveryField(rows, field) {
  const counts = new Map();
  rows.forEach(row => {
    const key = row[field] || "Unspecified";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key}: ${count}`);
}

function recoveryHandoffValue(row, key, fallback = "n/a") {
  const value = row?.[key];
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function listingStateRecoveryBatchForSegment(segment) {
  return (dashboard.operations?.listingStateRecoveryBatches || [])
    .find(row => row.Segment === segment) || null;
}

function recoveryRowsForSegment(segment) {
  return (dashboard.operations?.listingStateRecoveryQueue || [])
    .filter(row => row.Segment === segment);
}

function recoveryBatchHandoffCell(row) {
  const segment = row?.Segment || "";
  if (!segment) return "";
  return `<button class="link-button recovery-batch-copy" type="button" data-recovery-batch-segment="${escapeHtml(segment)}">Copy batch</button>`;
}

function listingStateRecoveryHandoffText(rows = filteredListingStateRecoveryQueue(), options = {}) {
  const total = dashboard.operations?.listingStateRecoveryQueue?.length || 0;
  const filters = listingStateRecoveryFilterRead();
  const statusSummary = countByRecoveryField(rows, "Recovery Status").join(", ") || "No visible rows";
  const segmentSummary = countByRecoveryField(rows, "Segment").join("; ") || "No visible rows";
  const lines = [
    "Cronk Research - Listing State Recovery Handoff",
    `Generated: ${new Date().toISOString()}`,
    options.scopeLabel || filters.label,
    ...(options.extraSummary || []),
    `Visible rows: ${rows.length} of ${total}`,
    `Recovery status counts: ${statusSummary}`,
    `Segment counts: ${segmentSummary}`,
    "",
    "Rows"
  ];
  rows.forEach((row, index) => {
    lines.push(
      `${index + 1}. [${recoveryHandoffValue(row, "Recovery Status")}] ${recoveryHandoffValue(row, "Segment")} - ${recoveryHandoffValue(row, "Product Title")}`,
      `   Listing ID: ${recoveryHandoffValue(row, "Listing ID")}`,
      `   State: ${recoveryHandoffValue(row, "Previous State")} -> ${recoveryHandoffValue(row, "Resolved State")}`,
      `   Decision: ${recoveryHandoffValue(row, "Recovery Decision")}`,
      `   Next action: ${recoveryHandoffValue(row, "Next Action")}`,
      `   Why it matters: ${recoveryHandoffValue(row, "Why It Matters")}`,
      `   Etsy listing: ${recoveryHandoffValue(row, "Resolved Listing URL")}`,
      `   Replacement lead: ${recoveryHandoffValue(row, "Possible Replacement Listing")}`,
      `   Replacement URL: ${recoveryHandoffValue(row, "Replacement URL")}`,
      ""
    );
  });
  return lines.join("\n").trim();
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.left = "-1000px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

async function copyListingStateRecoveryHandoff() {
  const rows = filteredListingStateRecoveryQueue();
  const text = listingStateRecoveryHandoffText(rows);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else if (!fallbackCopyText(text)) {
    setListingStateRecoveryCopyStatus("Handoff copy unavailable in this browser.");
    return;
  }
  setListingStateRecoveryCopyStatus(`${fmt(rows.length, "Listing Count")} recovery rows copied.`);
}

function tsvCell(value) {
  return String(value ?? "")
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, " ")
    .trim();
}

function listingStateRecoveryDecisionTsv(rows = filteredListingStateRecoveryQueue()) {
  const headers = [
    "Decision Status",
    "Final Decision",
    "Decision Date",
    "Decision Owner",
    "Decision Notes",
    "Segment",
    "Listing ID",
    "Product Title",
    "Recovery Status",
    "Previous State",
    "Resolved State",
    "Recommended Decision",
    "Recommended Next Action",
    "Why It Matters",
    "Resolved Listing URL",
    "Replacement Lead",
    "Replacement URL",
    "Resolved At"
  ];
  const dataRows = rows.map(row => [
    "",
    "",
    "",
    "",
    "",
    row.Segment,
    row["Listing ID"],
    row["Product Title"],
    row["Recovery Status"],
    row["Previous State"],
    row["Resolved State"],
    row["Recovery Decision"],
    row["Next Action"],
    row["Why It Matters"],
    row["Resolved Listing URL"],
    row["Possible Replacement Listing"],
    row["Replacement URL"],
    row["Resolved At"]
  ]);
  return [headers, ...dataRows]
    .map(row => row.map(tsvCell).join("\t"))
    .join("\n");
}

function listingStateRecoveryExecutionDecisionTsv(rows = dashboard.operations?.listingStateRecoveryExecutionPlan || []) {
  const headers = [
    "Decision Status",
    "Final Decision",
    "Decision Date",
    "Decision Owner",
    "Decision Notes",
    "Segment",
    "Listing ID",
    "Product Title",
    "Recovery Status",
    "Previous State",
    "Resolved State",
    "Recommended Decision",
    "Recommended Next Action",
    "Why It Matters",
    "Resolved Listing URL",
    "Replacement Lead",
    "Replacement URL",
    "Resolved At"
  ];
  const dataRows = rows.map(row => [
    "",
    "",
    "",
    "",
    "",
    row.Segment,
    row["Listing ID"],
    row["Product Title"],
    row["Recovery Status"],
    row["Previous State"],
    row["Resolved State"],
    row["Suggested Final Decision"],
    row["Execution Step"],
    row["No-Write Confirmation Gate"],
    row["Current Etsy Listing URL"],
    row["Replacement Lead"],
    row["Replacement URL"],
    ""
  ]);
  return [headers, ...dataRows]
    .map(row => row.map(tsvCell).join("\t"))
    .join("\n");
}

function listingStateRecoveryDecisionIntakeBrief(rows = dashboard.operations?.listingStateRecoveryDecisionIntake || []) {
  const statusRow = dashboard.operations?.listingStateRecoveryDecisionStatus?.[0] || {};
  const statusOptions = statusRow["Allowed Decision Statuses"] || "Confirmed, Needs Review, Deferred, Blocked";
  const finalOptions = statusRow["Allowed Final Decisions"] || "Publish/reactivate, Return to draft, Park, Replace, Retire, No action";
  const segmentSummary = countByRecoveryField(rows, "Segment").join("; ") || "No intake rows";
  const lines = [
    "Cronk Research - Recovery Decision Intake Brief",
    `Generated: ${new Date().toISOString()}`,
    `Rows needing review: ${rows.length}`,
    `Segments: ${segmentSummary}`,
    `Allowed Decision Status values: ${statusOptions}`,
    `Allowed Final Decision values: ${finalOptions}`,
    "No-write gate: Do not publish, reactivate, retire, or replace until Brandon confirms the listing ID and final decision.",
    "",
    "Rows"
  ];
  rows.forEach((row, index) => {
    lines.push(
      `${index + 1}. ${recoveryHandoffValue(row, "Segment")} - ${recoveryHandoffValue(row, "Product Title")}`,
      `   Listing ID: ${recoveryHandoffValue(row, "Listing ID")}`,
      `   State: ${recoveryHandoffValue(row, "Previous State")} -> ${recoveryHandoffValue(row, "Resolved State")} (${recoveryHandoffValue(row, "Recovery Status")})`,
      `   Candidate final decision: ${recoveryHandoffValue(row, "Candidate Final Decision")}`,
      `   Final decision options: ${recoveryHandoffValue(row, "Final Decision Options")}`,
      `   Reason: ${recoveryHandoffValue(row, "Candidate Reason")}`,
      `   Review prompt: ${recoveryHandoffValue(row, "Review Prompt")}`,
      `   Current Etsy listing: ${recoveryHandoffValue(row, "Current Etsy Listing URL")}`,
      `   Replacement lead: ${recoveryHandoffValue(row, "Replacement Lead")}`,
      `   Replacement URL: ${recoveryHandoffValue(row, "Replacement URL")}`,
      `   Market evidence: ${recoveryHandoffValue(row, "Market Evidence")}`,
      ""
    );
  });
  return lines.join("\n").trim();
}

function listingStateRecoveryDecisionIntakeTsv(rows = dashboard.operations?.listingStateRecoveryDecisionIntake || []) {
  const headers = [
    "Worksheet Type",
    "Decision Status (fill)",
    "Final Decision (fill)",
    "Decision Date (fill)",
    "Decision Owner (fill)",
    "Decision Notes (fill)",
    "Review Priority",
    "Segment",
    "Listing ID",
    "Product Title",
    "Recovery Status",
    "Previous State",
    "Resolved State",
    "Candidate Final Decision",
    "Final Decision Options",
    "Decision Status Options",
    "Candidate Reason",
    "Review Prompt",
    "Decision Guard",
    "Current Etsy Listing URL",
    "Replacement Lead",
    "Replacement URL",
    "Market Evidence",
    "TSV Fill Reminder"
  ];
  const dataRows = rows.map(row => [
    "Decision intake worksheet - copy confirmed decisions into the Recovery Decision Log TSV",
    "",
    "",
    "",
    "",
    "",
    row["Review Priority"],
    row.Segment,
    row["Listing ID"],
    row["Product Title"],
    row["Recovery Status"],
    row["Previous State"],
    row["Resolved State"],
    row["Candidate Final Decision"],
    row["Final Decision Options"],
    row["Decision Status Options"],
    row["Candidate Reason"],
    row["Review Prompt"],
    row["Decision Guard"],
    row["Current Etsy Listing URL"],
    row["Replacement Lead"],
    row["Replacement URL"],
    row["Market Evidence"],
    row["TSV Fill Reminder"]
  ]);
  return [headers, ...dataRows]
    .map(row => row.map(tsvCell).join("\t"))
    .join("\n");
}

async function copyListingStateRecoveryDecisionTsv() {
  const rows = filteredListingStateRecoveryQueue();
  const text = listingStateRecoveryDecisionTsv(rows);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else if (!fallbackCopyText(text)) {
    setListingStateRecoveryCopyStatus("Decision TSV copy unavailable in this browser.");
    return;
  }
  setListingStateRecoveryCopyStatus(`${fmt(rows.length, "Listing Count")} decision rows copied.`);
}

async function copyListingStateRecoveryExecutionDecisionTsv() {
  const rows = dashboard.operations?.listingStateRecoveryExecutionPlan || [];
  const text = listingStateRecoveryExecutionDecisionTsv(rows);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else if (!fallbackCopyText(text)) {
    setListingStateRecoveryExecutionCopyStatus("Execution TSV copy unavailable in this browser.");
    return;
  }
  setListingStateRecoveryExecutionCopyStatus(`${fmt(rows.length, "Listing Count")} execution decision rows copied.`);
}

async function copyListingStateRecoveryDecisionIntakeBrief() {
  const rows = dashboard.operations?.listingStateRecoveryDecisionIntake || [];
  const text = listingStateRecoveryDecisionIntakeBrief(rows);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else if (!fallbackCopyText(text)) {
    setListingStateRecoveryIntakeCopyStatus("Decision intake copy unavailable in this browser.");
    return;
  }
  setListingStateRecoveryIntakeCopyStatus(`${fmt(rows.length, "Listing Count")} decision-intake rows copied.`);
}

async function copyListingStateRecoveryDecisionIntakeTsv() {
  const rows = dashboard.operations?.listingStateRecoveryDecisionIntake || [];
  const text = listingStateRecoveryDecisionIntakeTsv(rows);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else if (!fallbackCopyText(text)) {
    setListingStateRecoveryIntakeCopyStatus("Decision intake TSV copy unavailable in this browser.");
    return;
  }
  setListingStateRecoveryIntakeCopyStatus(`${fmt(rows.length, "Listing Count")} decision-intake worksheet rows copied.`);
}

async function copyListingStateRecoveryBatchHandoff(segment) {
  const rows = recoveryRowsForSegment(segment);
  const batch = listingStateRecoveryBatchForSegment(segment);
  const extraSummary = batch ? [
    `Batch status: ${recoveryHandoffValue(batch, "Batch Status")}`,
    `Batch action: ${recoveryHandoffValue(batch, "Batch Action")}`,
    `Batch listings: ${recoveryHandoffValue(batch, "Listings")}`,
    `Evidence read: ${recoveryHandoffValue(batch, "Evidence Read")}`
  ] : [];
  const text = listingStateRecoveryHandoffText(rows, {
    scopeLabel: `Recovery batch: ${segment}`,
    extraSummary
  });
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else if (!fallbackCopyText(text)) {
    setListingStateRecoveryCopyStatus("Batch handoff copy unavailable in this browser.");
    return;
  }
  setListingStateRecoveryCopyStatus(`${segment}: ${fmt(rows.length, "Listing Count")} recovery rows copied.`);
}

function bindRecoveryBatchHandoffButtons() {
  document.querySelectorAll("[data-recovery-batch-segment]").forEach(button => {
    button.addEventListener("click", () => {
      copyListingStateRecoveryBatchHandoff(button.dataset.recoveryBatchSegment || "")
        .catch(() => setListingStateRecoveryCopyStatus("Batch handoff copy failed."));
    });
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

function initMarketSizeFilters() {
  const productSelect = document.getElementById("market-size-product-filter");
  if (!productSelect) return;

  if (productSelect.dataset.ready !== "true") {
    const existingValues = new Set([...productSelect.options].map(option => option.value));
    marketSizeProductOptions().forEach(product => {
      if (existingValues.has(product)) return;
      const option = document.createElement("option");
      option.value = product;
      option.textContent = product;
      productSelect.appendChild(option);
      existingValues.add(product);
    });
    productSelect.dataset.ready = "true";
  }

  ["market-size-product-filter", "market-size-source-filter", "market-size-sort", "market-size-search"].forEach(id => {
    const element = document.getElementById(id);
    if (!element || element.dataset.bound === "true") return;
    element.addEventListener("input", () => {
      if (id === "market-size-product-filter") selectedMarketSizeProduct = element.value;
      renderMarketSize();
      updateViewUrl("market-size");
    });
    element.addEventListener("change", () => {
      if (id === "market-size-product-filter") selectedMarketSizeProduct = element.value;
      renderMarketSize();
      updateViewUrl("market-size");
    });
    element.dataset.bound = "true";
  });
}

function initCompanyProfile() {
  const allCompanies = companyStats();
  if (!selectedCompany) {
    selectedCompany = allCompanies.has("MyMaravia") ? "MyMaravia" : companyOptions()[0]?.name || "";
  }
  applyCompanyUrlState();
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
        updateViewUrl("company");
        document.getElementById("company-listings")?.scrollIntoView({ block: "start" });
        return;
      }

      const cycleTarget = event.target.closest(".cycle-link");
      if (cycleTarget) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
        event.preventDefault();
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
      updateViewUrl("company");
    });
    clearProduction.dataset.bound = "true";
  }

  renderCompanyProfile();
}

function reviewMappingGapRows() {
  return Array.isArray(dashboard.operations?.reviewMappingGapDetails)
    ? dashboard.operations.reviewMappingGapDetails
    : [];
}

function reviewMappingGapControlValues() {
  return {
    status: document.getElementById("review-mapping-gap-status")?.value || "",
    shop: document.getElementById("review-mapping-gap-shop")?.value || "",
    query: (document.getElementById("review-mapping-gap-search")?.value || "").trim().toLowerCase()
  };
}

function reviewMappingGapSearchText(row) {
  return [
    row.Status,
    row.Shop,
    row["Listing ID"],
    row["Listing URL"],
    row["Missing Fields"],
    row["Mapping State"],
    row["Repair Priority"],
    row["Repair Read"],
    row["Evidence Safety"],
    row["Next Action"]
  ].map(value => String(value || "").toLowerCase()).join(" ");
}

function filteredReviewMappingGapRows(rows) {
  const filters = reviewMappingGapControlValues();
  return rows.filter(row => {
    if (filters.status && row.Status !== filters.status) return false;
    if (filters.shop && row.Shop !== filters.shop) return false;
    if (filters.query && !reviewMappingGapSearchText(row).includes(filters.query)) return false;
    return true;
  });
}

function renderReviewMappingGapControls(rows) {
  const target = document.getElementById("review-mapping-gap-controls");
  if (!target) return;
  const shops = [...new Set(rows.map(row => row.Shop).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const statuses = [...new Set(rows.map(row => row.Status).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const signature = JSON.stringify({ shops, statuses });
  if (reviewMappingGapControlSignature === signature && target.dataset.bound === "true") return;
  const current = reviewMappingGapControlValues();
  reviewMappingGapControlSignature = signature;
  target.innerHTML = `
    <div class="mapping-gap-controls">
      <label>
        <span>Status</span>
        <select id="review-mapping-gap-status">
          <option value="">All statuses</option>
          ${statuses.map(status => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Shop</span>
        <select id="review-mapping-gap-shop">
          <option value="">All shops</option>
          ${shops.map(shop => `<option value="${escapeHtml(shop)}">${escapeHtml(shop)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Search</span>
        <input id="review-mapping-gap-search" type="search" placeholder="listing, shop, repair lane">
      </label>
    </div>
  `;
  const status = document.getElementById("review-mapping-gap-status");
  const shop = document.getElementById("review-mapping-gap-shop");
  const search = document.getElementById("review-mapping-gap-search");
  if (status) status.value = statuses.includes(current.status) ? current.status : "";
  if (shop) shop.value = shops.includes(current.shop) ? current.shop : "";
  if (search) search.value = current.query;
  [status, shop].forEach(control => control?.addEventListener("change", renderReviewMappingGapDetails));
  search?.addEventListener("input", renderReviewMappingGapDetails);
  target.dataset.bound = "true";
}

function renderReviewMappingGapSummary(rows, filteredRows) {
  const target = document.getElementById("review-mapping-gap-summary");
  if (!target) return;
  if (!rows.length) {
    target.innerHTML = "";
    return;
  }
  const shops = new Set(filteredRows.map(row => row.Shop).filter(Boolean));
  const titleOnly = filteredRows.filter(row => String(row["Missing Fields"] || "") === "Product Title").length;
  const reviews = filteredRows.reduce((sum, row) => sum + numericCell(row, "Review Count"), 0);
  const recent = filteredRows.reduce((sum, row) => sum + numericCell(row, "Review 365D"), 0);
  target.innerHTML = [
    metric("Visible gaps", `${fmt(filteredRows.length, "Listing Count")} / ${fmt(rows.length, "Listing Count")}`),
    metric("Title-only gaps", fmt(titleOnly, "Listing Count")),
    metric("Affected shops", fmt(shops.size, "Shop Count")),
    metric("Reviews represented", fmt(reviews, "Review Count")),
    metric("365D reviews", fmt(recent, "Review 365D"))
  ].join("");
}

function renderReviewMappingGapDetails() {
  const rows = reviewMappingGapRows();
  renderReviewMappingGapControls(rows);
  const filteredRows = filteredReviewMappingGapRows(rows);
  renderReviewMappingGapSummary(rows, filteredRows);
  const count = document.getElementById("review-mapping-gap-count");
  if (count) {
    count.textContent = rows.length
      ? `Showing ${fmt(filteredRows.length, "Listing Count")} of ${fmt(rows.length, "Listing Count")} mapping-gap rows.`
      : "";
  }
  renderTable("review-mapping-gap-details", filteredRows, [
    "Status", "Shop", "Listing ID", "Mapping State", "Listing URL", "Missing Fields",
    "Review Count", "Review 90D", "Review 365D", "Latest Review ISO",
    "Repair Priority", "Repair Read", "Evidence Safety", "Next Action"
  ], 50, { preserveOrder: true });
}

function reviewShopCoverageManifest() {
  return dashboard?.listing?.reviewShopCoverageIndex || null;
}

function decodeReviewShopCoverageRows(payload) {
  const manifest = reviewShopCoverageManifest();
  if (!manifest) return [];
  const columns = payload.columns || manifest.rowColumns || [];
  const labels = manifest.columnLabels || {};
  return (payload.rows || []).map(values => {
    const row = {};
    columns.forEach((column, index) => {
      const label = labels[column] || column;
      row[label] = values[index];
    });
    row["Listing Detail"] = "Search listing sidecar";
    return row;
  });
}

function loadReviewShopCoverageRows() {
  const manifest = reviewShopCoverageManifest();
  if (!manifest || reviewShopCoverageState.loaded || reviewShopCoverageState.loading || reviewShopCoverageState.error) return;
  reviewShopCoverageState.loading = true;
  reviewShopCoverageState.error = "";
  (async () => {
    try {
      const chunks = [];
      for (const file of manifest.rowFiles || []) {
        const response = await fetch(reviewListingAssetUrl(file));
        if (!response.ok) throw new Error(`Shop coverage chunk ${file} failed to load`);
        chunks.push(...decodeReviewShopCoverageRows(await response.json()));
      }
      reviewShopCoverageState.rows = chunks;
      reviewShopCoverageState.loaded = true;
    } catch (error) {
      reviewShopCoverageState.error = error?.message || "Shop coverage failed to load";
    } finally {
      reviewShopCoverageState.loading = false;
      renderReviewShopCoverageDetails();
      if (document.getElementById("company")?.classList.contains("active")) {
        renderCompanyOptions();
        renderCompanyProfile();
      }
    }
  })();
}

function retryReviewShopCoverageRows() {
  reviewShopCoverageState.error = "";
  reviewShopCoverageState.loaded = false;
  reviewShopCoverageState.loading = false;
  reviewShopCoverageState.rows = [];
  loadReviewShopCoverageRows();
  renderReviewShopCoverageDetails();
}

function reviewShopCoverageControlValues() {
  return {
    status: document.getElementById("review-shop-coverage-status")?.value || "",
    query: (document.getElementById("review-shop-coverage-search")?.value || "").trim().toLowerCase()
  };
}

function reviewShopCoverageSearchText(row) {
  return [
    row.Status,
    row.Shop,
    row["Mapping Priority"],
    row["Next Action"],
    row["Full Year Review Coverage"],
    row["Latest Review ISO"]
  ].map(value => String(value || "").toLowerCase()).join(" ");
}

function filteredReviewShopCoverageRows(rows) {
  const filters = reviewShopCoverageControlValues();
  return rows.filter(row => {
    if (filters.status && row.Status !== filters.status) return false;
    if (filters.query && !reviewShopCoverageSearchText(row).includes(filters.query)) return false;
    return true;
  });
}

function renderReviewShopCoverageControls(rows) {
  const target = document.getElementById("review-shop-coverage-controls");
  if (!target) return;
  const statuses = [...new Set(rows.map(row => row.Status).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const signature = JSON.stringify({ statuses });
  if (reviewShopCoverageControlSignature === signature && target.dataset.bound === "true") return;
  const current = reviewShopCoverageControlValues();
  reviewShopCoverageControlSignature = signature;
  target.innerHTML = `
    <div class="mapping-gap-controls">
      <label>
        <span>Status</span>
        <select id="review-shop-coverage-status">
          <option value="">All statuses</option>
          ${statuses.map(status => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Search</span>
        <input id="review-shop-coverage-search" type="search" placeholder="shop, coverage state, repair lane">
      </label>
    </div>
  `;
  const status = document.getElementById("review-shop-coverage-status");
  const search = document.getElementById("review-shop-coverage-search");
  if (status) status.value = statuses.includes(current.status) ? current.status : "";
  if (search) search.value = current.query;
  status?.addEventListener("change", renderReviewShopCoverageDetails);
  search?.addEventListener("input", renderReviewShopCoverageDetails);
  target.dataset.bound = "true";
}

function reviewShopCoverageTotals(rows) {
  const manifest = reviewShopCoverageManifest() || {};
  if (!rows.length) {
    return {
      shops: Number(manifest.totalShops || 0),
      listings: Number(manifest.totalReviewListingUrls || 0),
      fullIdentity: Number(manifest.fullIdentityListingUrls || 0),
      titleGaps: Number(manifest.titleGapListingUrls || 0),
      identityGaps: Number(manifest.identityGapListingUrls || 0)
    };
  }
  return {
    shops: rows.length,
    listings: rows.reduce((sum, row) => sum + numericCell(row, "Review-Derived Listings"), 0),
    fullIdentity: rows.reduce((sum, row) => sum + numericCell(row, "Full Identity Listings"), 0),
    titleGaps: rows.reduce((sum, row) => sum + numericCell(row, "Title Gap Listings"), 0),
    identityGaps: rows.reduce((sum, row) => sum + numericCell(row, "Identity Gap Listings"), 0)
  };
}

function renderReviewShopCoverageSummary(rows, filteredRows) {
  const target = document.getElementById("review-shop-coverage-summary");
  if (!target) return;
  const totals = reviewShopCoverageTotals(rows);
  const filteredTotals = reviewShopCoverageTotals(filteredRows);
  const visibleTotals = rows.length ? filteredTotals : totals;
  const visibleShops = rows.length ? filteredRows.length : totals.shops;
  target.innerHTML = [
    metric("Visible shops", `${fmt(visibleShops, "Shop Count")} / ${fmt(totals.shops, "Shop Count")}`),
    metric("Reviewed listings", fmt(visibleTotals.listings, "Listing Count")),
    metric("Full identity", fmt(visibleTotals.fullIdentity, "Listing Count")),
    metric("Title gaps", fmt(visibleTotals.titleGaps, "Listing Count")),
    metric("Identity gaps", fmt(visibleTotals.identityGaps, "Listing Count"))
  ].join("");
}

function reviewShopListingDetailCell(row) {
  const shop = String(row.Shop || "").trim();
  if (!shop || shop === "(missing shop)") return "";
  return `<button class="review-shop-detail-link" type="button" data-shop="${escapeHtml(shop)}">Open listings</button>`;
}

function companySidecarDetailCell(row) {
  const shop = String(row.Company || row.Shop || "").trim();
  if (!shop) return "";
  const label = numericCell(row, "Review-Derived Listings")
    ? "Open review listings"
    : "Search listing sidecar";
  return `<button class="review-shop-detail-link" type="button" data-shop="${escapeHtml(shop)}">${escapeHtml(label)}</button>`;
}

function openReviewListingSearchForShop(shop) {
  const listingSearch = document.getElementById("listing-search");
  const production = document.getElementById("production-filter");
  const substrate = document.getElementById("substrate-filter");
  const timeframe = document.getElementById("listing-timeframe-preset");
  const sort = document.getElementById("listing-sort");
  if (listingSearch) listingSearch.value = shop;
  if (production) production.value = "";
  if (substrate) substrate.value = "";
  if (timeframe) timeframe.value = "";
  if (sort) sort.value = "";
  selectedListingSubstrate = "";
  selectedListingTimeframePreset = "";
  listingSearchDirty = false;
  activateView("listings");
  applyListingSearch();
  document.getElementById("listings")?.scrollIntoView({ block: "start" });
}

function bindReviewShopCoverageActions() {
  if (document.body.dataset.reviewShopCoverageActionsBound === "true") return;
  document.addEventListener("click", event => {
    const retry = event.target.closest(".review-shop-coverage-retry");
    if (retry) {
      retryReviewShopCoverageRows();
      return;
    }
    const target = event.target.closest(".review-shop-detail-link");
    if (!target) return;
    const shop = target.dataset.shop || "";
    if (!shop) return;
    openReviewListingSearchForShop(shop);
  });
  document.body.dataset.reviewShopCoverageActionsBound = "true";
}

function renderReviewShopCoverageDetails() {
  const manifest = reviewShopCoverageManifest();
  const details = document.getElementById("review-shop-coverage-details");
  const count = document.getElementById("review-shop-coverage-count");
  if (!manifest) {
    if (details) details.innerHTML = `<div class="empty">No shop coverage sidecar is available in this snapshot.</div>`;
    if (count) count.textContent = "";
    return;
  }
  bindReviewShopCoverageActions();
  loadReviewShopCoverageRows();
  const rows = reviewShopCoverageState.rows;
  renderReviewShopCoverageControls(rows);
  const filteredRows = filteredReviewShopCoverageRows(rows);
  renderReviewShopCoverageSummary(rows, filteredRows);
  if (count) {
    if (reviewShopCoverageState.error) {
      count.innerHTML = `${escapeHtml(reviewShopCoverageState.error)} <button class="link-button review-shop-coverage-retry" type="button">Retry</button>`;
    } else if (reviewShopCoverageState.loading && !reviewShopCoverageState.loaded) {
      count.textContent = `Loading ${fmt(manifest.totalShops || 0, "Shop Count")} shop coverage rows.`;
    } else {
      const capped = filteredRows.length > REVIEW_SHOP_COVERAGE_RESULT_LIMIT
        ? ` First ${fmt(REVIEW_SHOP_COVERAGE_RESULT_LIMIT, "Shop Count")} shown.`
        : "";
      count.textContent = `Showing ${fmt(Math.min(filteredRows.length, REVIEW_SHOP_COVERAGE_RESULT_LIMIT), "Shop Count")} of ${fmt(filteredRows.length, "Shop Count")} matching shops.${capped}`;
    }
  }
  if (reviewShopCoverageState.loading && !rows.length) {
    if (details) details.innerHTML = `<div class="empty">Loading shop coverage rows.</div>`;
    return;
  }
  renderTable("review-shop-coverage-details", filteredRows, [
    "Status", "Shop", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D",
    "Review-Derived Listings", "Full Identity Listings", "Title Gap Listings", "Identity Gap Listings",
    "Latest Review ISO", "Full Year Review Coverage", "eRank 30D Sales", "Active Listings",
    "Mapping Priority", "Listing Detail", "Next Action"
  ], REVIEW_SHOP_COVERAGE_RESULT_LIMIT, { preserveOrder: true });
}

function renderOperations() {
  renderStatusTable("refresh-priority-table", dashboard.operations.refreshPriorityQueue || [], ["Priority", "Status", "Source", "Freshness Read", "Decision Impact", "Why Now", "Refresh Step"], 6);
  renderTable("shop-discovery-status", dashboard.operations.shopDiscoveryStatus || [], [
    "Status", "Source", "Generated At", "Candidate Rows", "Unique Candidate Shop IDs", "New To Cronk",
    "SQL Only", "Existing Workbook", "Query Count", "API Errors", "SQL Promotion", "Promoted Shops",
    "Promoted Review Rows", "Latest Batch Shops", "Latest Batch Review Rows", "Cumulative Queued Shops",
    "Cumulative Discovery Review Rows", "SQL Backup", "Current State", "Next Action", "Source Run Folder",
    "Source TSV", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("shop-discovery-queue", dashboard.operations.shopDiscoveryQueue || [], [
    "Priority", "Priority Score", "Coverage Status", "Shop", "Shop ID", "Shop URL", "Sold Count",
    "Review Count", "Review Average", "Active Listings", "Accepts Custom Requests", "Query Hits",
    "Query Terms", "Recent Review Samples", "Evidence Titles", "Review Snippets", "Next Action"
  ], 80, { preserveOrder: true });
  renderTable("shop-discovery-tab-status", dashboard.operations.shopDiscoveryTabStatus || [], [
    "Status", "Source", "Generated At", "Tabs Written", "Review-Deepened Tabs", "Payload Ready Tabs", "Latest Payload Dir",
    "Latest Action", "Current State", "Next Action", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("shop-discovery-tab-rows", dashboard.operations.shopDiscoveryTabRows || [], [
    "Priority", "Shop", "Sheet Name", "Status", "Discovery Score", "Review Rows", "API Review Rows",
    "API Deepened Rows", "Unique Listing URLs", "Review Window", "Review Ledger Window",
    "eRank Allocation Status", "eRank 30D Sales", "Sheet URL", "Written At", "No-Write Guard"
  ], 20, { preserveOrder: true });
  renderStatusTable("review-mapping-health", dashboard.operations.reviewMappingHealth || [], [
    "Status", "Check", "Finding", "Affected Rows", "Affected Shops", "Record Count", "Coverage",
    "Example", "Decision Impact", "Next Action"
  ], 5);
  renderReviewMappingGapDetails();
  renderStatusTable("review-shop-coverage-health", dashboard.operations.reviewShopListingCoverageHealth || [], [
    "Status", "Check", "Finding", "Affected Rows", "Affected Shops", "Record Count", "Coverage",
    "Example", "Decision Impact", "Next Action"
  ], 1);
  renderReviewShopCoverageDetails();
  renderTable("next-action-template-gap-decision-sheet-status", dashboard.operations.nextActionTemplateGapDecisionSheet || [], [
    "Status", "Source", "Sheet Rows", "Filled Rows", "Waiting Rows", "Partial Rows", "Validator Problems",
    "Current Sheet State", "QA Gate", "Decision Sheet URL", "Decision QA URL", "Decision TSV URL", "Tabs",
    "Source Decision Plan Status", "Plan Summary Updated", "Queue Summary Updated", "Required Source Gate", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("next-action-template-gap-decision-rows", dashboard.operations.nextActionTemplateGapDecisionRows || [], [
    "Priority", "Decision Fill State", "Action ID", "Target Category", "Package Title", "Package Family",
    "Suggested Decision", "Suggestion Rationale", "Recommended Path", "Top Match Confidence",
    "Top Match Score", "Top Template Listing ID", "Top Template Title", "Top Template Family", "Top Template URL", "Template Readiness",
    "Unresolved Facts", "Unsafe Reuse Warning", "Next Owner Skill", "Decision Fields To Fill", "No Write Gate"
  ], 20, { preserveOrder: true });
  renderTable("next-action-package-fact-fill-status", dashboard.operations.nextActionPackageFactFillStatus || [], [
    "Status", "Source", "Plan Rows", "Family Counts", "Owner Skills", "Image Workflow Skills",
    "All Rows No-Write Gated", "Current State", "QA Gate", "Plan Summary Updated",
    "Required Source Gate", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("next-action-package-fact-sheet-status", dashboard.operations.nextActionPackageFactSheet || [], [
    "Status", "Source", "Sheet Rows", "Facts Ready Rows", "Waiting Rows", "Missing Fact Rows",
    "Blocked Rows", "Needs Brandon Rows", "Validator Problems", "Current Sheet State", "QA Gate",
    "Package Fact Status", "Plan Status", "Family Counts", "Fact Status Counts", "Intake Summary Updated",
    "Input TSV", "Validation Markdown", "Validation TSV", "Validation JSON",
    "Operator Tabs", "Editable Fields", "Allowed Fact Statuses",
    "Package Fact Intake URL", "Package Fact Summary URL", "Package Fact QA URL", "Package Fact TSV URL",
    "Required Source Gate", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("next-action-package-fact-fill-plan", dashboard.operations.nextActionPackageFactFillPlan || [], [
    "Priority", "Action ID", "Fact Fill Status", "Decision Status", "Chosen Decision", "New Template/SKU Family",
    "SKU Allocation Status", "Package Family", "Target Category", "Package Title", "Buyer Intent",
    "Product Substrate To Confirm", "Required Product Form Facts", "Required Materials / Dimensions",
    "Required Variations / Defaults", "Required Personalization", "Required Shipping / Processing",
    "Required Image Assets", "Adjacent Evidence To Review", "Do Not Reuse", "Owner Skill",
    "Image Workflow Skill", "Expected Output", "Next Gate", "No Write Gate"
  ], 20, { preserveOrder: true });
  renderTable("next-action-package-fact-research-status", dashboard.operations.nextActionPackageFactResearchStatus || [], [
    "Status", "Source", "Packet Rows", "Family Counts", "Research Owners", "Image Workflow Skills",
    "All Rows No-Write Gated", "Current State", "QA Gate", "Packet Summary Updated",
    "Packet Markdown", "Packet TSV", "Packet JSON", "Operator Tabs",
    "Package Fact Research URL", "Package Fact Research Summary URL", "Package Fact Research QA URL",
    "Required Source Gate", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("next-action-package-fact-research-packets", dashboard.operations.nextActionPackageFactResearchPackets || [], [
    "Priority", "Action ID", "Research Status", "Package Family", "Target Category", "Package Title",
    "New Template/SKU Family", "Research Owner", "Image Workflow Skill", "Buyer Intent", "Source Queries",
    "Primary Source Targets", "Field Fill Plan", "Acceptance Criteria", "Reject If",
    "Adjacent Evidence Link", "Adjacent Evidence Read", "Suggested Fact Status",
    "Needs Brandon Decision", "Next Gate", "No Write Gate"
  ], 20, { preserveOrder: true });
  renderTable("next-action-template-starter-briefs", dashboard.operations.nextActionTemplateStarterBriefs || [], [
    "Brief Priority", "Action ID", "Template Starter", "Package Family", "Target Category", "Package Title",
    "Starter Brief", "Required Facts", "Market Evidence To Review", "Evidence URL", "Unresolved Facts",
    "Do Not Reuse", "Owner Skill", "Next Gate", "No Write Gate"
  ], 20, { preserveOrder: true });
  renderTable("next-action-template-source-audit-sheet-status", dashboard.operations.nextActionTemplateSourceAuditSheet || [], [
    "Status", "Source", "Sheet Rows", "Filled Evidence Rows", "Waiting Rows", "Needs Decision Rows",
    "Exact Template Rows", "Adjacent-Only Rows", "Current Sheet State", "Evidence Summary Updated",
    "Operator Tabs", "Editable Fields", "Allowed Audit Statuses",
    "Source Audit URL", "Source Audit Summary URL", "Source Audit QA URL", "Source Audit TSV URL",
    "Decision Sheet URL", "Required Source Gate", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("next-action-template-source-audit-evidence-packets", dashboard.operations.nextActionTemplateSourceAuditEvidencePackets || [], [
    "Audit Priority", "Action ID", "Audit Status", "Evidence Owner", "Evidence Date", "Package Family",
    "Target Category", "Package Title", "Top Template Listing ID", "Top Template Family", "Top Match Confidence",
    "Recommended Decision", "Evidence Link / Folder", "Product Form Evidence", "Dimension / Material Evidence",
    "Variation Evidence", "Shipping / Processing Evidence", "Image Asset Evidence", "Audit Notes", "No Write Gate"
  ], 20, { preserveOrder: true });
  renderTable("next-action-template-source-audit-checklists", dashboard.operations.nextActionTemplateSourceAuditChecklists || [], [
    "Audit Priority", "Action ID", "Audit Status", "Package Family", "Target Category", "Package Title",
    "Source Audit Checklist", "Fact Capture Fields", "Evidence Targets", "Market Evidence To Review",
    "Evidence URL", "Reject If", "Decision Output", "Owner Skill", "Next Gate", "No Write Gate"
  ], 20, { preserveOrder: true });
  renderStatusTable("listing-state-alerts-table", dashboard.operations.listingStateAlerts || [], ["Status", "Check", "Finding", "Affected Rows", "Snapshot Read", "Example", "Decision Impact", "Next Action"], 20);
  renderTable("listing-state-investigation-table", dashboard.operations.listingStateInvestigation || [], [
    "Priority", "Investigation Status", "Segment", "Dropped Listings", "Previous Active", "Previous Draft",
    "Newly Visible Same Segment", "Possible Replacement Count", "Replacement Read",
    "Resolution Read", "Resolved Active", "Resolved Draft", "Resolved Edit", "Resolved Inactive", "Resolved Expired",
    "Resolved Not Found", "Unresolved", "Resolved At",
    "Possible Replacement Listing", "Replacement State", "Replacement Match Tokens", "Replacement URL",
    "Example Dropped Listing", "Dropped Listing IDs", "Recommended Action"
  ], 40, { preserveOrder: true });
  renderTable("listing-state-recovery-market-priority-table", dashboard.operations.listingStateRecoveryMarketPriority || [], [
    "Recovery Market Priority", "Market Signal", "Segment", "Fix Listings", "Review Listings", "Replacement Leads",
    "Best Action Priority", "Best Action Type", "Target Category", "Product / Listing", "Expected Daily Sales",
    "Action Score", "Market Shop", "Market Listing URL", "Market Read", "Matched Terms", "Execution Read", "Batch Action"
  ], 20, { preserveOrder: true });
  renderTable("listing-state-recovery-execution-plan-table", dashboard.operations.listingStateRecoveryExecutionPlan || [], [
    "Execution Priority", "Execution Status", "Market Signal", "Recovery Market Priority", "Segment",
    "Recovery Status", "Previous State", "Resolved State", "Listing ID", "Product Title",
    "Suggested Final Decision", "Decision Fields To Fill", "No-Write Confirmation Gate", "Execution Step",
    "Current Etsy Listing URL", "Replacement Lead", "Replacement URL", "Best Action Priority",
    "Best Action Type", "Target Category", "Expected Daily Sales", "Action Score", "Market Shop",
    "Market Listing URL", "Matched Terms", "Market Read"
  ], 40, { preserveOrder: true });
  renderTable("listing-state-recovery-decision-intake-table", dashboard.operations.listingStateRecoveryDecisionIntake || [], [
    "Review Priority", "Review Status", "Segment", "Listing ID", "Product Title",
    "Recovery Status", "Previous State", "Resolved State", "Candidate Final Decision",
    "Final Decision Options", "Decision Status Options", "Candidate Reason", "Review Prompt",
    "Decision Guard", "Current Etsy Listing URL", "Replacement Lead", "Replacement URL",
    "Market Evidence", "TSV Fill Reminder"
  ], 40, { preserveOrder: true });
  renderTable("listing-state-recovery-decision-sheet-status", dashboard.operations.listingStateRecoveryDecisionSheet || [], [
    "Status", "Source", "Sheet Rows", "Current Sheet State", "QA Gate", "Decision Sheet URL",
    "Decision QA URL", "Tabs", "Source Decision Log Status", "Required Source Gate", "No-Write Guard"
  ], 1, { preserveOrder: true });
  renderTable("listing-state-recovery-batches-table", dashboard.operations.listingStateRecoveryBatches || [], [
    "Batch Priority", "Batch Status", "Segment", "Recovery Decision", "Listings", "Fix Listings",
    "Review Listings", "Prior Active", "Prior Draft", "Resolved Edit", "Replacement Leads",
    "Evidence Read", "First Listing IDs", "Top Listing Titles", "Open First Listing URL", "Copy Handoff", "Batch Action"
  ], 20, { preserveOrder: true });
  bindRecoveryBatchHandoffButtons();

  const recoveryRows = filteredListingStateRecoveryQueue();
  const count = document.getElementById("listing-state-recovery-count");
  if (count) {
    const total = dashboard.operations?.listingStateRecoveryQueue?.length || 0;
    count.textContent = `${fmt(recoveryRows.length, "Listing Count")} visible of ${fmt(total, "Listing Count")} recovery rows.`;
  }
  renderTable("listing-state-recovery-table", recoveryRows, [
    "Priority", "Recovery Status", "Recovery Decision", "Segment", "Previous State", "Resolved State",
    "Listing ID", "Product Title", "Why It Matters", "Next Action",
    "Possible Replacement Count", "Possible Replacement Listing", "Replacement State", "Replacement Match Tokens", "Replacement URL",
    "Resolved Listing URL", "Previous Snapshot", "Resolved At"
  ], 80, { preserveOrder: true });
  renderStatusTable("listing-state-recovery-decision-status", dashboard.operations.listingStateRecoveryDecisionStatus || [], [
    "Status", "Source", "Rows", "Filled Rows", "Decision Read", "Validation Read", "Unknown Listing IDs",
    "Duplicate Listing IDs", "Invalid Rows", "Last Updated", "Decision Status Counts", "Final Decision Counts",
    "Allowed Decision Statuses", "Allowed Final Decisions", "Next Action"
  ], 4);
  renderTable("listing-state-recovery-decision-log", dashboard.operations.listingStateRecoveryDecisionLog || [], [
    "Decision Status", "Final Decision", "Decision Date", "Decision Owner", "Segment", "Listing ID", "Product Title",
    "Recovery Status", "Previous State", "Resolved State", "Recommended Decision", "Recommended Next Action",
    "Decision Notes", "Resolved Listing URL", "Replacement Lead", "Replacement URL", "Resolved At", "Import Check"
  ], 80, { preserveOrder: true });
  renderStatusTable("data-freshness-table", dashboard.operations.dataFreshness || [], ["Status", "Source", "Freshness Read", "Last Updated", "Data Through", "Record Count", "Decision Impact", "Refresh Step"], 40);
  renderStatusTable("taxonomy-quality-table", dashboard.operations.taxonomyQuality || [], ["Status", "Check", "Finding", "Affected Rows", "Example", "Decision Impact", "Next Action"], 40);
  renderTable("coverage-queue", dashboard.operations.coverageQueue, ["Shop", "eRank 7D Sales", "eRank 30D Sales", "Avg Daily Sales (30D)", "Has Tab", "Tab Status", "Review Ledger Rows", "Last Evidence Run", "Last Scrape Status", "Next Action"], 80);
  renderStatusTable("recent-runs", dashboard.automation.recentRuns, ["Status", "Run Timestamp", "Pipeline / Stage", "Automation Version", "Source / Context", "eRank Sales Date", "Counts / Metrics", "Blocker / Issue", "Next Action"], 60);
}

function renderAll() {
  document.getElementById("snapshot-note").innerHTML =
    `${escapeHtml(dashboard.meta.source)} Generated ${escapeHtml(dashboard.meta.generatedAt)} from cache modified ${escapeHtml(dashboard.meta.sourceWorkbookModifiedAt)}.`;
  document.getElementById("workbook-link").href = dashboard.meta.workbookUrl;
  renderPublicStatus();
  renderOpportunity();
  initMyMaraviaFilters();
  renderMyMaravia();
  initMarketControlFilters();
  renderMarketControl();
  initMarketSizeFilters();
  applyMarketSizeUrlState();
  renderMarketSize();
  renderMarketPenetration();
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
  applyListingUrlState();
  renderListings();
  initBuyerMomentFilters();
  applyBuyerMomentUrlState();
  renderBuyerMoments();
  renderBar("category-rollup-chart", dashboard.listing.categoryRollup || [], "Total Est. Daily Sales", "Product Substrate Category", 15, "#1f5fbf");
  renderTable("category-rollup-table", dashboard.listing.categoryRollup, ["Product Substrate Category", "Product Family", "Total Est. Daily Sales", "Total Est. 30D Sales", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Review Corpus Listings", "Listing Count", "Shop Count"], 40);
  renderBar("demand-summary-chart", dashboard.listing.demandSummary || [], "Total Est. Daily Sales", "Demand Intent Cluster", 20, "#0f766e");
  renderTable("demand-summary-table", dashboard.listing.demandSummary, ["Demand Intent Cluster", "Total Est. Daily Sales", "Listing Count", "Review Count", "Review Corpus Count", "Review Corpus 90D", "Review Corpus Listings", "Avg Daily Sales / Listing", "Shop Count"], 50);
  initListingStateRecoveryFilters();
  renderOperations();
  renderTable("quality-table", dashboard.market.quality, ["Date", "Raw Rows", "Unique Shops", "Duplicate Shop-Date Pairs", "Raw Market Sales", "Deduped Market Sales", "Potential Inflation", "Likely Partial Final Day", "Source Files"], 120);
  initRawSelect();
}

async function boot() {
  setupTabs();
  const [response, statusPayload] = await Promise.all([
    fetch(`assets/data.json?v=${DATA_ASSET_VERSION}`),
    loadPublicStatus()
  ]);
  publicStatus = statusPayload;
  dashboard = await response.json();
  applyNextActionUrlState();
  renderAll();
  const initialView = initialDashboardView();
  if (initialView && initialView !== "opportunity") activateView(initialView);
  document.getElementById("top-shop-metric").addEventListener("change", renderTopShops);
  const listingSearch = document.getElementById("listing-search");
  listingSearch.addEventListener("input", handleListingInputChange);
  listingSearch.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyListingSearch();
    }
  });
  document.getElementById("listing-search-submit").addEventListener("click", () => applyListingSearch());
  document.getElementById("production-filter").addEventListener("change", handleListingFilterChange);
  document.getElementById("substrate-filter").addEventListener("change", handleListingFilterChange);
  document.getElementById("listing-sort").addEventListener("change", handleListingFilterChange);
}

boot().catch(error => {
  document.body.innerHTML = `<main class="shell"><section class="panel"><h1>Dashboard failed to load</h1><p class="subtle">${escapeHtml(error.message)}</p></section></main>`;
});
