# CivicSense — AI-Powered Smart Community Waste & Civic Issue Management System

A hackathon prototype where citizens report civic issues (waste overflow, potholes,
water leaks, blocked drains, streetlight damage, infrastructure damage) and an
AI-assisted pipeline classifies, scores, deduplicates, routes, and tracks each
report end-to-end — citizen -> AI analysis -> admin -> field supervisor -> resolution.

## Quick start

```
npm install
npm run dev
```

Open the printed local URL. No environment variables are required - the app
runs entirely on a deterministic demo AI engine and an in-memory data store
seeded with realistic Chennai-area demo data (32 complaints, 10 supervisors, 5
departments, built-in duplicates/hotspots/SLA breaches).

## Demo login

On /login, pick a role tab (Citizen / Supervisor / Admin) - any email/password
works in demo mode and logs you into the matching pre-seeded account:

| Role | Demo email |
|---|---|
| Citizen | citizen@civicsense.demo |
| Supervisor | supervisor@civicsense.demo |
| Admin | admin@civicsense.demo |

Citizens can also log in with **Phone OTP**: on the Citizen tab, switch to the
"Phone OTP" method, enter any 10-digit number, and the demo OTP is shown right
on screen (and logged to the browser console) since there's no real SMS
gateway wired up — swap `sendOtp`/`verifyOtpAndLogin` in `AuthContext.jsx` for
a real gateway or Supabase phone auth later.

## Contact support

Logged-in Citizens and Supervisors have a **Contact Support** link in the
sidebar (`/support`) with role-specific phone, email, and WhatsApp contacts.

## Language

A language switcher (top-right of the login page and every dashboard topbar)
covers English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi,
Gujarati, and Punjabi. Translations live in `src/i18n/translations.js` —
add a language by adding a new key there plus an entry in `LANGUAGES`.

## Demo script (matches the hackathon flow)

1. Log in as Citizen -> "Report an Issue"
2. Upload a sample overflowing-garbage photo, describe it, confirm location
3. Submit for AI analysis -> review issue type, confidence, severity, priority
   score, duplicate detection, recommended department
4. Submit complaint -> get a complaint ID (CS-2026-XXXXX)
5. Log in as Admin -> see the new complaint on the dashboard/map
6. Open the complaint -> review explainable priority breakdown, duplicate
   matches, SLA deadline, AI-recommended supervisor -> assign
7. Log in as Supervisor -> see the assigned task -> Start Work -> upload
   before/after photos -> Mark Resolved (resolution note required)
8. Log in as Citizen -> see Resolved status with full timeline -> rate it
9. Back in Admin -> Analytics -> trend, distribution, hotspot insights

## Architecture

```
src/
  components/       Reusable UI: ComplaintCard, badges, AI cards, map, timeline...
  context/          AuthContext (login/session), DataContext (complaints "DB")
  data/seed.js       Demo data generator (departments, supervisors, complaints)
  layouts/          DashboardLayout (role-based sidebar/topbar)
  pages/            citizen/, supervisor/, admin/ route pages + Landing/Login/Register
  services/
    ai/             classification, severity, priority, duplicate detection,
                    supervisor assignment, hotspot clustering - the AI engine
    supabase/       Supabase client wrapper (no-ops if unconfigured)
    analytics/      Chart data helpers for the admin Analytics page
  utils/            SLA calculation, formatting/badge helpers
supabase/schema.sql  Full Postgres schema + RLS policies + Realtime wiring
```

## AI engine

src/services/ai/ is a modular, explainable "AI-assisted analysis" pipeline:

- classificationService - keyword-based issue classification (swap in a
  real model via VITE_AI_API_URL / VITE_AI_API_KEY)
- severityService - transparent weighted scoring (Safety 40% / Impact 25%
  / Criticality 20% / Recurrence 15%) with human-readable reasoning
- priorityService - converts severity sub-scores into a 0-100 explainable
  priority score with a full breakdown
- duplicateService - keyword-overlap similarity + haversine geo-proximity
- assignmentService - scores supervisors by skill match, department, distance,
  workload, and availability
- hotspotService - clusters complaints geographically to surface
  recurring problem areas with recommendations

This is a deterministic demo engine, not random output - same input always
produces the same, explainable result. It's structured so a real ML/API
implementation can replace any module without touching the UI.

## Connecting real Supabase (optional)

1. Create a project at supabase.com
2. Run supabase/schema.sql in the SQL editor
3. Create a public Storage bucket named complaint-images
4. Copy .env.example to .env and fill in VITE_SUPABASE_URL /
   VITE_SUPABASE_ANON_KEY
5. Restart npm run dev - the app will detect the credentials; wire
   DataContext/AuthContext calls to supabase in place of the in-memory
   store (see comments in those files for the swap points)

## Tech stack

React 18 - Vite - React Router - Leaflet/react-leaflet (map) - Recharts
(charts) - Supabase JS client (optional backend) - Plain CSS design system

## Notes

- Everything is mobile-responsive for Citizen/Supervisor; Admin is desktop-first
  but usable on tablets.
- Images are stored as base64 data URLs in demo mode; in production, wire
  uploads to Supabase Storage (complaint-images bucket).
- Do not label the demo AI engine as "machine learning" in citizen-facing
  copy - it's shown as "AI-assisted analysis," consistent with the project
  brief.
