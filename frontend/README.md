# MTG Top 100 Live — Complete Frontend Replacement

This folder is a safe full replacement for your current `frontend/` folder.

## Files included

```text
index.html
404.html
config.js
config.example.js
preview.svg
robots.txt
site.webmanifest
README.md
```

## What is already built in

- MTG Top 100 Live branding
- Live Railway backend connection through `config.js`
- `tcgapi.dev`-style market-mover presentation
- Weighted Move as the default bubble-size metric
- Dollar Change metric option
- Raw Trend % metric option
- Screen-aware bubble sizes
- Slower physics as more bubbles appear
- 75 bubbles default render count
- 100 bubbles maximum render count
- Card detail rows for previous price, dollar change, and weighted score
- GitHub Pages friendly `404.html`

## Before committing

Open:

```text
frontend/config.js
```

Confirm this line points to your Railway backend:

```js
window.MTGMP_API_URL = "https://mtg-market-pulse-api-production.up.railway.app";
```

If your Railway URL is different, replace it.

Do not put your `TCGAPI_DEV_KEY` in any frontend file.

## How to replace the frontend folder

1. In GitHub, delete the existing `frontend/` files or overwrite them.
2. Upload all files from this replacement `frontend/` folder.
3. Commit to `main`.
4. Wait for GitHub Pages workflow to finish.
5. Hard refresh your live site.

## Hard refresh

Windows:

```text
Ctrl + F5
```

Mac:

```text
Cmd + Shift + R
```

## Verify

Open the browser console or network tab if needed and confirm the app calls:

```text
/api/top-sales?period=30d&limit=100
```

The API response should include:

```text
weightedMoveScore
dollarChange
previousPrice
imageUrl
name
set
typeLine
```
