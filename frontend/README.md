# Frontend

Static GitHub Pages frontend for the MTG Top 1000 dashboard.

## Configure API URL

Edit `config.js`:

```js
window.MTGMP_API_URL = "https://your-railway-service.up.railway.app";
```

## Local preview

```bash
cd frontend
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Security

Do not place TCGplayer public/private keys in the frontend. This app is static and public. All TCGplayer credentials belong in Railway environment variables on the backend.
