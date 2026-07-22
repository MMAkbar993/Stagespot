# StageSpot

**Get Your First Stage** — a hyperlocal web platform connecting first-time and hobbyist performers with cafes and restaurants hosting open mic nights, launching in the Delhi region.

## Features

- Email/password auth (Supabase Auth) with email verification and password reset
- Role-based onboarding for performers and venues, with an admin verification queue (approve/reject with a required reason)
- Home feed and Explore grid (Performers/Gigs toggle) with category, locality, and sort filters
- Gig posting with server-side geocoding (OpenStreetMap Nominatim) for area-based filtering, plus close/reopen management
- Full booking lifecycle — `requested → accepted → confirmed → completed`, with `declined`/`cancelled` — enforced at the database level via a Postgres trigger, not just app code
- Contact info and exact address revealed only once a booking is confirmed
- Star ratings, written reviews, reputation tags, and "already worked with" indicators
- AI-assisted search: describe a vibe in plain text, get suggested tags and matching performers (Claude API)
- Admin dashboard: verification queue plus a global view of all gigs, bookings, and reviews
- Profile picture upload (Supabase Storage); all other media (portfolio, venue photos, proof links) captured as links per the project spec
- Fully responsive, mobile-first design matching the provided wireframes and color palette

## Prerequisites

- Node.js 20+
- A Supabase project (free tier is sufficient)
- A Gemini API key, for the AI-assisted search feature ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

## Installation and Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then apply the schema. In the Supabase Dashboard's SQL Editor, run the files in `supabase/migrations/` **in order** (0001 through 0006) — paste each file's contents and click Run before moving to the next.

3. **Configure environment variables.** Copy `.env.example` to `.env` and fill in the values (see below).

4. **(Optional) Seed sample venues.** `supabase/seed/venues.json` contains real, researched Delhi venues (Section 9 of the project spec — hand-entered, not pulled automatically). To load them:

   ```bash
   npm run seed:venues
   ```

   This creates a venue account for each entry and geocodes its address, skipping any venue that's already been seeded (safe to re-run).

5. **Run the app locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for the full list with inline comments. Summary:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API Keys → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same page → publishable key (safe for the browser, respects Row Level Security) |
| `SUPABASE_SECRET_KEY` | Same page → secret key (server-only — bypasses RLS, never expose to the client) |
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — powers AI-assisted search |
| `NEXT_PUBLIC_SITE_URL` | Base URL of the deployed app (defaults to `http://localhost:3000` for local dev) |

## Folder and Project Structure

```
src/
  app/                     Next.js App Router — one folder per route (see Page and Route Summary below)
    api/                   Route handlers: venue profile save (+ geocoding), booking transitions,
                            admin verification actions, AI search
    auth/callback/         Handles Supabase email confirmation + password-reset redirect links
  components/
    ui/                    Design-system primitives (Button, Field, Badge, cards, segmented control, ...)
    layout/                AppShell (responsive nav), AuthShell
    forms/                 Performer/venue profile forms, gig posting, profile picture upload
    bookings/, gigs/       Booking lifecycle actions, feedback form, gig owner controls
    discovery/, admin/     Home/Explore feeds, admin dashboard tabs
    marketing/             Landing page sections
  lib/
    supabase/              Browser / server / admin (service-role) Supabase clients, session refresh
    auth/guards.ts         Server-side auth/role/onboarding guards used by every protected page
    data/                  Server-side data-fetching helpers (discovery, bookings, admin)
    geocode.ts             Nominatim geocoding with a progressive-fallback query strategy
    types.ts               Shared TypeScript types matching the database schema
supabase/
  migrations/               Schema, RLS policies, and a booking-lifecycle trigger — run in order
  seed/venues.json          Real Delhi venue data (Section 9)
scripts/seed-venues.mjs     Loads supabase/seed/venues.json into a fresh project
public/assets/              Provided logo, color palette, wireframes, seed spreadsheet
```

## Page and Route Summary

Matches Section 6 of the project spec:

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Login + forgot password |
| `/signup` | Sign up + role selection |
| `/verify-email` | Email verification pending |
| `/onboarding/performer`, `/onboarding/venue` | Profile setup |
| `/home` | Home feed (Performers/Gigs toggle) |
| `/explore` | Explore grid (filters + Performers/Gigs toggle) |
| `/performers/[id]` | Performer public profile |
| `/venues/[id]` | Venue public profile |
| `/gigs/[id]` | Gig detail (Request/Invite action) |
| `/gigs/new` | Post a gig (verified venues only) |
| `/bookings` | My Bookings status tracker |
| `/bookings/[id]` | Booking detail / confirmation |
| `/bookings/[id]/feedback` | Feedback & rating form |
| `/profile/edit` | Edit own profile |
| `/admin` | Admin dashboard |
| `/terms` | Terms and Conditions |
| `/auth/reset-password` | Set a new password (reached via the emailed reset link) |

## Test Login Credentials

Password for all three: `StageSpotDemo123!`

| Role | Email | Notes |
|---|---|---|
| Performer | `demo-performer@stagespot.app` | Pre-approved, ready to browse/apply to gigs |
| Venue | `demo-venue@stagespot.app` | Pre-approved ("Demo Cafe" in Connaught Place), ready to post gigs |
| Admin | `demo-admin@stagespot.app` | Full admin dashboard access |

To promote any other account to admin, run in the Supabase SQL Editor (regular users cannot do this themselves — see `supabase/migrations/0003_security_and_venue_field.sql`):

```sql
update profiles set role = 'admin' where email = 'the-account@example.com';
```

## Known Limitations and Suggested Next Steps

- **Automatic booking completion is lazy, not scheduled.** There's no cron/edge job; a confirmed booking flips to `completed` the next time either party visits `/bookings` or the booking detail page after the scheduled date passes. A Vercel Cron job hitting a small `/api/cron/complete-bookings` route would make this fully automatic.
- **Contact info revealed at confirmation is the account email**, not a phone number — the wireframe mockup shows a phone number, but no phone field exists in the PRD's required field list (Section 5.2), so this was a deliberate scope call rather than an oversight.
- **Profile editing supports one portfolio link, one social link, and up to three venue photos** — matching the wireframe forms exactly. Supporting arbitrarily many of each is straightforward to add if needed.
- **No in-app messaging** — explicitly out of scope per Section 12.
- **A closed gig becomes invisible to non-owners**, including a performer with an existing booking against it (RLS hides `status: closed` gigs from anyone but the owner/admin). The booking itself is unaffected; only the gig's own detail fields (like time window) may not re-render on an old booking's page.
- **Hosting**: the app has been run and verified locally throughout the build; it has not yet been deployed to Vercel. Section 10 expects hosting to be created and owned independently — connect this repository in the Vercel dashboard and add the same environment variables from `.env`.
- **Geocoding** uses free OpenStreetMap Nominatim with a progressive-fallback query (full address → drop the leading segment → repeat) since informal Indian addresses with landmark references often don't resolve as a single string. It's usually accurate to the locality level, occasionally to the exact address.
