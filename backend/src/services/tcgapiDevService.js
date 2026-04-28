import { enrichCardsWithScryfall, cleanCardName } from "./scryfallService.js";

const DEFAULT_GAME = "magic";

export async function fetchTcgApiDevTopLive({ period = "30d", limit = 100 } = {}) {
  const apiKey = process.env.TCGAPI_DEV_KEY;
  if (!apiKey) {
    throw new Error("Missing TCGAPI_DEV_KEY.");
  }

  const safeLimit = Math.max(1, Math.min(Number(limit || 100), 100));
  const mappedPeriod = mapPeriod(period);

  // Fetch the full available mover pool, then filter to real Scryfall-matched cards.
  const [upRows, downRows] = await Promise.all([
    fetchTopMovers({ direction: "up", period: mappedPeriod, limit: 50 }),
    fetchTopMovers({ direction: "down", period: mappedPeriod, limit: 50 })
  ]);

  const normalized = dedupeByCardId([...upRows, ...downRows])
    .map((row, index) => normalizeTcgApiDevMover(row, index, mappedPeriod))
    .filter((card) => card.name && card.name !== "Unknown Card")
    // Sort initially by weighted move, not raw percent.
    .sort((a, b) => b.weightedMoveScore - a.weightedMoveScore);

  const enriched = await enrichCardsWithScryfall(normalized, { requireMatch: true });

  return enriched
    .sort((a, b) => b.weightedMoveScore - a.weightedMoveScore)
    .slice(0, safeLimit)
    .map((card, index) => ({ ...card, rank: index + 1 }));
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
    const rawName = string(pick(row, ["name", "card.name", "product.name", "productName", "title"]));
    const cleanName = cleanCardName(rawName);
    const setName = string(pick(row, ["set_name", "setName", "set", "card.set_name", "product.set_name"]));

    const key = String(
      pick(row, ["id", "card_id", "tcgplayer_id", "tcgplayerId", "product.id", "card.id"]) ||
      `${cleanName}|${setName}`
    );

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }

  return out;
}

function normalizeTcgApiDevMover(row, index, period) {
  const rawName = string(pick(row, [
    "name",
    "card.name",
    "product.name",
    "productName",
    "title"
  ]) || "Unknown Card");

  const cleanedName = cleanCardName(rawName);

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

  const productImage = string(pick(row, [
    "image_url",
    "imageUrl",
    "image",
    "card.image_url",
    "card.imageUrl",
    "product.image_url",
    "product.imageUrl"
  ]));

  const weighting = calculateWeightedMove({ marketPrice, trendPct });

  return {
    id,
    rank: index + 1,
    tcgplayerId: tcgplayerId || null,
    sourceName: rawName,
    cleanName: cleanedName,
    name: cleanedName || rawName,
    set: string(pick(row, ["set_code", "setCode", "set", "card.set", "product.set"])).toUpperCase(),
    setName: string(pick(row, ["set_name", "setName", "set", "card.set_name", "product.set_name"])),
    rarity: titleCase(string(pick(row, ["rarity", "card.rarity", "product.rarity"]) || "Unknown")),
    colors: ["C"],
    formats: ["Commander"],
    typeLine: string(pick(row, ["type_line", "typeLine", "product_type", "productType", "type"]) || "Cards"),
    imageUrl: productImage,

    // Activity fields.
    totalSales: roundMoney(marketPrice * Math.max(1, listings)),
    copiesSold: listings,
    marketPrice: roundMoney(marketPrice),
    lowPrice: roundMoney(lowPrice),
    midPrice: roundMoney(midPrice),
    highPrice: 0,
    directLow: roundMoney(number(pick(row, ["lowest_with_shipping", "lowestWithShipping"]))),
    trendPct,

    // Weighted bubble fields.
    previousPrice: weighting.previousPrice,
    dollarChange: weighting.dollarChange,
    valueWeight: weighting.valueWeight,
    pennySpikePenalty: weighting.pennySpikePenalty,
    weightedMoveScore: weighting.weightedMoveScore,
    bubbleScore: weighting.weightedMoveScore,

    productUrl: buildProductUrl(tcgplayerId, rawName)
  };
}

/*
  Weighted movement formula.

  Problem:
    A $0.02 card moving to $1.00 is a 4,900% spike, but only a $0.98 move.
    A $10.00 card moving to $15.00 is only a 50% spike, but a $5.00 move.

  Solution:
    Bubble size should reflect actual market weight, not raw percentage.

  Formula:
    previousPrice = currentPrice / (1 + trendPct / 100)
    dollarChange = currentPrice - previousPrice
    valueWeight = log10(currentPrice + 1)
    pennySpikePenalty = currentPrice < 2 ? max(0.15, currentPrice / 2) : 1
    weightedMoveScore = abs(dollarChange) * valueWeight * pennySpikePenalty

  Result:
    Cheap penny spikes still show up, but they do not dominate the visual field.
*/
function calculateWeightedMove({ marketPrice, trendPct }) {
  const current = Math.max(0, number(marketPrice));
  const pct = number(trendPct);

  let previous = current;

  if (pct > -99.999 && pct !== 0) {
    previous = current / (1 + pct / 100);
  }

  if (!Number.isFinite(previous) || previous < 0) {
    previous = 0;
  }

  const dollarChange = current - previous;
  const valueWeight = Math.log10(current + 1);

  // Softly penalize very cheap cards so tiny absolute moves do not become giant bubbles.
  const pennySpikePenalty = current < 2
    ? Math.max(0.15, current / 2)
    : 1;

  const weightedMoveScore = Math.abs(dollarChange) * valueWeight * pennySpikePenalty;

  return {
    previousPrice: roundMoney(previous),
    dollarChange: roundMoney(dollarChange),
    valueWeight: roundNumber(valueWeight, 4),
    pennySpikePenalty: roundNumber(pennySpikePenalty, 4),
    weightedMoveScore: roundNumber(weightedMoveScore, 6)
  };
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data;
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

function roundNumber(value, digits = 4) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

function string(value) {
  return value == null ? "" : String(value);
}

function titleCase(value) {
  const s = String(value || "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}
