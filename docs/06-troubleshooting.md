# Troubleshooting

## Frontend says demo mode

The backend is probably using:

```bash
DATA_PROVIDER=sample
```

Change Railway variables to your desired provider.

## Frontend cannot reach backend

Check `frontend/config.js`:

```js
window.MTGMP_API_URL = "https://your-railway-service.up.railway.app";
```

Check Railway CORS:

```bash
CORS_ORIGIN=https://your-github-username.github.io
```

For testing only:

```bash
CORS_ORIGIN=*
```

## TCGplayer token failure

Check:

```bash
TCGPLAYER_PUBLIC_KEY
TCGPLAYER_PRIVATE_KEY
```

Make sure there are no extra spaces.

## Store top-sales failure

The documented top-sales endpoint is store scoped. You may need:

```bash
TCGPLAYER_ACCESS_TOKEN
TCGPLAYER_STORE_KEY
```

Use `/api/status` to confirm the backend sees the variables.

## App is slow on mobile

Reduce default render count in `frontend/index.html`:

```js
let renderLimit = 75;
```

The app can search and filter all 1000 cards while only animating part of the dataset.
