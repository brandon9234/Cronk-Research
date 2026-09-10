import test from "node:test";
import assert from "node:assert/strict";
import {
  safeURL,
  filterShops,
  filterMoments,
  calendarCounts,
  chartGeometry,
  readWatchlist,
  saveWatchlist,
  dayAge,
  number,
} from "../modules/core.js";
test("unknown metrics stay unknown; malformed URL and scripting rejected", () => {
  assert.equal(number(null), "—");
  assert.equal(number(NaN), "—");
  assert.equal(safeURL("javascript:alert(1)"), null);
  assert.equal(
    safeURL("https://etsy.com/shop/Test"),
    "https://etsy.com/shop/Test",
  );
  assert.equal(safeURL("/relative"), null);
});
test("shop filters combine and unknown values sort last", () => {
  const shops = [
    { id: "a", name: "Oak", categories: ["Wood"], salesPerDay: null },
    { id: "b", name: "Elm", categories: ["Wood"], salesPerDay: 0 },
    { id: "c", name: "Beech", categories: ["Wood"], salesPerDay: 5 },
  ];
  assert.deepEqual(
    filterShops(shops).map((s) => s.id),
    ["c", "b", "a"],
  );
  assert.deepEqual(
    filterShops(shops, {
      query: "wood",
      watchOnly: true,
      watched: ["a", "b"],
    }).map((s) => s.id),
    ["b", "a"],
  );
  assert.equal(filterShops(shops, { query: "unknown" }).length, 0);
});
test("month calendar follows assumptions without interpreting counts as sales", () => {
  const moments = [
    { name: "Wedding", group: "Wedding", months: [4, 5, 6], reviewCount: 10 },
    {
      name: "Birthday",
      group: "Birthday",
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      reviewCount: 3,
    },
  ];
  assert.equal(calendarCounts(moments)[4], 2);
  assert.equal(filterMoments(moments, { month: 11 })[0].name, "Birthday");
  assert.equal(
    filterMoments(moments, { month: 5, group: "Wedding" }).length,
    1,
  );
});
test("chart preserves gaps with real date spacing and no invented values", () => {
  const chart = chartGeometry(
    [
      { date: "2026-01-01", value: 0 },
      { date: "2026-01-02", value: 5 },
      { date: "2026-01-11", value: 10 },
      { date: "2026-01-03", value: null },
      { date: "invalid", value: 2 },
    ],
    100,
    100,
  );
  assert.equal(chart.points.length, 3);
  assert.equal(chart.points[1].x, 10);
  assert.equal(chart.points[2].x, 100);
  assert.equal(
    chartGeometry([{ date: "2026-01-01", value: 3 }], 100, 100).points[0].x,
    50,
  );
});
test("watchlist survives invalid and unavailable browser storage", () => {
  assert.deepEqual(readWatchlist({ getItem: () => "{bad" }), []);
  assert.deepEqual(readWatchlist({ getItem: () => '{"wrong":1}' }), []);
  assert.deepEqual(readWatchlist({ getItem: () => '["a",3,"b"]' }), ["a", "b"]);
  assert.equal(
    saveWatchlist(
      {
        setItem: () => {
          throw new Error();
        },
      },
      ["a"],
    ),
    false,
  );
  let value;
  assert.equal(
    saveWatchlist(
      {
        setItem: (k, v) => {
          value = v;
        },
      },
      ["a", "a"],
    ),
    true,
  );
  assert.equal(value, '["a"]');
});
test("source age is explicit and invalid dates remain unknown", () => {
  assert.equal(dayAge("2026-05-01", new Date("2026-06-01")), 31);
  assert.equal(dayAge(null), null);
  assert.equal(dayAge("not a date"), null);
});

test("buyer intent search includes keywords and occasion tags", () => {
  const rows = [
    {
      name: "Celebration",
      group: "Life events",
      keywords: ["retirement gift"],
      tags: ["Professional"],
      months: [4],
    },
  ];
  assert.equal(filterMoments(rows, { query: "retirement" }).length, 1);
  assert.equal(filterMoments(rows, { query: "professional" }).length, 1);
});
