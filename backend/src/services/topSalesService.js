import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { sampleTopSales } from "../data/sampleTopSales.js";
import { fetchTcgStoreTopSales } from "./tcgplayerService.js";
import { fetchTcgApiDevTopLive } from "./tcgapiDevService.js";
import { clearTcgAuthCache } from "./tcgAuthService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cache = {
  key: null,
  expiresAt: 0,
  cards: null
};

export async function getTopSales({ period = "30d", limit = 1000 } = {}) {
  const provider = process.env.DATA_PROVIDER || "sample";
  const key = `${provider}:${period}:${limit}`;
  const now = Date.now();

  if (cache.key === key && cache.cards && cache.expiresAt > now) {
    return cache.cards.slice(0, limit);
  }

  const raw = await loadRawCards({ period, limit, provider });
  const normalized = raw
    .map((card, index) => normalizeCard(card, index))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);

  cache = {
    key,
    expiresAt: now + Number(process.env.CACHE_TTL_MS || 1800000),
    cards: normalized
  };

  return normalized;
}

export async function getCardById(id, { period = "30d" } = {}) {
  const cards = await getTopSales({ period, limit: 1000 });
  return cards.find((card) => String(card.id) === String(id) || String(card.tcgplayerId) === String(id));
}

export async function searchCards(q, { period = "30d", limit = 25 } = {}) {
  const query = String(q || "").toLowerCase();
  const cards = await getTopSales({ period, limit: 1000 });

  if (!query) return cards.slice(0, limit);

  return cards
    .filter((card) => {
      const haystack = [
        card.name,
        card.set,
        card.setName,
        card.rarity,
        card.typeLine,
        ...(card.formats || [])
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    })
    .slice(0, limit);
}

export function clearCache() {
  cache = { key: null, expiresAt: 0, cards: null };
  clearTcgAuthCache();
}

export async function getProviderStatus() {
  const provider = process.env.DATA_PROVIDER || "sample";
  return {
    ok: true,
    provider,
    cache: {
      active: Boolean(cache.cards),
      key: cache.key,
      expiresAt: cache.expiresAt ? new Date(cache.expiresAt).toISOString() : null
    },
    tcgplayer: {
      hasPublicKey: Boolean(process.env.TCGPLAYER_PUBLIC_KEY),
      hasPrivateKey: Boolean(process.env.TCGPLAYER_PRIVATE_KEY),
      hasAccessToken: Boolean(process.env.TCGPLAYER_ACCESS_TOKEN),
      hasStoreKey: Boolean(process.env.TCGPLAYER_STORE_KEY),
      hasMarketplaceFeed: Boolean(process.env.TCGPLAYER_MARKETPLACE_TOP_SALES_URL)
    },
    tcgapiDev: {
      hasKey: Boolean(process.env.TCGAPI_DEV_KEY),
      base: process.env.TCGAPI_DEV_BASE || "https://api.tcgapi.dev"
    }
  };
}

async function loadRawCards({ period, limit, provider }) {
  switch (provider) {
    case "tcgplayer-store-sales":
      return fetchTcgStoreTopSales({ period, limit });

    case "tcgapi-dev":
      return fetchTcgApiDevTopLive({ period, limit: Math.min(limit, 100) });

    case "remote":
      return loadFromRemote(process.env.DATA_SOURCE_URL, { period, limit });

    case "file":
      return loadFromFile(process.env.DATA_FILE_PATH);

    case "sample":
    default:
      return sampleTopSales;
  }
}

async function loadFromRemote(url, { period, limit }) {
  if (!url) throw new Error("DATA_PROVIDER=remote requires DATA_SOURCE_URL.");

  const separator = url.includes("?") ? "&" : "?";
  const finalUrl = `${url}${separator}period=${encodeURIComponent(period)}&limit=${limit}`;

  const response = await fetch(finalUrl, {
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) {
    throw new Error(`DATA_SOURCE_URL failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  return extractArray(data);
}

async function loadFromFile(filePath) {
  if (!filePath) throw new Error("DATA_PROVIDER=file requires DATA_FILE_PATH.");

  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(__dirname, "../../", filePath);

  const content = await fs.readFile(resolved, "utf8");
  return extractArray(JSON.parse(content));
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.cards)) return data.cards;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function normalizeCard(card, index) {
  const marketPrice = number(card.marketPrice ?? card.price ?? card.tcgMarketPrice);
  const copiesSold = number(card.copiesSold ?? card.salesCount ?? card.quantitySold);
  const totalSales = number(card.totalSales ?? card.salesUsd ?? (marketPrice * copiesSold));
  const rank = number(card.rank ?? index + 1);
  const set = string(card.set ?? card.setCode).toUpperCase();
  const tcgplayerId = card.tcgplayerId ?? card.productId ?? null;
  const id = string(card.id ?? tcgplayerId ?? `${card.name || "card"}-${set}-${rank}`);

  return {
    id,
    rank,
    tcgplayerId,
    name: string(card.name || "Unknown Card"),
    set,
    setName: string(card.setName ?? card.groupName ?? set),
    rarity: titleCase(string(card.rarity || "Unknown")),
    colors: Array.isArray(card.colors)
      ? card.colors
      : Array.isArray(card.colorIdentity)
        ? card.colorIdentity
        : ["C"],
    formats: Array.isArray(card.formats) ? card.formats : [],
    typeLine: string(card.typeLine ?? card.type ?? ""),
    imageUrl: string(card.imageUrl ?? card.image ?? card.image_uris?.normal ?? ""),
    totalSales: roundMoney(totalSales),
    copiesSold,
    marketPrice: roundMoney(marketPrice),
    lowPrice: roundMoney(card.lowPrice ?? card.tcgLowPrice),
    midPrice: roundMoney(card.midPrice),
    highPrice: roundMoney(card.highPrice),
    directLow: roundMoney(card.directLow ?? card.directLowPrice),
    trendPct: number(card.trendPct ?? card.pct ?? card.changePct),
    productUrl: string(card.productUrl ?? card.tcgplayerUrl ?? (tcgplayerId ? `https://www.tcgplayer.com/product/${tcgplayerId}` : `https://www.tcgplayer.com/search/magic/product?productLineName=magic&q=${encodeURIComponent(card.name || "")}&view=grid&utm_source=mtgmarketpulse&utm_medium=affiliate`))
  };
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
  if (!value) return value;
  const s = String(value).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
