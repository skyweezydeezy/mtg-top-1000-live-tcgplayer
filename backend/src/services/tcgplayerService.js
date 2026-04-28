import { getTcgBearerToken } from "./tcgAuthService.js";

let storeKeyCache = null;

export async function fetchTcgStoreTopSales({ period = "30d", limit = 1000 } = {}) {
  /*
    Officially documented TCGplayer top-sales endpoint is store inventory scoped:
      POST /stores/{storeKey}/inventory/topsalessearch

    It is not the same as marketplace-wide all-seller top 1000 sales data.
    If TCGplayer gives you an approved marketplace-wide endpoint/report, use:
      TCGPLAYER_MARKETPLACE_TOP_SALES_URL
    or DATA_PROVIDER=remote with DATA_SOURCE_URL.
  */

  if (process.env.TCGPLAYER_MARKETPLACE_TOP_SALES_URL) {
    return fetchMarketplaceTopSales({ period, limit });
  }

  const storeKey = await getStoreKey();
  const pageSize = 100;
  const out = [];

  for (let offset = 0; offset < limit; offset += pageSize) {
    const batchLimit = Math.min(pageSize, limit - offset);
    const data = await tcgRequest(`/stores/${storeKey}/inventory/topsalessearch?includeGeneric=true&includeCustom=true&offset=${offset}&limit=${batchLimit}`, {
      method: "POST",
      body: JSON.stringify({
        categories: [
          {
            categoryId: Number(process.env.TCGPLAYER_CATEGORY_ID || 1),
            name: process.env.TCGPLAYER_CATEGORY_NAME || "Magic"
          }
        ]
      })
    });

    const rows = extractArray(data);
    if (!rows.length) break;

    out.push(...rows);

    if (rows.length < batchLimit) break;
  }

  const normalized = out.slice(0, limit).map((row, index) => normalizeTcgTopSaleRow(row, index));
  await enrichPrices(normalized);
  return normalized;
}

export async function fetchTcgProductPrices(productIds) {
  const uniqueIds = [...new Set(productIds.map(Number).filter(Boolean))];
  const chunks = [];

  for (let i = 0; i < uniqueIds.length; i += 100) {
    chunks.push(uniqueIds.slice(i, i + 100));
  }

  const prices = new Map();

  for (const chunk of chunks) {
    const data = await tcgRequest(`/pricing/product/${chunk.join(",")}`, {
      method: "GET"
    });

    const results = data.results || data.data || [];
    for (const price of results) {
      const productId = Number(price.productId);
      const subType = String(price.subTypeName || "").toLowerCase();

      // Prefer Normal pricing if multiple subtype rows exist.
      if (!prices.has(productId) || subType === "normal") {
        prices.set(productId, {
          lowPrice: number(price.lowPrice),
          midPrice: number(price.midPrice),
          highPrice: number(price.highPrice),
          marketPrice: number(price.marketPrice),
          directLow: number(price.directLowPrice)
        });
      }
    }
  }

  return prices;
}

export async function getStoreKey() {
  if (process.env.TCGPLAYER_STORE_KEY) return process.env.TCGPLAYER_STORE_KEY;
  if (storeKeyCache) return storeKeyCache;

  if (!process.env.TCGPLAYER_ACCESS_TOKEN) {
    throw new Error("TCGplayer store top-sales requires TCGPLAYER_ACCESS_TOKEN or TCGPLAYER_STORE_KEY.");
  }

  const data = await tcgRequest("/stores/self", { method: "GET" });
  const store = data.result || data.results?.[0] || data.store || data;

  const key = store.sellerKey || store.storeKey || store.key || store.SellerKey || store.DisplayName;
  if (!key) {
    throw new Error("Could not determine TCGplayer store key from /stores/self.");
  }

  storeKeyCache = key;
  return key;
}

async function fetchMarketplaceTopSales({ period, limit }) {
  const base = process.env.TCGPLAYER_MARKETPLACE_TOP_SALES_URL;
  const separator = base.includes("?") ? "&" : "?";
  const url = `${base}${separator}period=${encodeURIComponent(period)}&limit=${limit}`;
  const data = await tcgRequestAbsolute(url, { method: "GET" });
  return extractArray(data).slice(0, limit).map((row, index) => normalizeTcgTopSaleRow(row, index));
}

async function enrichPrices(cards) {
  const productIds = cards.map((card) => card.tcgplayerId).filter(Boolean);
  if (!productIds.length) return cards;

  const priceMap = await fetchTcgProductPrices(productIds);

  for (const card of cards) {
    const prices = priceMap.get(Number(card.tcgplayerId));
    if (!prices) continue;

    card.lowPrice = prices.lowPrice;
    card.midPrice = prices.midPrice;
    card.highPrice = prices.highPrice;
    card.directLow = prices.directLow;
    if (!card.marketPrice && prices.marketPrice) card.marketPrice = prices.marketPrice;
    if (!card.totalSales && card.marketPrice && card.copiesSold) {
      card.totalSales = roundMoney(card.marketPrice * card.copiesSold);
    }
  }

  return cards;
}

async function tcgRequest(endpoint, options = {}) {
  const apiBase = process.env.TCGPLAYER_API_BASE || "https://api.tcgplayer.com";
  return tcgRequestAbsolute(`${apiBase}${endpoint}`, options);
}

async function tcgRequestAbsolute(url, options = {}) {
  const bearer = await getTcgBearerToken();

  const headers = {
    "Accept": "application/json",
    "Authorization": `bearer ${bearer}`,
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  if (process.env.TCGPLAYER_ACCESS_TOKEN) {
    headers["X-Tcg-Access-Token"] = process.env.TCGPLAYER_ACCESS_TOKEN;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TCGplayer request failed: HTTP ${response.status} ${url} ${text}`);
  }

  return response.json();
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.cards)) return data.cards;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.products)) return data.products;
  return [];
}

function normalizeTcgTopSaleRow(row, index) {
  const productId = first(row, [
    "productId",
    "ProductId",
    "tcgplayerId",
    "product.productId",
    "product.id",
    "listing.productId"
  ]);

  const name = first(row, [
    "productName",
    "ProductName",
    "name",
    "product.name",
    "product.productName",
    "title"
  ]) || "Unknown Card";

  const setName = first(row, [
    "groupName",
    "setName",
    "GroupName",
    "product.groupName",
    "product.setName"
  ]);

  const set = first(row, [
    "set",
    "setCode",
    "abbreviation",
    "product.abbreviation",
    "product.setCode"
  ]);

  const copiesSold = number(first(row, [
    "copiesSold",
    "quantitySold",
    "soldQuantity",
    "totalQuantitySold",
    "salesCount",
    "unitsSold"
  ]));

  const marketPrice = number(first(row, [
    "marketPrice",
    "price",
    "listingPrice",
    "lowestListingPrice"
  ]));

  const totalSales = number(first(row, [
    "totalSales",
    "salesAmount",
    "totalRevenue",
    "grossSales"
  ])) || roundMoney(marketPrice * copiesSold);

  return {
    id: String(productId || `${name}-${set || setName || "tcg"}-${index + 1}`),
    rank: number(first(row, ["rank", "Rank"])) || index + 1,
    tcgplayerId: productId ? Number(productId) : null,
    name: String(name),
    set: String(set || "").toUpperCase(),
    setName: String(setName || set || ""),
    rarity: titleCase(String(first(row, ["rarity", "product.rarityName", "rarityName"]) || "Unknown")),
    colors: normalizeColors(first(row, ["colors", "colorIdentity", "product.colors", "product.colorIdentity"])),
    formats: normalizeFormats(first(row, ["formats", "legalities", "product.formats"])),
    typeLine: String(first(row, ["typeLine", "productTypeName", "product.typeLine", "type"]) || ""),
    imageUrl: String(first(row, ["imageUrl", "image", "product.imageUrl", "product.image"]) || ""),
    totalSales,
    copiesSold,
    marketPrice,
    lowPrice: number(first(row, ["lowPrice"])),
    midPrice: number(first(row, ["midPrice"])),
    highPrice: number(first(row, ["highPrice"])),
    directLow: number(first(row, ["directLow", "directLowPrice"])),
    trendPct: number(first(row, ["trendPct", "changePct", "pct"])),
    productUrl: String(first(row, ["productUrl", "tcgplayerUrl", "url"]) || buildProductUrl(productId, name))
  };
}

function first(obj, paths) {
  for (const p of paths) {
    const value = get(obj, p);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function get(obj, path) {
  return String(path).split(".").reduce((acc, key) => acc == null ? undefined : acc[key], obj);
}

function normalizeColors(value) {
  if (Array.isArray(value) && value.length) return value;
  if (typeof value === "string" && value.trim()) {
    const parts = value.split(/[,\s/]+/).map((x) => x.trim().toUpperCase()).filter(Boolean);
    return parts.length ? parts : ["C"];
  }
  return ["C"];
}

function normalizeFormats(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return value.split(/[,\|/]+/).map((x) => x.trim()).filter(Boolean);
  return [];
}

function buildProductUrl(productId, name) {
  if (productId) return `https://www.tcgplayer.com/product/${productId}`;
  return `https://www.tcgplayer.com/search/magic/product?productLineName=magic&q=${encodeURIComponent(name || "")}&view=grid&utm_source=mtgmarketpulse&utm_medium=affiliate`;
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function titleCase(value) {
  const s = String(value || "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}
