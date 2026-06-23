# Antara — Yoga Studio Website

A single-page static site for an individual yoga studio, with a no-code `/admin` editor so a
non-technical owner can edit content, toggle whole panels on/off, upload photos, and publish —
without touching code or files. Minimal, calm, editorial.

## Audience & tone
Affluent Delhi / Meerut. Quiet luxury: restrained palette, editorial serif type, generous
whitespace, one accent colour. No clipart, no clutter.

## How it works

- **`content.json`** holds all text, prices, photos and panel on/off switches. Single source of truth.
- **`app.js`** fetches `content.json` and builds the page, hiding any panel turned off in the
  `visibility` map.
- **`/admin`** is a password-gated, forms-based editor (`admin/`). It reads `content.json`, lets
  the owner edit everything, and on **Publish** sends the new content (plus any uploaded images)
  to `/api/publish`.
- **`/api/publish.js`** is a Vercel serverless function. It checks the admin password, then
  commits `content.json` and any new images back to this GitHub repo in a **single commit**.
  Vercel auto-deploys the commit, so the live site updates in ~30 seconds.

```
index.html        page skeleton (don't edit)
styles.css        design layer (don't edit)
app.js            renders the page from content.json (don't edit)
content.json      ← all content + panel visibility (edited via /admin)
admin/            the /admin editor (index.html, admin.css, admin.js)
api/publish.js    serverless: verify password → commit to GitHub
assets/           images (assets/uploads/ holds owner-uploaded photos)
HELPER-GUIDE.md   plain-English manual for the owner
```

## Features
- No-code `/admin`: edit every field, toggle whole panels on/off, reorder items, upload photos
- WhatsApp booking on every CTA + a floating "Join us" button
- UPI pay buttons (per-plan, amount pre-filled) + a UPI ID block
- Responsive, fast, no build step, no client dependencies, no tracking
- Graceful fallbacks (broken images hide; off / empty panels disappear)
- Publishes commit to GitHub → Vercel auto-deploy, with full version history

## Configuration (Vercel environment variables)

Set these in the Vercel project (Settings → Environment Variables), then redeploy:

| Variable | Required | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | yes | The password the owner types at `/admin`. |
| `GITHUB_TOKEN` | yes | Fine-grained PAT, **Contents: Read and write**, scoped to **this repo only**. |
| `GITHUB_OWNER` | no | Defaults to `sushobhith`. |
| `GITHUB_REPO` | no | Defaults to `tulaa-yoga-studio`. |
| `GITHUB_BRANCH` | no | Defaults to `main`. |

The password and token live only as server-side env vars — never committed to this (public) repo.

## Run locally

Static side (no editor):
```
python3 -m http.server 8000   # open http://localhost:8000
```

Full stack including `/admin` and the publish function:
```
npm i -g vercel
vercel dev                    # serves /api/publish; reads env via `vercel env pull`
```

## Deploy
Connected to GitHub → Vercel. Any push to `main` (including publishes made from `/admin`)
auto-deploys to production.

## Before handing off to the owner
Replace placeholder content via `/admin`: studio name, WhatsApp number, UPI ID, address, copy,
and the photos. Then give the owner the `/admin` URL and the `ADMIN_PASSWORD`, and point them at
`HELPER-GUIDE.md`.
