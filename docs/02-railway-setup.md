# Railway Setup

## Create Railway project

1. Create a new Railway project.
2. Choose "Deploy from GitHub repo."
3. Select this repo.
4. Set the service root directory to:

```text
backend
```

5. Railway should detect Node automatically.

## Required environment variables

For demo mode:

```bash
DATA_PROVIDER=sample
CORS_ORIGIN=*
CACHE_TTL_MS=1800000
```

For live TCGplayer store top-sales mode:

```bash
DATA_PROVIDER=tcgplayer-store-sales
TCGPLAYER_PUBLIC_KEY=your_public_key
TCGPLAYER_PRIVATE_KEY=your_private_key
TCGPLAYER_ACCESS_TOKEN=your_store_access_token_if_needed
TCGPLAYER_STORE_KEY=your_store_key_if_known
CORS_ORIGIN=https://your-github-username.github.io
CACHE_TTL_MS=1800000
```

## Verify deployment

Open:

```text
https://your-railway-service.up.railway.app/health
```

Then:

```text
https://your-railway-service.up.railway.app/api/status
```

Then:

```text
https://your-railway-service.up.railway.app/api/top-sales?period=30d&limit=1000
```

## Connect frontend

Edit:

```text
frontend/config.js
```

Set:

```js
window.MTGMP_API_URL = "https://your-railway-service.up.railway.app";
```
