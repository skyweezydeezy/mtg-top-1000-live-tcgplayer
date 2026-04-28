import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getTopSales,
  getCardById,
  searchCards,
  clearCache,
  getProviderStatus
} from "./services/topSalesService.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));

const corsOrigin = process.env.CORS_ORIGIN || "*";
const allowedOrigins = corsOrigin === "*"
  ? "*"
  : corsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/", (_req, res) => {
  res.json({
    name: "MTG Top 100 Live API",
    status: "ok",
    endpoints: {
      health: "/health",
      status: "/api/status",
      topSales: "/api/top-sales?period=30d&limit=100",
      search: "/api/search?q=sol&limit=25",
      card: "/api/card/:id"
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mtg-top-1000-live-tcgplayer",
    time: new Date().toISOString()
  });
});

app.get("/api/status", async (_req, res, next) => {
  try {
    res.json(await getProviderStatus());
  } catch (err) {
    next(err);
  }
});

app.get("/api/top-sales", async (req, res, next) => {
  try {
    const period = String(req.query.period || "30d").toLowerCase();
    const limit = clampInt(req.query.limit, 1, 100, 100);
    const cards = await getTopSales({ period, limit });

    res.json({
      period,
      limit,
      count: cards.length,
      updatedAt: new Date().toISOString(),
      provider: process.env.DATA_PROVIDER || "sample",
      cards
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/card/:id", async (req, res, next) => {
  try {
    const period = String(req.query.period || "30d").toLowerCase();
    const card = await getCardById(req.params.id, { period });

    if (!card) return res.status(404).json({ error: "Card not found" });
    res.json({ card });
  } catch (err) {
    next(err);
  }
});

app.get("/api/search", async (req, res, next) => {
  try {
    const period = String(req.query.period || "30d").toLowerCase();
    const q = String(req.query.q || "").trim();
    const limit = clampInt(req.query.limit, 1, 100, 25);
    const cards = await searchCards(q, { period, limit });

    res.json({
      q,
      period,
      count: cards.length,
      cards
    });
  } catch (err) {
    next(err);
  }
});

app.post("/api/admin/clear-cache", (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers.authorization !== `Bearer ${token}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  clearCache();
  res.json({ ok: true, message: "Cache cleared" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

app.use((err, _req, res, _next) => {
  console.error("[API ERROR]", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "production" ? "Unexpected server error" : err.message
  });
});

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

if (process.argv.includes("--check")) {
  console.log("Server file loaded successfully.");
  process.exit(0);
}

app.listen(PORT, () => {
  console.log(`MTG Top 1000 API listening on port ${PORT}`);
});
