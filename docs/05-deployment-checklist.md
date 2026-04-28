# Deployment Checklist

## Before GitHub

- [ ] Create new repo.
- [ ] Upload this project.
- [ ] Do not commit `.env`.
- [ ] Commit `.env.example`.

## Before Railway

- [ ] Create Railway project.
- [ ] Connect GitHub repo.
- [ ] Set root directory to `backend`.
- [ ] Add environment variables.
- [ ] Deploy.
- [ ] Test `/health`.
- [ ] Test `/api/status`.
- [ ] Test `/api/top-sales?period=30d&limit=1000`.

## Before GitHub Pages

- [ ] Copy Railway URL.
- [ ] Edit `frontend/config.js`.
- [ ] Set `window.MTGMP_API_URL`.
- [ ] Enable GitHub Pages.
- [ ] Open the live frontend.
- [ ] Confirm cards load.
- [ ] Confirm search works.
- [ ] Confirm TCGPlayer links work.

## Launch sanity check

- [ ] Mobile view works.
- [ ] Desktop view works.
- [ ] Bubble render slider works.
- [ ] Filters work.
- [ ] Card detail panel works.
- [ ] CORS is not blocking requests.
