export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const finite = (value) =>
  typeof value === "number" && Number.isFinite(value);
export const number = (value, digits = 0) =>
  finite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: digits })
    : "—";
export const percent = (value) =>
  finite(value) ? `${value > 0 ? "+" : ""}${number(value, 1)}%` : "—";
export function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function dayAge(value, now = new Date()) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime())
    ? Math.max(0, Math.floor((now - parsed) / 86400000))
    : null;
}
export function dateLabel(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Not recorded";
}
export function filterShops(
  shops,
  {
    query = "",
    category = "",
    watchOnly = false,
    watched = [],
    sort = "velocity",
  } = {},
) {
  const q = query.trim().toLowerCase();
  return shops
    .filter(
      (shop) =>
        (!q ||
          `${shop.name} ${(shop.categories || []).join(" ")}`
            .toLowerCase()
            .includes(q)) &&
        (!category || (shop.categories || []).includes(category)) &&
        (!watchOnly || watched.includes(shop.id)),
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const field =
        sort === "growth"
          ? "changePct"
          : sort === "sales"
            ? "observedSales"
            : "salesPerDay";
      const av = a[field],
        bv = b[field];
      if (!finite(av) && !finite(bv)) return a.name.localeCompare(b.name);
      if (!finite(av)) return 1;
      if (!finite(bv)) return -1;
      return bv - av || a.name.localeCompare(b.name);
    });
}
export function filterMoments(
  moments,
  { query = "", group = "", month = null } = {},
) {
  const q = query.trim().toLowerCase();
  return moments
    .filter(
      (moment) =>
        (!q ||
          `${moment.name} ${moment.group} ${(moment.keywords || []).join(" ")} ${(moment.tags || []).join(" ")}`
            .toLowerCase()
            .includes(q)) &&
        (!group || moment.group === group) &&
        (month === null || (moment.months || []).includes(month)),
    )
    .sort(
      (a, b) =>
        (b.reviewCount || 0) - (a.reviewCount || 0) ||
        a.name.localeCompare(b.name),
    );
}
export function calendarCounts(moments) {
  return MONTHS.map(
    (_, i) => moments.filter((m) => (m.months || []).includes(i + 1)).length,
  );
}
export function chartGeometry(points, width = 700, height = 200) {
  const clean = points
    .filter(
      (p) =>
        finite(p.value) &&
        p.date &&
        Number.isFinite(new Date(p.date).getTime()),
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!clean.length) return { points: [], path: "", max: 0 };
  const max = Math.max(...clean.map((p) => p.value), 1),
    minTime = new Date(clean[0].date).getTime(),
    span = Math.max(1, new Date(clean.at(-1).date) - minTime);
  const xy = clean.map((p, i) => ({
    ...p,
    x:
      clean.length === 1
        ? width / 2
        : ((new Date(p.date) - minTime) / span) * width,
    y: height - (p.value / max) * height,
  }));
  return {
    points: xy,
    path: xy
      .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" "),
    max,
  };
}
export function readWatchlist(storage) {
  try {
    const parsed = JSON.parse(
      storage.getItem("cronk-research-watchlist-v1") || "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === "string").slice(0, 1000)
      : [];
  } catch {
    return [];
  }
}
export function saveWatchlist(storage, list) {
  try {
    storage.setItem(
      "cronk-research-watchlist-v1",
      JSON.stringify([...new Set(list)].slice(0, 1000)),
    );
    return true;
  } catch {
    return false;
  }
}
