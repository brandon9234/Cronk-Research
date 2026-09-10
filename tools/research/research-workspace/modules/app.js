import {
  MONTHS,
  finite,
  number,
  percent,
  dateLabel,
  dayAge,
  filterShops,
  filterMoments,
  calendarCounts,
  chartGeometry,
  readWatchlist,
  saveWatchlist,
  safeURL,
} from "./core.js";
import { el, badge, button } from "./dom.js";
import { chart } from "./charts.js";
import {
  loadAsset,
  bindManifest,
  normalizeShop,
  normalizeMoment,
} from "./data.js";
const main = document.querySelector("#main"),
  dialog = document.querySelector("#detail-dialog");
const labels = {
  overview: "Overview",
  competitors: "Competitors",
  moments: "Buyer moments",
  evidence: "Evidence & health",
};
const state = {
  manifest: null,
  shops: null,
  moments: null,
  groups: [],
  watch: [],
  shopQuery: "",
  category: "",
  estimateKind: "",
  sort: "velocity",
  watchOnly: false,
  page: 1,
  momentQuery: "",
  group: "",
  month: null,
  momentLimit: 30,
};
try {
  state.watch = readWatchlist(localStorage);
} catch {}
let navigation = 0;
const modelLabel = (kind) =>
  kind === "supplier-estimate"
    ? "Supplier estimate"
    : kind === "review-model"
      ? "Review model"
      : "No sales estimate";
const external = (label, url) => {
  const safe = safeURL(url);
  return safe
    ? el(
        "a",
        {
          href: safe,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-link",
        },
        label,
        " ↗",
      )
    : el("span", { class: "muted" }, label);
};
function heading(kicker, title, description, action) {
  return el(
    "div",
    { class: "page-heading" },
    el(
      "div",
      {},
      el("div", { class: "eyebrow" }, kicker),
      el("h1", {}, title),
      el("p", { class: "lede" }, description),
    ),
    action || null,
  );
}
function sectionHead(title, description, action) {
  return el(
    "div",
    { class: "section-heading" },
    el(
      "div",
      {},
      el("h2", {}, title),
      description ? el("p", { class: "muted" }, description) : null,
    ),
    action || null,
  );
}
function stat(label, value, note) {
  return el(
    "div",
    { class: "stat" },
    el("span", { class: "stat-label" }, label),
    el("strong", {}, value),
    el("span", { class: "stat-note" }, note),
  );
}
function empty(title, description) {
  return el(
    "div",
    { class: "empty-state" },
    el("span", { class: "empty-icon", "aria-hidden": "true" }, "◎"),
    el("h3", {}, title),
    el("p", {}, description),
  );
}
function alert(message) {
  const node = el("p", { class: "inline-alert", role: "status" }, message);
  main.prepend(node);
}
function sourceStrip() {
  const asOf = state.manifest.sourceDates?.competitorSales,
    age = dayAge(asOf);
  return el(
    "div",
    { class: "source-strip" },
    badge(
      age === null
        ? "Source date missing"
        : age > 30
          ? "Historical snapshot"
          : "Dated snapshot",
      age === null || age > 30 ? "warning" : "positive",
    ),
    el(
      "p",
      {},
      "Competitor sales through ",
      el("strong", {}, dateLabel(asOf)),
      ". Review and calendar evidence have separate dates.",
    ),
    el("a", { href: "#evidence" }, "Inspect sources →"),
  );
}
function watchButton(shop) {
  const watched = state.watch.includes(shop.id);
  return button(
    watched ? "★" : "☆",
    (event) => {
      event.stopPropagation();
      state.watch = watched
        ? state.watch.filter((id) => id !== shop.id)
        : [...state.watch, shop.id];
      let persisted = false;
      try {
        persisted = saveWatchlist(localStorage, state.watch);
      } catch {}
      event.currentTarget.replaceWith(accessibleWatch(shop));
      if (!persisted)
        alert(
          "Watchlist works for this session, but browser storage is unavailable.",
        );
      if (state.watchOnly && location.hash === "#competitors")
        renderShopResults();
    },
    "watch-button",
  );
}
function accessibleWatch(shop) {
  const node = watchButton(shop);
  node.setAttribute(
    "aria-label",
    `${state.watch.includes(shop.id) ? "Remove" : "Add"} ${shop.name} ${state.watch.includes(shop.id) ? "from" : "to"} watchlist`,
  );
  node.setAttribute("aria-pressed", String(state.watch.includes(shop.id)));
  return node;
}
function shopTable(shops, short = false) {
  const headers = [
    "Shop",
    "Est. sales / day",
    "Evidence",
    "Modeled momentum",
    "Source date",
  ];
  return el(
    "div",
    { class: "table-scroll" },
    el(
      "table",
      { class: "shop-table" },
      el(
        "caption",
        { class: "sr-only" },
        "Competitor shops with dated sales estimates",
      ),
      el(
        "thead",
        {},
        el(
          "tr",
          {},
          headers.map((h) => el("th", { scope: "col" }, h)),
        ),
      ),
      el(
        "tbody",
        {},
        shops.map((shop) =>
          el(
            "tr",
            {},
            el(
              "td",
              {},
              el(
                "div",
                { class: "shop-cell" },
                accessibleWatch(shop),
                button(shop.name, () => openShop(shop), "shop-name"),
              ),
            ),
            el(
              "td",
              {},
              el(
                "strong",
                { class: "numeric" },
                number(shop.estimatedDailySales, 1),
              ),
              el("span", { class: "cell-note" }, "estimated"),
            ),
            el(
              "td",
              {},
              badge(modelLabel(shop.estimateKind)),
              !short
                ? el(
                    "span",
                    { class: "cell-note" },
                    `${number(shop.observedReviews90d)} reviews / 90d to ${dateLabel(shop.reviewsAsOf)}`,
                  )
                : null,
            ),
            el(
              "td",
              {},
              el(
                "span",
                {
                  class: finite(shop.trendDeltaPct)
                    ? shop.trendDeltaPct > 0
                      ? "trend up"
                      : shop.trendDeltaPct < 0
                        ? "trend down"
                        : "trend"
                    : "muted",
                },
                percent(shop.trendDeltaPct),
              ),
              el(
                "span",
                { class: "cell-note" },
                shop.trendAsOf
                  ? `Through ${dateLabel(shop.trendAsOf)}`
                  : "No comparable history",
              ),
            ),
            el("td", { class: "muted" }, dateLabel(shop.sourceAsOf)),
          ),
        ),
      ),
    ),
  );
}
function overview() {
  const m = state.manifest,
    counts = m.counts || {};
  main.replaceChildren(
    heading(
      "YOUR MARKET, IN CONTEXT",
      "Find the moments worth making for.",
      "Follow competing shops, connect buyer occasions to planning windows, and keep every signal tied to its evidence.",
    ),
    sourceStrip(),
    el(
      "div",
      { class: "stats-grid" },
      stat(
        "Shops with sales snapshots",
        number(counts.shopsWithSupplierSales),
        "Supplier estimates in this snapshot",
      ),
      stat(
        "Buyer moments",
        number(counts.moments),
        `${number(counts.momentGroups)} occasion groups`,
      ),
      stat(
        "Review evidence",
        number(counts.reviews),
        "Historical reviews, not orders",
      ),
      stat(
        "Wider shop coverage",
        number(counts.shops),
        `${number(counts.shopsWithReviewModel)} use review-model estimates`,
      ),
    ),
  );
  const series = (m.marketSeries || []).map((p) => ({
    date: p.date,
    value: p.estimatedSales,
  }));
  const market = el(
    "section",
    { class: "panel market-panel" },
    sectionHead(
      "The market pulse",
      "Historical supplier estimates across tracked shops",
      badge("Sample, not all Etsy"),
    ),
    chart(series, { label: "Tracked competitor market history" }),
    el(
      "p",
      { class: "footnote" },
      "Coverage changes can affect totals. Use shop-level history for a closer comparison; this is not a live market forecast.",
    ),
  );
  const groups = m.momentGroups || [];
  const upcoming = groups
    .filter((g) =>
      (g.calendar?.months || []).includes(new Date().getMonth() + 1),
    )
    .sort(
      (a, b) =>
        Number(Boolean(a.calendar?.yearRound)) -
          Number(Boolean(b.calendar?.yearRound)) ||
        a.label.localeCompare(b.label),
    )
    .slice(0, 4);
  const aside = el(
    "section",
    { class: "panel planning-panel" },
    el("div", { class: "eyebrow" }, "PLAN AHEAD"),
    el("h2", {}, `In the ${MONTHS[new Date().getMonth()]} planning window`),
    el(
      "p",
      { class: "muted" },
      "Calendar guidance to explore. These windows are assumptions, not measured demand peaks.",
    ),
    el(
      "div",
      { class: "planning-list" },
      (upcoming.length ? upcoming : groups.slice(0, 4)).map((g) =>
        button(
          el(
            "span",
            {},
            el("span", {}, `${g.label} →`),
            el(
              "span",
              { class: "cell-note" },
              g.calendar?.yearRound
                ? "Year-round occasion"
                : "Seasonal planning window",
            ),
          ),
          () => {
            state.group = g.label;
            state.month = new Date().getMonth() + 1;
            location.hash = "moments";
          },
          "planning-item",
        ),
      ),
    ),
    el(
      "a",
      { href: "#moments", class: "button dark" },
      "Explore buyer moments →",
    ),
  );
  main.append(el("div", { class: "overview-grid" }, market, aside));
  const featured = (m.featuredShops || []).map(normalizeShop);
  main.append(
    el(
      "section",
      { class: "panel" },
      sectionHead(
        "Competitors to explore",
        "Ranked by estimated daily sales in the dated snapshot.",
        el(
          "a",
          { href: "#competitors", class: "text-link" },
          "Explore all shops →",
        ),
      ),
      featured.length
        ? shopTable(featured.slice(0, 6), true)
        : empty(
            "No featured shops",
            "Open the full competitor view to inspect the snapshot.",
          ),
    ),
    el(
      "div",
      { class: "method-note" },
      el("strong", {}, "A signal is a starting point."),
      el(
        "span",
        {},
        " Sales estimates, observed reviews, and planning assumptions answer different questions. Compare like with like.",
      ),
      el("a", { href: "#evidence" }, "How the evidence works →"),
    ),
  );
}
function field(label, node) {
  return el("label", { class: "field" }, el("span", {}, label), node);
}
async function competitors(token) {
  if (!state.shops) {
    main.replaceChildren(
      heading(
        "COMPETITOR INTELLIGENCE",
        "Understand who is moving.",
        "Loading competitor records…",
      ),
    );
    const payload = await loadAsset(state.manifest.assets.shops);
    state.shops = (
      payload.shops ||
      payload.rows.map((row) =>
        Object.fromEntries(
          payload.columns.map((key, i) => [
            key,
            row[i] === null
              ? null
              : payload.dictionaries?.[key]
                ? payload.dictionaries[key][row[i]]
                : row[i],
          ]),
        ),
      )
    ).map(normalizeShop);
    if (token !== navigation) return;
  }
  const categories = [
    ...new Set(state.shops.flatMap((s) => s.categories)),
  ].sort();
  const query = el("input", {
    type: "search",
    placeholder: "Search a shop or category…",
    value: state.shopQuery,
    onInput: (event) => {
      state.shopQuery = event.target.value;
      state.page = 1;
      renderShopResults();
    },
  });
  const category = el(
    "select",
    {
      onChange: (event) => {
        state.category = event.target.value;
        state.page = 1;
        renderShopResults();
      },
    },
    el("option", { value: "" }, "All categories"),
    categories.map((c) =>
      el("option", { value: c, selected: c === state.category }, c),
    ),
  );
  const method = el(
    "select",
    {
      onChange: (event) => {
        state.estimateKind = event.target.value;
        state.page = 1;
        renderShopResults();
      },
    },
    [
      ["", "All evidence types"],
      ["supplier-estimate", "Supplier estimates"],
      ["review-model", "Review models"],
      ["missing", "No sales estimate"],
    ].map(([value, label]) =>
      el("option", { value, selected: value === state.estimateKind }, label),
    ),
  );
  const sort = el(
    "select",
    {
      onChange: (event) => {
        state.sort = event.target.value;
        state.page = 1;
        renderShopResults();
      },
    },
    [
      ["velocity", "Est. daily sales"],
      ["growth", "Modeled momentum"],
      ["sales", "Est. 30-day sales"],
      ["name", "Shop name"],
    ].map(([value, label]) =>
      el("option", { value, selected: state.sort === value }, label),
    ),
  );
  const watch = el("input", {
    type: "checkbox",
    checked: state.watchOnly,
    onChange: (event) => {
      state.watchOnly = event.target.checked;
      state.page = 1;
      renderShopResults();
    },
  });
  main.replaceChildren(
    heading(
      "COMPETITOR INTELLIGENCE",
      "Understand who is moving.",
      "Compare estimated sales velocity, inspect the dated evidence, and keep a personal watchlist.",
    ),
    sourceStrip(),
    el(
      "section",
      { class: "panel" },
      el(
        "div",
        { class: "filters" },
        field("Find competitors", query),
        field("Category", category),
        field("Evidence type", method),
        field("Sort by", sort),
        el("label", { class: "checkbox-field" }, watch, "Watchlist only"),
      ),
      el("div", { class: "results-meta", id: "shop-results-meta" }),
      el("div", { id: "shop-results" }),
      el("div", { id: "shop-pagination", class: "pagination" }),
    ),
    el(
      "p",
      { class: "footnote" },
      "Your watchlist is stored only in this browser. Estimated sales are not verified orders or revenue. Missing values remain unknown.",
    ),
  );
  renderShopResults();
}
function renderShopResults() {
  const rows = filterShops(
    state.shops.filter(
      (s) => !state.estimateKind || s.estimateKind === state.estimateKind,
    ),
    {
      query: state.shopQuery,
      category: state.category,
      watchOnly: state.watchOnly,
      watched: state.watch,
      sort: state.sort,
    },
  );
  const pages = Math.max(1, Math.ceil(rows.length / 25));
  state.page = Math.min(state.page, pages);
  document.querySelector("#shop-results-meta").textContent =
    `${number(rows.length)} shops${state.watchOnly ? " in your watchlist" : ""} · page ${state.page} of ${number(pages)}`;
  document
    .querySelector("#shop-results")
    .replaceChildren(
      rows.length
        ? shopTable(rows.slice((state.page - 1) * 25, state.page * 25))
        : empty(
            "No shops match these filters",
            "Try a broader search, choose all categories, or add a shop to your watchlist.",
          ),
    );
  const prev = button("← Previous", () => {
    state.page--;
    renderShopResults();
  });
  prev.disabled = state.page <= 1;
  const next = button("Next →", () => {
    state.page++;
    renderShopResults();
  });
  next.disabled = state.page >= pages;
  document
    .querySelector("#shop-pagination")
    .replaceChildren(
      prev,
      el("span", {}, `${state.page} / ${number(pages)}`),
      next,
    );
}
async function openShop(shop) {
  const content = document.querySelector("#dialog-content");
  content.replaceChildren(
    el("div", { class: "eyebrow" }, "COMPETITOR PROFILE"),
    el("h2", { id: "dialog-title" }, shop.name),
    el(
      "div",
      { class: "detail-links" },
      external("Open Etsy shop", shop.url),
      badge(modelLabel(shop.estimateKind)),
    ),
    el(
      "div",
      { class: "stats-grid detail-stats" },
      stat(
        "Est. daily sales",
        number(shop.estimatedDailySales, 1),
        `Source: ${dateLabel(shop.sourceAsOf)}`,
      ),
      stat(
        "Reviews / 90d",
        number(shop.observedReviews90d),
        `90 days ending ${dateLabel(shop.reviewsAsOf)}`,
      ),
      stat(
        "Modeled momentum",
        percent(shop.trendDeltaPct),
        `Through ${dateLabel(shop.trendAsOf)}`,
      ),
    ),
    el(
      "p",
      { class: "method-note" },
      shop.estimateKind === "supplier-estimate"
        ? "Primary sales estimate: supplier-reported 30-day estimate divided by 30. This is historical shop-wide volume, not verified orders."
        : shop.method ||
            "Estimate methodology is recorded in the source snapshot.",
    ),
    shop.trendWindow
      ? el(
          "p",
          { class: "footnote" },
          `Modeled daily sales: ${dateLabel(shop.trendWindow.recentStart)}–${dateLabel(shop.trendWindow.recentEnd)} compared with ${dateLabel(shop.trendWindow.priorStart)}–${dateLabel(shop.trendWindow.priorEnd)}. Adjacent calendar months within the observed review span are compared. Review sampling completeness and statistical significance are unverified. This is review-calibrated momentum, separate from the primary supplier sales estimate.`,
        )
      : null,
    el(
      "div",
      { id: "shop-chart", role: "status" },
      "Loading historical evidence…",
    ),
  );
  dialog.showModal();
  try {
    const payload = await loadAsset(state.manifest.assets.shopDetails);
    if (
      !dialog.open ||
      document.querySelector("#dialog-title")?.textContent !== shop.name
    )
      return;
    const detail = payload.shops?.[shop.id];
    const points = (detail?.monthly || []).map((p) => ({
      date: `${p.month.slice(0, 7)}-01`,
      value: p.observedReviews,
    }));
    const target = document.querySelector("#shop-chart");
    target.replaceChildren(
      sectionHead(
        "Monthly review activity",
        "Observed reviews by review month. Review dates are not purchase dates.",
      ),
      chart(points, {
        label: `${shop.name} monthly observed reviews`,
        unit: "observed reviews",
      }),
      el(
        "div",
        { class: "evidence-list" },
        (detail?.evidence || []).map((item) =>
          el("p", {}, el("strong", {}, item.sourceId, ": "), item.description),
        ),
      ),
      el(
        "p",
        { class: "footnote" },
        "Missing months are not filled with zero. A line connects available observations; it does not establish activity between them.",
      ),
      shop.qualityFlags?.length
        ? el(
            "p",
            { class: "footnote" },
            `Data notes: ${shop.qualityFlags.join("; ")}`,
          )
        : null,
    );
  } catch (error) {
    document
      .querySelector("#shop-chart")
      ?.replaceChildren(empty("History could not load", error.message));
  }
}
async function moments(token) {
  if (!state.moments) {
    main.replaceChildren(
      heading(
        "BUYER MOMENTS",
        "Connect occasions to timing.",
        "Loading the buyer-moment catalog…",
      ),
    );
    const payload = await loadAsset(state.manifest.assets.moments);
    state.moments = payload.moments.map(normalizeMoment);
    state.groups = payload.groups.map(normalizeMoment);
    if (token !== navigation) return;
  }
  const query = el("input", {
    type: "search",
    placeholder: "Wedding, teacher, birthday…",
    value: state.momentQuery,
    onInput: (event) => {
      state.momentQuery = event.target.value;
      state.momentLimit = 30;
      renderMomentResults();
    },
  });
  const group = el(
    "select",
    {
      onChange: (event) => {
        state.group = event.target.value;
        state.momentLimit = 30;
        renderMomentResults();
      },
    },
    el("option", { value: "" }, "All occasion groups"),
    state.groups.map((g) =>
      el("option", { value: g.name, selected: g.name === state.group }, g.name),
    ),
  );
  main.replaceChildren(
    heading(
      "BUYER MOMENTS",
      "Connect occasions to timing.",
      "Explore the reasons people buy, then turn their planning windows into research priorities.",
    ),
    el(
      "div",
      { class: "source-strip" },
      badge("Planning assumptions", "warning"),
      el(
        "p",
        {},
        "These recurring windows are editorial guidance. They do not prove a sales peak or the date of a movable holiday.",
      ),
    ),
    el(
      "section",
      { class: "panel" },
      sectionHead(
        "A year of reasons to give",
        "Choose a month to filter moments. Counts represent overlapping moment definitions.",
      ),
      el("div", { class: "month-calendar", id: "month-calendar" }),
    ),
    el(
      "section",
      { class: "panel" },
      el(
        "div",
        { class: "filters moments-filters" },
        field("Find a buyer moment", query),
        field("Occasion group", group),
        button(
          "Clear filters",
          () => {
            state.momentQuery = "";
            state.group = "";
            state.month = null;
            state.momentLimit = 30;
            moments(navigation);
          },
          "button subtle",
        ),
      ),
      el("div", {
        id: "moment-results-meta",
        class: "results-meta",
        role: "status",
      }),
      el("div", { id: "moment-results", class: "moment-grid" }),
      el("div", { id: "moment-more", class: "load-more" }),
    ),
  );
  renderMomentResults();
}
function renderMomentResults() {
  const base = filterMoments(state.moments, {
    query: state.momentQuery,
    group: state.group,
  });
  const counts = calendarCounts(base);
  document.querySelector("#month-calendar").replaceChildren(
    ...MONTHS.map((month, i) => {
      const node = button(
        el(
          "span",
          {},
          el("span", { class: "month-name" }, month.slice(0, 3)),
          el("strong", {}, number(counts[i])),
          el("span", { class: "month-unit" }, "moments"),
        ),
        () => {
          state.month = state.month === i + 1 ? null : i + 1;
          state.momentLimit = 30;
          renderMomentResults();
        },
        `month ${state.month === i + 1 ? "selected" : ""}`,
      );
      node.setAttribute("aria-pressed", String(state.month === i + 1));
      node.setAttribute(
        "aria-label",
        `${month}, ${counts[i]} moments${state.month === i + 1 ? ", selected" : ""}`,
      );
      return node;
    }),
  );
  const rows = filterMoments(state.moments, {
    query: state.momentQuery,
    group: state.group,
    month: state.month,
  });
  document.querySelector("#moment-results-meta").textContent =
    `${number(rows.length)} buyer moments${state.month ? ` · ${MONTHS[state.month - 1]} planning window` : ""} · listing sample counts may overlap`;
  document.querySelector("#moment-results").replaceChildren(
    ...(rows.length
      ? rows.slice(0, state.momentLimit).map((moment) => {
          const card = el(
            "article",
            { class: "moment-card" },
            el("div", { class: "eyebrow" }, moment.group),
            button(moment.name, () => openMoment(moment), "moment-title"),
            el(
              "p",
              { class: "window-label" },
              moment.calendar?.yearRound
                ? "Year-round planning"
                : moment.months
                    .map((m) => MONTHS[m - 1]?.slice(0, 3))
                    .join(" · ") || "Window not recorded",
            ),
            el(
              "div",
              { class: "moment-card-bottom" },
              el(
                "span",
                {},
                `${number(moment.listingSampleCount)} sampled listings`,
              ),
              badge("Planning window"),
            ),
          );
          return card;
        })
      : [
          empty(
            "No moments match",
            "Choose another month or clear the search and group filters.",
          ),
        ]),
  );
  document.querySelector("#moment-more").replaceChildren(
    ...(rows.length > state.momentLimit
      ? [
          button(
            `Show 30 more (${number(rows.length - state.momentLimit)} remaining)`,
            () => {
              state.momentLimit += 30;
              renderMomentResults();
            },
          ),
        ]
      : []),
  );
}
function openMoment(moment) {
  const content = document.querySelector("#dialog-content");
  content.replaceChildren(
    el("div", { class: "eyebrow" }, moment.group),
    el("h2", { id: "dialog-title" }, moment.name),
    badge("Planning window", "warning"),
    el(
      "p",
      { class: "detail-intro" },
      moment.calendar?.yearRound
        ? "This occasion is classified as relevant throughout the year."
        : `Planning months: ${moment.months.map((m) => MONTHS[m - 1]).join(", ") || "not recorded"}.`,
    ),
    el(
      "dl",
      { class: "definition-list" },
      el("dt", {}, "Window source"),
      el("dd", {}, moment.calendar?.source || "Not recorded"),
      el("dt", {}, "Evidence dated"),
      el("dd", {}, dateLabel(moment.sourceAsOf)),
      el("dt", {}, "Listing sample"),
      el(
        "dd",
        {},
        `${number(moment.listingSampleCount)} listings; overlapping samples are not market size.`,
      ),
      el("dt", {}, "Keywords"),
      el(
        "dd",
        {},
        Array.isArray(moment.keywords)
          ? moment.keywords.join(", ")
          : moment.keywords || "Not recorded",
      ),
    ),
    moment.topListing
      ? el(
          "section",
          { class: "evidence-card" },
          el("h3", {}, "Example listing evidence"),
          external(
            moment.topListing.title || "View example listing",
            moment.topListing.url,
          ),
        )
      : null,
    el(
      "p",
      { class: "method-note" },
      "Use this window to plan research and creative work. Confirm demand with dated shop and listing evidence before treating it as a trend.",
    ),
    el(
      "a",
      { href: `classic.html?view=buyer-moments`, class: "button" },
      "Open detailed buyer-moment research →",
    ),
  );
  dialog.showModal();
}
function evidence() {
  const m = state.manifest;
  const sources = (m.sources || []).map((source) => {
    const age = dayAge(source.asOf);
    return el(
      "article",
      { class: "source-card" },
      el(
        "div",
        { class: "section-heading" },
        el("h3", {}, source.label),
        badge(
          age === null ? "Unknown" : age > 30 ? "Stale" : "Recent",
          age === null || age > 30 ? "warning" : "positive",
        ),
      ),
      el("strong", { class: "source-date" }, dateLabel(source.asOf)),
      el(
        "p",
        { class: "muted" },
        age === null
          ? "No usable observation date"
          : `${number(age)} days since latest source observation`,
      ),
      el(
        "p",
        {},
        Array.isArray(source.limitations)
          ? source.limitations.join(" ")
          : source.limitations,
      ),
      badge(source.kind || "Source"),
    );
  });
  const methods = (m.methodology || []).map((item) =>
    el("article", {}, el("h3", {}, item.label), el("p", {}, item.description)),
  );
  const quality = (m.quality || []).map((item) =>
    el(
      "article",
      { class: "quality-item" },
      badge(
        item.severity,
        item.severity === "error" || item.severity === "warning"
          ? "warning"
          : "neutral",
      ),
      el(
        "div",
        {},
        el("h3", {}, item.label),
        el("p", {}, item.detail),
        finite(item.count)
          ? el("span", { class: "tiny" }, `${number(item.count)} records`)
          : null,
      ),
    ),
  );
  main.replaceChildren(
    heading(
      "EVIDENCE & HEALTH",
      "Know what the signal can support.",
      "Source dates, model assumptions, and data-quality checks stay visible so a rebuilt page never looks like freshly collected evidence.",
    ),
    el(
      "div",
      { class: "source-strip" },
      badge("Static research snapshot"),
      el(
        "p",
        {},
        "Workspace built ",
        dateLabel(m.builtAt),
        ". Original snapshot ",
        dateLabel(m.sourceSnapshotAt),
        ". Neither is the observation date.",
      ),
    ),
    el(
      "section",
      { class: "panel" },
      sectionHead(
        "Source freshness",
        "Age is calculated from the observation date, not the export.",
      ),
      el("div", { class: "source-cards" }, sources),
    ),
    el(
      "div",
      { class: "evidence-grid" },
      el(
        "section",
        { class: "panel" },
        sectionHead("How to read the metrics"),
        el("div", { class: "methodology-list" }, methods),
      ),
      el(
        "section",
        { class: "panel" },
        sectionHead("Quality checks & limitations"),
        el("div", { class: "quality-list" }, quality),
      ),
    ),
    el(
      "section",
      { class: "panel continuation" },
      el("h2", {}, "Keep the deeper research within reach."),
      el(
        "p",
        { class: "muted" },
        "The advanced workspace preserves listing-level analysis, operations, source tables, and the existing research workflows.",
      ),
      el(
        "a",
        { href: "classic.html", class: "button dark" },
        "Open advanced research →",
      ),
    ),
  );
}
async function route() {
  const token = ++navigation;
  const key = location.hash.slice(1).split("?")[0] || "overview";
  const section = labels[key] ? key : "overview";
  document.querySelectorAll("[data-nav]").forEach((node) => {
    node.classList.toggle("active", node.dataset.nav === section);
    if (node.dataset.nav === section) node.setAttribute("aria-current", "page");
    else node.removeAttribute("aria-current");
  });
  document.querySelector("#section-label").textContent = labels[section];
  document.title = `${labels[section]} · Cronk Research`;
  try {
    if (section === "competitors") await competitors(token);
    else if (section === "moments") await moments(token);
    else if (section === "evidence") evidence();
    else overview();
  } catch (error) {
    if (token === navigation)
      main.replaceChildren(
        heading(
          "RESEARCH SNAPSHOT",
          "This view could not load.",
          error.message,
        ),
        button("Reload snapshot", () => location.reload()),
        el(
          "a",
          { href: "classic.html", class: "text-link" },
          "Open advanced research",
        ),
      );
  }
}
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }
});
window.addEventListener("hashchange", route);
try {
  state.manifest = await loadAsset("manifest.json");
  bindManifest(state.manifest);
  const date = state.manifest.sourceDates?.competitorSales;
  document.querySelector("#top-freshness").textContent =
    `Sales data · ${dateLabel(date)}`;
  document
    .querySelector("#status-dot")
    .classList.toggle("stale", dayAge(date) === null || dayAge(date) > 30);
  await route();
} catch (error) {
  document.querySelector("#top-freshness").textContent = "Snapshot unavailable";
  main.replaceChildren(
    heading(
      "RESEARCH SNAPSHOT",
      "We couldn’t open the research data.",
      error.message,
    ),
    button("Retry loading", () => location.reload()),
    el(
      "a",
      { href: "classic.html", class: "text-link" },
      "Open advanced research",
    ),
  );
}
