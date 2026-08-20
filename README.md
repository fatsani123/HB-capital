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

## Client accounts, enrollments & admin approval

This site includes a full client management system built on Supabase:

- **`supabase/schema.sql`** — run this once in your Supabase project's SQL Editor. It creates:
  - `profiles` — auto-created for every signed-up user
  - `clusters` — the 9 fixed clusters (seeded automatically)
  - `enrollments` — one row per client's program signup, with `status`: `pending` → `active` → `expired`/`cancelled`
  - `client_clusters` — per-client progress through each cluster: `locked` → `pending_payment` → `submitted` → `approved` → `completed`
  - Three database functions that are the *only* way anything gets approved: `admin_approve_enrollment`, `admin_approve_cluster`, `admin_complete_cluster`. Each checks the caller's email is `fatsaninkhono01@gmail.com` before doing anything — enforced in the database itself, not just hidden in the UI.

- **`js/supabase-config.js`** — put your Supabase project URL and anon/public key here (see comments in the file for exactly where to find them).

- **Pages:**
  - `index.html` — the registration form now creates a real account (name, phone, email, password, plan, payment method) and signs the person straight into `dashboard.html`.
  - `login.html` — sign in for returning clients and the admin.
  - `dashboard.html` — a client's view: current plan, expiry date, cluster-by-cluster progress with a "Submit Payment" button on whichever cluster is next, and a link to the HB Macro Intelligence dashboard that only activates once their enrollment is `active`.
  - `admin.html` — visible only to `fatsaninkhono01@gmail.com`. Lists every enrollment, lets you **Approve** a pending signup (which sets an expiry date and unlocks their first cluster or, for Full Program, all 9 at once), and lets you approve each cluster payment as clients submit them — approving one automatically unlocks the next.

### One-time setup checklist
1. Run `supabase/schema.sql` in Supabase's SQL Editor.
2. Fill in `js/supabase-config.js` with your project URL and anon key.
3. In Supabase Auth settings, decide whether email confirmation is required for new sign-ups — the site handles both cases, but it's worth checking it matches what you want.
4. Sign up once yourself using `fatsaninkhono01@gmail.com` to create the admin account — the admin dashboard is gated by that exact email.
