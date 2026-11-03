# StayScape (Phase 1)

Hotel and resort discovery site built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Leaflet and OpenStreetMap, Supabase, and an AI concierge chatbot.

## Run it locally

    npm install
    cp .env.example .env.local
    npm run dev

Open http://localhost:3000. With no keys set, the site uses built-in demo hotels, a built-in chatbot, and a demo newsletter.

## Optional configuration

1. Supabase: create a project, run `supabase/schema.sql` in the SQL editor, then set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Insert your hotels and rooms into the tables.
2. AI chatbot: set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`). Without it, the chatbot answers from built-in rules.
3. Vercel: add the same variables under Project Settings, then Environment Variables.

## What is included

- Splash screen, glassmorphism UI, and three themes (Forest, Ivory, Midnight) saved per browser.
- Home page with hero search, featured stays, destinations, facilities, reviews, and newsletter.
- Explore page with search, price slider, rating and amenity filters, sorting, pagination, grid and map views.
- Hotel detail page with rooms, amenities, and a map.
- API routes: `GET /api/hotels` (filter, sort, paginate), `POST /api/chat`, `POST /api/newsletter`.
- Responsive concierge chatbot.

## Not yet built (later phases)

Authentication and roles, the booking engine and simulated payments, customer GPS, live shuttle tracking, the three dashboards, the remaining public pages (About, Contact, FAQs, Login), and Google login.

## Notes

- Hotel photos come from Unsplash by URL and are placeholders. Replace them with Supabase Storage uploads.
- Testimonials are sample text for layout. Replace them with real reviews later.
- The logo is a simple placeholder SVG in `components/Logo.tsx`.
