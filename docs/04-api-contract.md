# API Contract

## GET /api/top-sales

Request:

```text
GET /api/top-sales?period=30d&limit=1000
```

Response:

```json
{
  "period": "30d",
  "limit": 1000,
  "count": 1000,
  "updatedAt": "2026-04-27T18:00:00.000Z",
  "provider": "tcgplayer-store-sales",
  "cards": []
}
```

## GET /api/search

Request:

```text
GET /api/search?q=sol&limit=25
```

## GET /api/card/:id

Request:

```text
GET /api/card/12345
```

## GET /api/status

Shows provider and credential presence without exposing secrets.

## POST /api/admin/clear-cache

Optional. Set `ADMIN_TOKEN` in Railway, then call with:

```text
Authorization: Bearer your_admin_token
```
