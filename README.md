# Antara — Yoga Studio Website

A single-page static website for an individual yoga studio. Minimal, calm, editorial. Built to be handed off to a non-technical owner.

## Audience & tone
Affluent Delhi / Meerut. Quiet luxury: restrained palette, editorial serif type, generous whitespace, one accent colour. No clipart, no clutter.

## Project structure
```
index.html      page skeleton (don't edit)
styles.css      design layer (don't edit)
app.js          renders the page from content (don't edit)
content.js      ← all text, prices, photos live here (the only file the owner edits)
assets/         images (replace with real studio photos)
HELPER-GUIDE.md plain-English manual for the owner
```

## How it works
`content.js` defines a single `window.SITE` object. `app.js` reads it and builds every section. To change anything, the owner edits `content.js` only — never the HTML/CSS/JS.

## Features
- WhatsApp booking on every CTA + a floating "Join us" button
- UPI pay buttons (per-plan, amount pre-filled) + a UPI ID block
- Responsive, fast, no build step, no dependencies, no tracking
- Graceful fallbacks (broken images hide; missing map/UPI sections disappear)

## Run locally
Open `index.html` in a browser. (For correct module/asset behaviour you can also run any static server, e.g. `python3 -m http.server`.)

## Deploy (free)
Drag the project folder onto **Netlify** (app.netlify.com → Deploys). Updates = drag the folder again. See HELPER-GUIDE.md.

## To finalise before launch
Replace placeholders in `content.js` (studio name, WhatsApp, UPI ID, address, copy) and the photos in `assets/` with real ones.
