# TCGplayer Live Data Integration

## What the backend supports

The backend supports four providers:

```bash
DATA_PROVIDER=sample
DATA_PROVIDER=file
DATA_PROVIDER=remote
DATA_PROVIDER=tcgplayer-store-sales
```

## TCGplayer keys

The official TCGplayer API uses:

```bash
TCGPLAYER_PUBLIC_KEY
TCGPLAYER_PRIVATE_KEY
```

The backend exchanges those for a bearer token with:

```text
POST https://api.tcgplayer.com/token
```

Some store endpoints also use:

```bash
TCGPLAYER_ACCESS_TOKEN
```

This is added as:

```text
X-Tcg-Access-Token
```

## Store top-sales mode

Use:

```bash
DATA_PROVIDER=tcgplayer-store-sales
```

The backend calls the documented store top-sales endpoint:

```text
POST /stores/{storeKey}/inventory/topsalessearch
```

That endpoint is store-inventory scoped. It is useful if your goal is your own seller/store sales data.

## Marketplace-wide top 1000

If TCGplayer gives you an approved marketplace-wide top-sales feed or special endpoint, use either:

```bash
TCGPLAYER_MARKETPLACE_TOP_SALES_URL=https://approved-feed-url
```

or:

```bash
DATA_PROVIDER=remote
DATA_SOURCE_URL=https://approved-feed-url
```

The response can be either:

```json
{
  "cards": []
}
```

or:

```json
[]
```

## Expected card shape

```json
{
  "rank": 1,
  "tcgplayerId": 12345,
  "name": "Sol Ring",
  "set": "CMM",
  "setName": "Commander Masters",
  "rarity": "Uncommon",
  "colors": ["C"],
  "formats": ["Commander"],
  "typeLine": "Artifact",
  "imageUrl": "https://...",
  "totalSales": 123456.78,
  "copiesSold": 4567,
  "marketPrice": 1.29,
  "lowPrice": 1.00,
  "midPrice": 1.40,
  "highPrice": 2.00,
  "directLow": 1.25,
  "trendPct": 8.7,
  "productUrl": "https://www.tcgplayer.com/product/12345"
}
```

## Key safety rule

Never expose these in the frontend:

```bash
TCGPLAYER_PUBLIC_KEY
TCGPLAYER_PRIVATE_KEY
TCGPLAYER_ACCESS_TOKEN
```

Only Railway should hold them.
