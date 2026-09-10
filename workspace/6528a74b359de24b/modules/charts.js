import { number, dateLabel, chartGeometry } from "./core.js";
import { el, svg } from "./dom.js";
export function chart(
  points,
  {
    label = "Historical signal",
    unit = "estimated sales",
    compact = false,
  } = {},
) {
  const geometry = chartGeometry(points, 700, 180);
  if (!geometry.points.length)
    return el(
      "p",
      { class: "empty-state" },
      "No public time series. The current snapshot has no dated observations for this view.",
    );
  const root = el("div", { class: `chart ${compact ? "compact" : ""}` });
  const drawing = svg("svg", {
    viewBox: "0 0 780 245",
    role: "img",
    "aria-label": `${label}. ${geometry.points.length} observations from ${dateLabel(geometry.points[0].date)} to ${dateLabel(geometry.points.at(-1).date)}. ${unit}.`,
  });
  for (let i = 0; i < 4; i++) {
    const y = 20 + i * 60;
    drawing.append(
      svg("line", {
        x1: 55,
        y1: y,
        x2: 755,
        y2: y,
        stroke: "#d7dfd8",
        "stroke-dasharray": "3 5",
      }),
    );
    const text = svg("text", {
      x: 45,
      y: y + 4,
      "text-anchor": "end",
      fill: "#647067",
      "font-size": 11,
    });
    text.textContent = number(geometry.max * (1 - i / 3));
    drawing.append(text);
  }
  const group = svg("g", { transform: "translate(55,20)" });
  group.append(
    svg("path", {
      d: geometry.path,
      fill: "none",
      stroke: "#0b7a63",
      "stroke-width": 2.5,
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
    }),
  );
  for (const point of geometry.points) {
    const dot = svg("circle", {
      cx: point.x,
      cy: point.y,
      r: geometry.points.length > 100 ? 1.5 : 3,
      fill: "#0b7a63",
    });
    const title = svg("title");
    title.textContent = `${dateLabel(point.date)}: ${number(point.value, 1)} ${unit}`;
    dot.append(title);
    group.append(dot);
  }
  drawing.append(group);
  root.append(
    drawing,
    el(
      "div",
      { class: "chart-date-range" },
      dateLabel(geometry.points[0].date),
      el("span", {}, dateLabel(geometry.points.at(-1).date)),
    ),
  );
  const details = el(
    "details",
    { class: "chart-data" },
    el("summary", {}, "View chart data"),
  );
  const table = el(
    "table",
    {},
    el("caption", { class: "sr-only" }, label),
    el("thead", {}, el("tr", {}, el("th", {}, "Date"), el("th", {}, unit))),
    el(
      "tbody",
      {},
      geometry.points.map((p) =>
        el(
          "tr",
          {},
          el("td", {}, dateLabel(p.date)),
          el("td", {}, number(p.value, 1)),
        ),
      ),
    ),
  );
  details.append(el("div", { class: "table-scroll" }, table));
  root.append(details);
  return root;
}
