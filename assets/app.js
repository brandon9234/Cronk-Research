let dashboard;
const DATA_ASSET_VERSION = "mymaravia-led-20260529";

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
  "Price", "Views", "Favorites", "Tags Count", "Recent 180D Sales", "Recent 180D Revenue"
]);

const wrappedColumns = new Set([
  "Product Title", "Matched Product Categories", "Source / Context", "Counts / Metrics",
  "Blocker / Issue", "Next Action", "Notes", "Source Note", "Top Substrates", "Listing URL",
  "Product Bet", "Buyer Intent", "Why It Matters", "Launch Brief", "Suggested Listings",
  "Primary Product Family", "Strategic Read", "Evidence Note", "Source", "Refresh Step",
  "Product Substrate Category", "Original Broad Category", "Category Aliases", "Production Tag",
  "Customization Tag", "Tag Evidence"
]);

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

function renderTable(targetId, rows, columns = null, limit = null) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const data = limit ? rows.slice(0, limit) : rows;
  if (!data || data.length === 0) {
    target.innerHTML = `<div class="empty">No rows available in this snapshot.</div>`;
    return;
  }
  const cols = columns || Object.keys(data[0]);
  const header = cols.map(col => `<th class="${wrappedColumns.has(col) ? "wrap" : ""}">${escapeHtml(col)}</th>`).join("");
  const body = data.map(row => {
    const cells = cols.map(col => {
      const cls = wrappedColumns.has(col) ? "wrap" : "";
      const value = col.toLowerCase().includes("url") ? linkCell(row[col]) : escapeHtml(fmt(row[col], col));
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
      const value = col === "Status" ? row[col] : escapeHtml(fmt(row[col], col));
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
      const value = col === "Trend" ? row[col] : escapeHtml(fmt(row[col], col));
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

function renderCategoryMetrics() {
  const rows = dashboard.comparison.shopCategoryComparison || [];
  const movement = dashboard.comparison.categoryMovement || [];
  const totalDaily = rows.reduce((sum, row) => sum + Number(row["Category Est. Daily Sales"] || 0), 0);
  const shops = new Set(rows.map(row => row.Shop).filter(Boolean)).size;
  const up = rows.filter(row => row.Trend === "Up").length;
  const down = rows.filter(row => row.Trend === "Down").length;
  const cards = [
    ["Matching listings", fmt(dashboard.comparison.categoryMatchesCount)],
    ["Matching shops", fmt(shops)],
    ["Category est. daily sales", fmt(totalDaily, "Category Est. Daily Sales")],
    ["Up shops", fmt(up)],
    ["Down shops", fmt(down)]
  ];
  document.getElementById("category-metrics").innerHTML = cards.map(([label, value]) => metric(label, value)).join("");
  document.getElementById("category-query").textContent = dashboard.comparison.categoryQuery;
  if (movement.length) {
    const focus = movement.slice().sort((a, b) => Number(b["Category Est. Daily Sales"] || 0) - Number(a["Category Est. Daily Sales"] || 0))[0];
    const direction = String(focus.Trend || "Flat").toLowerCase();
    const delta = Math.abs(Number(focus.Delta || 0));
    const pct = focus["Delta %"] == null ? "" : ` (${Math.abs(Number(focus["Delta %"])).toFixed(1)}%)`;
    document.getElementById("category-movement-callout").innerHTML =
      `<strong>${escapeHtml(focus["Product Substrate Category"])}</strong> is ${escapeHtml(direction)} ${fmt(delta, "Delta")} daily sales${pct} across matching shops.`;
  }
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

function renderTopShops() {
  const metricName = document.getElementById("top-shop-metric").value;
  const rows = [...dashboard.market.topShops].sort((a, b) => Number(b[metricName] || 0) - Number(a[metricName] || 0));
  renderTable("top-shops", rows, ["Shop", "Label", "7D Sales", "30D Sales", "Avg Daily Sales (30D)", "Active Listings"], 15);
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
    "Demand Score", "Cronk Research Fit", "Evidence Score", "Saturation Penalty", "Why It Matters"
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

function renderListings() {
  const query = document.getElementById("listing-search").value.trim().toLowerCase();
  const production = document.getElementById("production-filter").value;
  let rows = getListingRows();
  if (production) {
    rows = rows.filter(row => row["Production Tag"] === production);
  }
  if (query) {
    rows = rows.filter(row => Object.values(row).join(" ").toLowerCase().includes(query));
  }
  renderTable("top-listings", rows, [
    "Overall Rank", "Shop", "Product Title", "Product Category", "Product Substrate Category",
    "Production Tag", "Customization Tag", "Tag Confidence", "Tag Evidence",
    "Est. 30D Sales", "Est. Daily Sales", "Evidence Confidence", "Last Review ISO", "Listing URL"
  ], 80);
}

function renderRaw() {
  const select = document.getElementById("raw-select");
  const key = select.value;
  renderTable("raw-table", dashboard.rawPreviews[key] || []);
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
      document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.view).classList.add("active");
      window.dispatchEvent(new Event("resize"));
      requestAnimationFrame(updateAllBottomScrollbars);
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

function renderAll() {
  document.getElementById("snapshot-note").innerHTML =
    `${escapeHtml(dashboard.meta.source)} Generated ${escapeHtml(dashboard.meta.generatedAt)} from cache modified ${escapeHtml(dashboard.meta.sourceWorkbookModifiedAt)}.`;
  document.getElementById("workbook-link").href = dashboard.meta.workbookUrl;
  renderOpportunity();
  renderMetrics();
  renderStatusTable("latest-ok", dashboard.automation.latestOk, ["Status", "Run Timestamp", "Pipeline / Stage", "Automation Version", "eRank Sales Date", "Next Action"]);
  renderStatusTable("latest-problem", dashboard.automation.latestProblem, ["Status", "Run Timestamp", "Pipeline / Stage", "Blocker / Issue", "Next Action"]);
  renderOverallChart();
  renderImportChart();
  renderMarketTrend();
  renderTopShops();
  renderCategoryMetrics();
  renderLineByGroup("category-shop-chart", dashboard.comparison.shopCategoryChart || [], "Date", "Daily Sales", "Shop");
  renderTrendTable("category-comparison", dashboard.comparison.shopCategoryComparison, ["Shop", "Trend", "Category Est. Daily Sales", "Category Est. 30D Sales", "Matching Listings", "Matched Product Categories", "Recent Avg Daily Sales", "Prior Avg Daily Sales", "Delta", "Delta %", "Latest Complete Date", "Latest Complete Daily Sales", "Days Used"], 100);
  renderBar("demand-intent-chart", dashboard.comparison.demandIntentRollup || [], "Total Est. 30D Sales", "Demand Intent Cluster", 20, "#0f766e");
  renderTable("demand-intent-table", dashboard.comparison.demandIntentRollup, ["Demand Intent Cluster", "Total Est. 30D Sales", "Listing Count", "Shop Count", "Top Substrates"], 40);
  renderLineByGroup("shop-trend-chart", dashboard.comparison.shopTrendChart || [], "Date", "Daily Sales", "Shop");
  renderTrendTable("shop-trends", dashboard.comparison.shopTrends, ["Shop", "Trend", "Recent Avg Daily Sales", "Prior Avg Daily Sales", "Delta", "Delta %", "Latest Complete Date", "Latest Complete Daily Sales", "Total Daily Sales In Range", "Days Used"], 70);
  renderListings();
  renderBar("category-rollup-chart", dashboard.listing.categoryRollup || [], "Total Est. Daily Sales", "Product Substrate Category", 15, "#1f5fbf");
  renderTable("category-rollup-table", dashboard.listing.categoryRollup, ["Product Substrate Category", "Total Est. Daily Sales", "Total Est. 30D Sales", "Listing Count", "Shop Count"], 40);
  renderBar("demand-summary-chart", dashboard.listing.demandSummary || [], "Total Est. Daily Sales", "Demand Intent Cluster", 20, "#0f766e");
  renderTable("demand-summary-table", dashboard.listing.demandSummary, ["Demand Intent Cluster", "Total Est. Daily Sales", "Listing Count", "Review Count", "Avg Daily Sales / Listing", "Shop Count"], 50);
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
}

boot().catch(error => {
  document.body.innerHTML = `<main class="shell"><section class="panel"><h1>Dashboard failed to load</h1><p class="subtle">${escapeHtml(error.message)}</p></section></main>`;
});
