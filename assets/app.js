let dashboard;
let selectedCompany = "";
let selectedCompanyProduction = "";
const DATA_ASSET_VERSION = "mymaravia-refresh-20260530-1116";

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
  "Sales Per Review Used", "Observed Days"
  , "Draft Listings", "My Daily Sales", "Current Market Daily Sales", "Current Market Share %",
  "Fix Conversion", "Saturated / Niche Down", "Active Listings", "My Category Daily Sales",
  "Market Daily Sales", "My Market Share %", "Top Competitor Daily Sales", "Leader Gap Daily",
  "View-Favorite Rate %", "Sales / 100 Views", "Market Share %", "Market Listings",
  "Market Shops", "Leader Match %", "Priority", "Top Competitor 30D Sales",
  "Top Competitor eRank 7D Sales", "Top Competitor eRank 30D Sales",
  "Top Competitor Avg Daily Sales (30D)", "Top Competitor Active Listings",
  "Top Competitor Review Corpus Count", "Top Competitor 90D Reviews",
  "Top Competitor 365D Reviews", "Top Competitor Avg Rating"
]);

const wrappedColumns = new Set([
  "Product Title", "Best Guess Tags", "Matched Product Categories", "Source / Context", "Counts / Metrics",
  "Blocker / Issue", "Next Action", "Notes", "Source Note", "Top Substrates", "Listing URL",
  "Product Bet", "Buyer Intent", "Why It Matters", "Launch Brief", "Suggested Listings",
  "Primary Product Family", "Strategic Read", "Evidence Note", "Source", "Refresh Step",
  "Product Substrate Category", "Original Broad Category", "Category Aliases", "Production Tag",
  "Customization Tag", "Tag Evidence", "Blank / Generic Sources", "Top Open Long Tail",
  "Existing MyMaravia Long Tails", "Market Long Tail", "Matching MyMaravia Listing",
  "Build Recommendation", "Match Tokens", "Market Listing URL", "Top Competitor",
  "Top Competitor Shop", "Recommended Move", "CTR Data Status", "Market State",
  "Conquest Status", "Trend Source", "Trend Confidence", "Top Competitor Tags",
  "Top Competitor Listing URL", "Top Competitor Production Tag", "Top Competitor Trend"
]);

const thumbnailColumns = new Set(["Thumbnail", "Listing Thumbnail", "Market Thumbnail", "Top Competitor Thumbnail"]);
const sourceLinkColumns = new Set(["Blank / Generic Sources"]);
const companyColumns = new Set(["Shop", "Market Shop", "Top Shop"]);
const badgeColumns = new Set(["Conquest Status", "Market State"]);

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

function thumbnailCell(row, column) {
  const src = String(row[column] ?? "");
  if (!/^https?:\/\//i.test(src)) return "";
  const href = String(
    column === "Top Competitor Thumbnail"
      ? row["Top Competitor Listing URL"] || row["Market Listing URL"] || row["Listing URL"] || src
      : column === "Market Thumbnail"
        ? row["Market Listing URL"] || row["Listing URL"] || src
        : row["Listing URL"] || src
  );
  const title = String(
    column === "Top Competitor Thumbnail"
      ? row["Top Competitor"] || "Top competitor thumbnail"
      : column === "Market Thumbnail"
        ? row["Market Long Tail"] || "Market listing thumbnail"
        : row["Product Title"] || "Listing thumbnail"
  );
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

function renderTable(targetId, rows, columns = null, limit = null) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const data = limit ? rows.slice(0, limit) : rows;
  if (!data || data.length === 0) {
    target.innerHTML = `<div class="empty">No rows available in this snapshot.</div>`;
    return;
  }
  const cols = columns || Object.keys(data[0]);
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
  const cls = /blocked|partial|error|fail|issue|unavailable/i.test(text)
    ? "bad"
    : /^ok$|success|manual update|seeded|complete/i.test(text)
      ? "good"
      : "flat";
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function diagnosticBadge(value) {
  const text = String(value ?? "Unknown");
  const cls = /leader chase|active foothold|open attack/i.test(text)
    ? "good"
    : /fix|gap|saturat|draft|inactive|traffic/i.test(text)
      ? "warn"
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
  const cards = [
    ["Latest eRank sales date", m.latestDate],
    ["Positive 7D shops", fmt(m.positive7dShops)],
    ["Zero-7D excluded", fmt(m.zero7dExcluded)],
    ["Latest source CSV", m.latestSourceCsv],
    ["Recent successful stages", fmt(m.recentSuccessfulStages)],
    ["Blocked/partial stages", fmt(m.blockedPartialStages)]
  ];
  document.getElementById("metric-grid").innerHTML = cards.map(([label, value]) => metric(label, value)).join("");
}

function listingSearchText(row) {
  return Object.values(row).join(" ").toLowerCase();
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
  return Array.from(byKey.values());
}

function numericCell(row, column) {
  const value = row[column];
  if (typeof value === "number") return value;
  const parsed = Number(String(value ?? "").replace(/[$,%]/g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortListingRows(rows) {
  const sort = document.getElementById("listing-sort").value;
  const sortMap = {
    "daily-desc": ["Est. Daily Sales", "desc"],
    "daily-asc": ["Est. Daily Sales", "asc"],
    "thirty-desc": ["Est. 30D Sales", "desc"],
    "thirty-asc": ["Est. 30D Sales", "asc"]
  };
  const config = sortMap[sort];
  if (!config) return rows;
  const [column, direction] = config;
  return rows.slice().sort((a, b) => {
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
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
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

  const monthlyRows = (dashboard.reviewCorpus?.shopMonthly || [])
    .filter(row => companyName(row.Shop) === company)
    .sort((a, b) => String(a.Month || "").localeCompare(String(b.Month || "")));
  if (monthlyRows.length) {
    Plotly.newPlot("company-review-cycle-chart", [{
      type: "bar",
      x: monthlyRows.map(row => row.Month),
      y: monthlyRows.map(row => row["Review Count"]),
      marker: { color: "#0f766e" },
      hovertemplate: "%{x}<br>Reviews: %{y:,.0f}<extra></extra>"
    }], {
      margin: { l: 48, r: 16, t: 8, b: 44 },
      yaxis: { title: "Review count" },
      paper_bgcolor: "white",
      plot_bgcolor: "white"
    }, plotConfig);
    renderTable("company-review-cycle", monthlyRows, ["Month", "Review Count"], 36);
  } else {
    document.getElementById("company-review-cycle-chart").innerHTML = `<div class="empty">No monthly review corpus rows are available for this company.</div>`;
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
    "Overall Rank", "Thumbnail", "Est. Daily Sales", "Est. 30D Sales", "Product Title", "Best Guess Tags",
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

function renderOpportunity() {
  const opp = dashboard.opportunity || {};
  const metrics = opp.metrics || {};
  const queue = opp.opportunityQueue || [];
  const launches = opp.launchQueue || [];
  const matrix = opp.intentProductMatrix || [];
  const health = opp.health || [];
  const baseline = opp.cronkBaseline || {};

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
      ? `Showing all ${fmt(allDiagnostics.length, "Listing Count")} listing diagnostics`
      : `Showing ${fmt(diagnosticRows.length, "Listing Count")} of ${fmt(allDiagnostics.length, "Listing Count")} listing diagnostics`;
  renderTable("mymaravia-listing-diagnostics", diagnosticRows, [
    "Priority", "Conquest Status", "Thumbnail", "State", "Product Category", "Product Title",
    "Best Guess Tags", "Views", "Favorites", "View-Favorite Rate %", "Recent 7D Sales",
    "Recent 30D Sales", "Recent 90D Sales", "Recent 180D Sales", "Sales / 100 Views",
    "Recent 30D Revenue", "Recent 180D Revenue", "Sales Rate Window Days", "Market Share %", "Market State",
    "Top Competitor Thumbnail", "Top Competitor", "Top Competitor Shop", "Top Competitor Daily Sales",
    "Top Competitor 30D Sales", "Top Competitor eRank 7D Sales", "Top Competitor eRank 30D Sales",
    "Top Competitor Avg Daily Sales (30D)", "Top Competitor Active Listings",
    "Top Competitor Review Corpus Count", "Top Competitor 90D Reviews", "Top Competitor 365D Reviews",
    "Top Competitor Avg Rating", "Top Competitor Production Tag", "Top Competitor Trend",
    "Top Competitor Listing URL", "Leader Gap Daily",
    "Leader Match %", "Recommended Move", "CTR Data Status", "Listing URL"
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

  renderTable("mymaravia-listings", my.myListings || [], [
    "Thumbnail", "State", "Product Category", "Est. Daily Sales", "Est. 30D Sales", "Product Title", "Best Guess Tags",
    "Recent 7D Sales", "Recent 30D Sales", "Recent 90D Sales", "Recent 180D Sales",
    "Recent Reviews", "Recent Avg Rating", "Review Corpus Count", "Review Corpus 90D", "Sales Rate Window Days",
    "Views", "Favorites", "Tags Count", "Listing URL"
  ], 500);
}

function renderListings() {
  const query = document.getElementById("listing-search").value.trim().toLowerCase();
  const production = document.getElementById("production-filter").value;
  const allRows = getListingRows();
  let rows = allRows;
  if (production) {
    rows = rows.filter(row => row["Production Tag"] === production);
  }
  if (query) {
    rows = rows.filter(row => Object.values(row).join(" ").toLowerCase().includes(query));
  }
  rows = sortListingRows(rows);
  const count = fmt(rows.length, "Listing Count");
  const total = fmt(allRows.length, "Listing Count");
  document.getElementById("listing-count").textContent =
    rows.length === allRows.length ? `Showing all ${total} listings` : `Showing ${count} of ${total} listings`;
  renderTable("top-listings", rows, [
    "Overall Rank", "Thumbnail", "Shop", "Est. Daily Sales", "Blank / Generic Sources", "Product Title", "Best Guess Tags", "Product Category", "Product Substrate Category",
    "Production Tag", "Customization Tag", "Tag Confidence", "Tag Evidence",
    "Est. 30D Sales", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D",
    "Review Corpus Avg Rating", "Review Corpus Latest ISO", "Evidence Confidence", "Last Review ISO", "Listing URL"
  ]);
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

function answerSheetQuestion(question) {
  const q = normalizeQuestion(question);
  if (!q.trim()) {
    return result("Ask the sheet", "Type a question about listings, shops, categories, sales, coverage, blanks, or opportunities.");
  }
  if (/variation|style|option|personalization|customer ordered|ordered/.test(q)) return answerVariationQuestion(question);
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
  renderTable("raw-table", dashboard.rawPreviews[key] || []);
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
    option.textContent = key;
    select.appendChild(option);
  });
  select.addEventListener("change", renderRaw);
  renderRaw();
}

function initProductionFilter() {
  const select = document.getElementById("production-filter");
  const counts = new Map();
  getListingRows().forEach(row => {
    const tag = row["Production Tag"] || "Unclassified";
    counts.set(tag, (counts.get(tag) || 0) + 1);
  });
  [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([tag, count]) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = `${tag} (${count})`;
      select.appendChild(option);
    });
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
  document.querySelectorAll(".prompt-button").forEach(button => {
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
  renderListings();
  renderAskScope();
  initAsk();
  renderBar("category-rollup-chart", dashboard.listing.categoryRollup || [], "Total Est. Daily Sales", "Product Substrate Category", 15, "#1f5fbf");
  renderTable("category-rollup-table", dashboard.listing.categoryRollup, ["Product Substrate Category", "Total Est. Daily Sales", "Total Est. 30D Sales", "Review Corpus Count", "Review Corpus 90D", "Review Corpus 365D", "Review Corpus Listings", "Listing Count", "Shop Count"], 40);
  renderBar("demand-summary-chart", dashboard.listing.demandSummary || [], "Total Est. Daily Sales", "Demand Intent Cluster", 20, "#0f766e");
  renderTable("demand-summary-table", dashboard.listing.demandSummary, ["Demand Intent Cluster", "Total Est. Daily Sales", "Listing Count", "Review Count", "Review Corpus Count", "Review Corpus 90D", "Review Corpus Listings", "Avg Daily Sales / Listing", "Shop Count"], 50);
  renderTable("coverage-queue", dashboard.operations.coverageQueue, ["Shop", "eRank 7D Sales", "eRank 30D Sales", "Avg Daily Sales (30D)", "Has Tab", "Tab Status", "Review Ledger Rows", "Last Evidence Run", "Last Scrape Status", "Next Action"], 80);
  renderStatusTable("recent-runs", dashboard.automation.recentRuns, ["Status", "Run Timestamp", "Pipeline / Stage", "Automation Version", "Source / Context", "eRank Sales Date", "Counts / Metrics", "Blocker / Issue", "Next Action"], 60);
  renderTable("quality-table", dashboard.market.quality, ["Date", "Raw Rows", "Unique Shops", "Duplicate Shop-Date Pairs", "Raw Market Sales", "Deduped Market Sales", "Potential Inflation", "Likely Partial Final Day", "Source Files"], 120);
  initProductionFilter();
  initRawSelect();
}

async function boot() {
  setupTabs();
  const response = await fetch(`assets/data.json?v=${DATA_ASSET_VERSION}`);
  dashboard = await response.json();
  renderAll();
  document.getElementById("top-shop-metric").addEventListener("change", renderTopShops);
  document.getElementById("listing-search").addEventListener("input", renderListings);
  document.getElementById("production-filter").addEventListener("change", renderListings);
  document.getElementById("listing-sort").addEventListener("change", renderListings);
}

boot().catch(error => {
  document.body.innerHTML = `<main class="shell"><section class="panel"><h1>Dashboard failed to load</h1><p class="subtle">${escapeHtml(error.message)}</p></section></main>`;
});
