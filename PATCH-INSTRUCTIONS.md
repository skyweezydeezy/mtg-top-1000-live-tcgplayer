# MTG Top 100 Live — tcgapi.dev Patch

Copy these files into the same paths in your GitHub repo:

```text
frontend/index.html
backend/src/server.js
backend/src/services/topSalesService.js
backend/src/services/tcgapiDevService.js
```

Optional reference file:

```text
backend/.env.tcgapi-dev.example
```

Railway variables after copying the files:

```bash
DATA_PROVIDER=tcgapi-dev
TCGAPI_DEV_KEY=your_key_already_added
TCGAPI_DEV_BASE=https://api.tcgapi.dev
```

Test after Railway redeploys:

```text
/api/status
/api/top-sales?period=30d&limit=100
```

Expected status contains:

```json
"provider": "tcgapi-dev",
"tcgapiDev": { "hasKey": true }
```
