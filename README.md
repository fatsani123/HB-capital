# HB Capital — Trading Mentorship Program

A single-page marketing site for the HB Capital trading mentorship program, built with plain HTML/CSS/JS (no build step required).

## Structure

```
hb-capital-site/
├── index.html      # the entire site
└── README.md
```

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
npx serve .
```

## Deploy to Vercel

This is a static site, so Vercel needs no build command or framework preset — it will serve `index.html` as-is.

1. Push this folder to a GitHub repo (see commands below).
2. Go to https://vercel.com/new and import the repo.
3. Leave the "Framework Preset" as **Other**, build command empty, output directory empty.
4. Click **Deploy**.

Or deploy straight from the CLI:

```bash
npm i -g vercel
vercel
```

## Editing

All styles, copy, and pricing live directly in `index.html`. Update the `.level-price`, `.price-big`, and `.price-breakdown` sections to change pricing; cluster names live in the `.level-clusters` lists.
