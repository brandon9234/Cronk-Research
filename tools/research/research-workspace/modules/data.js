const base = new URL("assets/research/", document.baseURI);
const requests = new Map();
let assetsByName = new Map();
export function bindManifest(manifest) {
  const entries = Object.entries(manifest.assets || {}).map(([key, name]) => [
    name,
    manifest.assetIntegrity?.[key],
  ]);
  assetsByName = new Map(entries);
  requests.clear();
}
export async function loadAsset(name) {
  if (!/^[a-z-]+\.json$/.test(name)) throw new Error("Invalid research asset");
  const integrity = name === "manifest.json" ? null : assetsByName.get(name);
  if (
    name !== "manifest.json" &&
    (!integrity ||
      !Number.isInteger(integrity.bytes) ||
      !/^[a-f0-9]{64}$/.test(integrity.sha256))
  )
    throw new Error(
      "Snapshot integrity metadata is missing. Reload to obtain a complete snapshot.",
    );
  const key = `${name}:${integrity?.sha256 || "manifest"}`;
  if (requests.has(key)) return requests.get(key);
  const url = new URL(name, base);
  if (integrity) url.searchParams.set("v", integrity.sha256);
  const request = fetch(url, { credentials: "same-origin", cache: "no-cache" })
    .then(async (response) => {
      if (!response.ok)
        throw new Error(`Research snapshot unavailable (${response.status}).`);
      const bytes = await response.arrayBuffer();
      if (integrity) {
        if (bytes.byteLength !== integrity.bytes)
          throw new Error(
            "The snapshot changed while loading. Reload to obtain matching data.",
          );
        if (!globalThis.crypto?.subtle)
          throw new Error(
            "Snapshot verification requires HTTPS or a local development server.",
          );
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        const actual = [...new Uint8Array(digest)]
          .map((value) => value.toString(16).padStart(2, "0"))
          .join("");
        if (actual !== integrity.sha256)
          throw new Error(
            "The snapshot changed while loading. Reload to obtain matching data.",
          );
      }
      const data = JSON.parse(new TextDecoder().decode(bytes));
      if (data.schemaVersion !== 1)
        throw new Error("This research snapshot uses an unsupported schema.");
      return data;
    })
    .catch((error) => {
      requests.delete(key);
      throw error;
    });
  requests.set(key, request);
  return request;
}
export const normalizeShop = (shop) => ({
  ...shop,
  salesPerDay: shop.estimatedDailySales,
  changePct: shop.trendDeltaPct,
  observedSales: shop.estimatedSales30d,
  categories: shop.categories || [],
});
export const normalizeMoment = (moment) => ({
  ...moment,
  name: moment.label,
  group: moment.groupLabel || moment.label,
  months: moment.calendar?.months || [],
  reviewCount: moment.listingSampleCount || 0,
});
