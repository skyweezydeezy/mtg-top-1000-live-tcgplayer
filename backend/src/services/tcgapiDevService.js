import { enrichCardsWithScryfall } from "./scryfallService.js";

const DEFAULT_GAME = "magic";

export async function fetchTcgApiDevTopLive({ period = "30d", limit = 100 } = {}) {
  const apiKey = process.env.TCGAPI_DEV_KEY;
  if (!apiKey) {
    throw new Error("Missing TCGAPI_DEV_KEY.");
  }

  const safeLimit = Math.max(1, Math.min(Number(limit || 100), 100));
  const mappedPeriod = mapPeriod(period);

  // tcgapi.dev top-movers is limited, so combine upward and downward movers.
  const upLimit = Math.min(50, Math.ceil(safeLimit / 2));
  const downLimit = Math.min(50, safeLimit - upLimit);

  const [upRows, downRows] = await Promise.all([
    fetchTopMovers({ direction: "up", period: mappedPeriod, limit: upLimit }),
    downLimit > 0
      ? fetchTopMovers({ direction: "down", period: mappedPeriod, limit: downLimit })
      : Promise.resolve([])
  ]);

  const normalized = dedupeByCardId([...upRows, ...downRows])
    .map((row, index) => normalizeTcgApiDevMover(row, index, mappedPeriod))
    .filter((card) => card.name && card.name !== "Unknown Card")
    .sort((a, b) => Math.abs(b.trendPct) - Math.abs(a.trendPct))
    .slice(0, safeLimit)
    .map((card, index) => ({ ...card, rank: index + 1 }));

  const enriched = await enrichCardsWithScryfall(normalized);

  return enriched.map((card, index) => ({ ...card, rank: index + 1 }));
}

async function fetchTopMovers({ direction, period, limit }) {
  const url = new URL(`${baseUrl()}/v1/prices/top-movers`);
  url.searchParams.set("game", DEFAULT_GAME);
  url.searchParams.set("direction", direction);
  url.searchParams.set("period", period);
  url.searchParams.set("type", "Cards");
  url.searchParams.set("limit", String(Math.min(50, Math.max(1, limit))));

  const data = await tcgApiFetch(url);
  return extractArray(data);
}

async function tcgApiFetch(url) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "X-API-Key": process.env.TCGAPI_DEV_KEY
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`tcgapi.dev request failed: HTTP ${response.status} ${url.toString()} ${text}`);
  }

  return response.json();
}

function baseUrl() {
  return (process.env.TCGAPI_DEV_BASE || "https://api.tcgapi.dev").replace(/\/$/, "");
}

function mapPeriod(period) {
  const p = String(period || "30d").toLowerCase();
  if (p === "1d" || p === "24h") return "24h";
  if (p === "7d") return "7d";
  return "30d";
}

function dedupeByCardId(rows) {
  const seen = new Set();
  const out = [];

  for (const row of rows) {
    const key = String(
      pick(row, ["id", "card_id", "tcgplayer_id", "tcgplayerId", "product.id", "card.id"]) ||
      `${pick(row, ["name", "card.name", "product.name"])}|${pick(row, ["set", "set_name", "card.set", "product.set"])}`
    );

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }

  return out;
}

function normalizeTcgApiDevMover(row, index, period) {
  const name = string(pick(row, [
    "name",
    "card.name",
    "product.name",
    "productName",
    "title"
  ]) || "Unknown Card");

  const marketPrice = number(pick(row, [
    "market_price",
    "marketPrice",
    "price.market_price",
    "prices.market_price",
    "price",
    "current_price",
    "currentPrice"
  ]));

  const lowPrice = number(pick(row, [
    "low_price",
    "lowPrice",
    "price.low_price",
    "prices.low_price",
    "lowest_price",
    "lowestPrice"
  ]));

  const midPrice = number(pick(row, [
    "median_price",
    "mid_price",
    "midPrice",
    "price.median_price",
    "prices.median_price"
  ]));

  const trendPct = number(pick(row, [
    "price_change",
    `price_change_${period}`,
    "price_change_30d",
    "price_change_7d",
    "price_change_24h",
    "priceChange",
    "change_pct",
    "changePct"
  ]));

  const listings = number(pick(row, [
    "total_listings",
    "listing_count",
    "listings",
    "listingCount"
  ]));

  const tcgplayerId = pick(row, [
    "tcgplayer_id",
    "tcgplayerId",
    "product.tcgplayer_id",
    "product.tcgplayerId"
  ]);

  const id = String(pick(row, [
    "id",
    "card_id",
    "card.id",
    "product.id",
    "tcgplayer_id",
    "tcgplayerId"
  ]) || `tcgapi-${index + 1}`);

  return {
    id,
    rank: index + 1,
    tcgplayerId: tcgplayerId || null,
    name,
    set: string(pick(row, ["set_code", "setCode", "set", "card.set", "product.set"])).toUpperCase(),
    setName: string(pick(row, ["set_name", "setName", "set", "card.set_name", "product.set_name"])),
    rarity: titleCase(string(pick(row, ["rarity", "card.rarity", "product.rarity"]) || "Unknown")),
    colors: ["C"],
    formats: ["Commander"],
    typeLine: string(pick(row, ["type_line", "typeLine", "product_type", "productType", "type"]) || "Cards"),
    imageUrl: string(pick(row, [
      "image_url",
      "imageUrl",
      "image",
      "card.image_url",
      "card.imageUrl",
      "product.image_url",
      "product.imageUrl"
    ])),
    totalSales: roundMoney(marketPrice * Math.max(1, listings)),
    copiesSold: listings,
    marketPrice: roundMoney(marketPrice),
    lowPrice: roundMoney(lowPrice),
    midPrice: roundMoney(midPrice),
    highPrice: 0,
    directLow: roundMoney(number(pick(row, ["lowest_with_shipping", "lowestWithShipping"]))),
    trendPct,
    productUrl: buildProductUrl(tcgplayerId, name)
  };
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.cards)) return data.cards;
  if (Array.isArray(data.movers)) return data.movers;
  return [];
}

function pick(obj, paths) {
  for (const path of paths) {
    const value = get(obj, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function get(obj, path) {
  return String(path).split(".").reduce((acc, key) => acc == null ? undefined : acc[key], obj);
}

function buildProductUrl(tcgplayerId, name) {
  if (tcgplayerId) return `https://www.tcgplayer.com/product/${tcgplayerId}`;
  return `https://www.tcgplayer.com/search/magic/product?productLineName=magic&q=${encodeURIComponent(name || "")}&view=grid&utm_source=mtgmarketpulse&utm_medium=affiliate`;
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function string(value) {
  return value == null ? "" : String(value);
}

function titleCase(value) {
  const s = String(value || "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}
