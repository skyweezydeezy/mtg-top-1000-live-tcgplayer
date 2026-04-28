# MTG Top 1000 Live TCGplayer Dashboard

A full-stack Magic: The Gathering dashboard for Top 1000 sales data.

## What is included

- Static frontend for GitHub Pages
- Node/Express backend for Railway
- Live TCGplayer API credential handling
- Optional TCGplayer store top-sales ingestion
- Optional remote data-source adapter
- Sample data mode for local development
- Deployment docs

## Folder structure

```text
frontend/
  index.html
  config.js
backend/
  package.json
  railway.toml
  .env.example
  src/
    server.js
    services/
      topSalesService.js
      tcgAuthService.js
      tcgplayerService.js
    data/
docs/
```

## Local backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:3000/health
http://localhost:3000/api/top-sales?period=30d&limit=1000
```

## Local frontend

```bash
cd frontend
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Live TCGplayer mode

Set these Railway variables:

```bash
DATA_PROVIDER=tcgplayer-store-sales
TCGPLAYER_PUBLIC_KEY=your_public_key
TCGPLAYER_PRIVATE_KEY=your_private_key
TCGPLAYER_ACCESS_TOKEN=your_optional_store_access_token
TCGPLAYER_STORE_KEY=optional_store_key
CORS_ORIGIN=https://your-github-username.github.io
```

Important: the documented TCGplayer top-sales endpoint is store-inventory scoped. If TCGplayer gives you a marketplace-wide live sales feed, put that approved feed URL in:

```bash
TCGPLAYER_MARKETPLACE_TOP_SALES_URL=https://...
```

or use:

```bash
DATA_PROVIDER=remote
DATA_SOURCE_URL=https://...
```

## Security rule

Never put TCGplayer keys in the frontend. The frontend only calls your Railway backend.
