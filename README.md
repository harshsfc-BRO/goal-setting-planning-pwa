# Goal Setting & Planning PWA (for AADAT)

This repository contains the product and technical foundation for a standalone Goal Setting and Planning app that integrates with your AADAT web app.

## Product Intent

- Standalone PWA for desktop-first usage (Mac/desktop), with mobile support.
- Guided weekly coaching flow (especially Monday review sessions).
- Deep hierarchy for planning:
  - Yearly Goal
  - Monthly Goals
  - Weekly Goals
  - Baby Steps
- Linked habit execution via AADAT.
- Secure login and cloud backup/sync.

## Core Pages (MVP)

1. Index Dashboard
2. Goals Master List & Goal Tracker
3. Wheel of Life Activity
4. Monthly Goals & Review
5. Weekly Goals & Review
6. Habits (deep link to AADAT)

## Suggested Stack

- Frontend: Next.js (App Router) + TypeScript
- UI: Tailwind CSS + component library (shadcn/ui optional)
- Backend/Auth/DB: Supabase (Postgres + Auth + RLS)
- PWA: `next-pwa` + Web App Manifest + Service Worker
- Hosting: Vercel (frontend) + Supabase (backend)

Why this stack:
- Fastest path to production with auth + cloud sync.
- Good PWA support.
- Easy desktop/mobile responsive UX.

## Implemented Scaffold

- Next.js + TypeScript project structure
- Desktop-first layout with mobile support
- Core routes:
  - `/`
  - `/goals`
  - `/wheel`
  - `/monthly`
  - `/weekly`
  - `/habits`
  - `/login`
- Supabase client helper (`/lib/supabase/client.ts`)
- PWA support:
  - Web app manifest (`/app/manifest.ts`)
  - Offline fallback page (`/app/offline/page.tsx`)
  - App icons (`/public/icons/*`)
- Product/architecture/docs in `/docs`

## Setup

1. Install dependencies:
   - `npm install`
2. Create env file:
   - `cp .env.example .env.local`
3. Add Supabase values in `.env.local`.
4. Run SQL in Supabase SQL editor:
   - `docs/database-schema.sql`
   - `docs/supabase-rls-fix.sql` (required for profile insert on first login)
5. Run dev server:
   - `npm run dev`

## PWA Install (Desktop/Mobile)

1. Open the app in Chrome or Edge.
2. Use browser menu -> Install App (or Add to Home Screen on mobile).
3. For best install/offline validation, run production mode:
   - `npm run build`
   - `npm run start`

## Deliverables in `/docs`

- `docs/app-blueprint.md`: complete page map and interaction model
- `docs/database-schema.sql`: initial SQL schema for goals/planning/reviews
- `docs/supabase-rls-fix.sql`: one-time policy fix for profile creation
- `docs/build-plan.md`: 6-week implementation plan

## Next Step

Start from `docs/app-blueprint.md`, confirm any naming changes, then scaffold the Next.js app and implement Sprint 1.
