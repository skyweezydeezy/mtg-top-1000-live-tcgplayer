# GitHub Setup

## Create the repository

1. Create a new GitHub repository.
2. Upload the full project folder.
3. Commit everything except `.env` files.

## Recommended repo name

```text
mtg-top-1000-live-tcgplayer
```

## GitHub Pages

You have two simple options.

### Option A — Manual Pages from frontend folder

1. Go to repository Settings.
2. Open Pages.
3. Set source to the branch you use, usually `main`.
4. If GitHub lets you select `/frontend`, use that.
5. If not, use the GitHub Actions workflow in this repo.

### Option B — GitHub Actions

The included workflow publishes `frontend/` to Pages.

Before enabling Pages, edit:

```text
frontend/config.js
```

and set:

```js
window.MTGMP_API_URL = "https://your-railway-service.up.railway.app";
```
