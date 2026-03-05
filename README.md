# ProjectGeniusNXT (bfjia.net)

Repo for the published bfjia.net website.

---

## How deployment works (Cloudflare Workers)

The site is deployed as a **single Cloudflare Worker** that does two things:

1. **Serves the static site** — `index.html`, `assets/`, `img/`, `images/` at `/` and under.
2. **Proxies the Reddit API** — `GET /api/reddit` returns JSON from Reddit’s EarthPorn API so the home page can show a random background image **without CORS or corsproxy.io**.

### Architecture

```
                    Request
                       │
                       ▼
              ┌────────────────────┐
              │  Cloudflare Worker │
              │  (projectgeniusnxt) │
              └─────────┬──────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    path === /api/reddit           everything else
         │                             │
         ▼                             ▼
  ┌─────────────┐              ┌─────────────┐
  │ Reddit API  │              │   ASSETS    │
  │ (server-side│              │ (static site│
  │  fetch)     │              │  from KV)   │
  └─────────────┘              └─────────────┘
         │                             │
         ▼                             ▼
  JSON response              index.html, CSS,
  to browser                 JS, images, etc.
```

- **Worker runs first** on every request (`run_worker_first = true` in `wrangler.toml`).
- **`/api/reddit`** → Worker fetches `https://www.reddit.com/r/EarthPorn/top/.json?sort=top&t=week` on the server and returns the JSON. No browser CORS.
- **All other paths** → Worker forwards the request to the **ASSETS** binding, which serves files from the uploaded static directory (e.g. `/` → `index.html`, `/assets/css/main.css`, `/img/...`, `/images/...`).

### Config files

| File | Role |
|------|------|
| **`wrangler.toml`** | Worker name, entry script (`worker/index.js`), and `[assets]`: directory `"."`, binding `ASSETS`, `run_worker_first = true`. |
| **`worker/index.js`** | Request handler: `/api/reddit` → Reddit proxy; else → `env.ASSETS.fetch(request)`. |
| **`.assetsignore`** | Excludes from upload: `worker/`, `wrangler.toml`, `orig/`, other HTML, PDFs, etc. Only what the home page needs is deployed. |

### Deploy

From the project root:

```bash
npx wrangler deploy
```

- **Wrangler** uploads the Worker script and the static assets (respecting `.assetsignore`).
- The live app is at: `https://projectgeniusnxt.<your-account-subdomain>.workers.dev/`.

### Serve locally

From the project root:

```bash
npx wrangler dev
```

- Starts the Worker and serves static assets on **http://localhost:8787** (same behavior as production: `/api/reddit` goes to the worker, everything else to assets).
- Uses the same `.assetsignore`, so `profile.html`, `files/`, etc. are not served. To test the profile page and `files/project.tsv` locally, temporarily remove `profile.html` and `files/` from `.assetsignore`, or run a separate static server (e.g. `npx serve .`) and open `http://localhost:3000/profile.html` when working on that page.

### Custom domain (e.g. bfjia.net)

1. In **Cloudflare Dashboard** → your zone (e.g. `bfjia.net`) → **Workers Routes**.
2. **Add route**: Route `*bfjia.net/*` (or `bfjia.net/*`) → Worker **projectgeniusnxt**.
3. The same Worker then serves the site and `/api/reddit` on your domain; `index.html`’s `fetch('/api/reddit')` stays same-origin.

### What gets deployed

- **Included (static assets):** `index.html`, `assets/`, `img/`, `images/` (and anything not in `.assetsignore`).
- **Excluded (via `.assetsignore`):** `worker/` source, `wrangler.toml`, `orig/`, other HTML pages, `presentations/`, `projects/`, `files/`, etc.

The home page uses only the Reddit proxy; other pages (e.g. profile, presentations) are not part of this Worker deployment.
