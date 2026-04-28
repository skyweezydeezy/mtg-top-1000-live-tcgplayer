const DEFAULT_GAME = "magic";

export async function fetchTcgApiDevTopLive({ period = "30d", limit = 100 } = {}) {
  const apiKey = process.env.TCGAPI_DEV_KEY;
  if (!apiKey) throw new Error("Missing TCGAPI_DEV_KEY.");

  const safeLimit = Math.max(1, Math.min(Number(limit || 100), 100));
  const mappedPeriod = mapPeriod(period);

  // tcgapi.dev top-movers has max 50 per request, so combine up + down.
  const upLimit = Math.min(50, Math.ceil(safeLimit / 2));
  const downLimit = Math.min(50, safeLimit - upLimit);

  const [upRows, downRows] = await Promise.all([
    fetchTopMovers({ direction: "up", period: mappedPeriod, limit: upLimit }),
    downLimit > 0 ? fetchTopMovers({ direction: "down", period: mappedPeriod, limit: downLimit }) : Promise.resolve([])
  ]);

  return dedupeByCardId([...upRows, ...downRows])
    .map((row, index) => normalizeTcgApiDevMover(row, index, mappedPeriod))
    .sort((a, b) => Math.abs(b.trendPct) - Math.abs(a.trendPct))
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
    headers: { "Accept": "application/json", "X-API-Key": process.env.TCGAPI_DEV_KEY }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`tcgapi.dev request failed: HTTP ${response.status} ${url.toString()} ${text}`);
  }
  return response.json();
}

function baseUrl() { return (process.env.TCGAPI_DEV_BASE || "https://api.tcgapi.dev").replace(/\/$/, ""); }
function mapPeriod(period) { const p = String(period || "30d").toLowerCase(); if (p === "1d" || p === "24h") return "24h"; if (p === "7d") return "7d"; return "30d"; }
function dedupeByCardId(rows) { const seen = new Set(), out = []; for (const row of rows) { const key = String(row.card_id || row.id || row.tcgplayer_id || `${row.name}|${row.set_name}|${row.printing}`); if (seen.has(key)) continue; seen.add(key); out.push(row); } return out; }

function normalizeTcgApiDevMover(row, index, period) {
  const priceChange = number(row.price_change) || number(row[`price_change_${period}`]) || number(row.price_change_30d) || number(row.price_change_7d) || number(row.price_change_24h);
  const marketPrice = number(row.market_price) || number(row.price?.market_price) || number(row.price);
  const lowPrice = number(row.low_price) || number(row.price?.low_price);
  const medianPrice = number(row.median_price) || number(row.price?.median_price);
  const id = String(row.card_id || row.id || row.tcgplayer_id || `tcgapi-${index + 1}`);
  const name = string(row.name || "Unknown Card");
  const setName = string(row.set_name || row.set || "");
  return {
    id,
    rank: index + 1,
    tcgplayerId: row.tcgplayer_id || row.tcgplayerId || null,
    name,
    set: string(row.set_code || row.set || "").toUpperCase(),
    setName,
    rarity: titleCase(string(row.rarity || "Unknown")),
    colors: ["C"],
    formats: ["Commander"],
    typeLine: string(row.product_type || "Cards"),
    imageUrl: string(row.image_url || row.imageUrl || ""),
    totalSales: roundMoney(marketPrice * number(row.total_listings || row.listing_count || 1)),
    copiesSold: number(row.total_listings || row.listing_count || 0),
    marketPrice: roundMoney(marketPrice),
    lowPrice: roundMoney(lowPrice),
    midPrice: roundMoney(medianPrice),
    highPrice: 0,
    directLow: roundMoney(number(row.lowest_with_shipping)),
    trendPct: priceChange,
    productUrl: buildProductUrl(row.tcgplayer_id, name)
  };
}

function extractArray(data) { if (Array.isArray(data)) return data; if (Array.isArray(data.data)) return data.data; if (Array.isArray(data.results)) return data.results; if (Array.isArray(data.cards)) return data.cards; return []; }
function buildProductUrl(tcgplayerId, name) { if (tcgplayerId) return `https://www.tcgplayer.com/product/${tcgplayerId}`; return `https://www.tcgplayer.com/search/magic/product?productLineName=magic&q=${encodeURIComponent(name || "")}&view=grid&utm_source=mtgmarketpulse&utm_medium=affiliate`; }
function number(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
function roundMoney(value) { const n = Number(value); return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0; }
function string(value) { return value == null ? "" : String(value); }
function titleCase(value) { if (!value) return value; const s = String(value).toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
