# Palettory

Pilot tool for collecting crossmodal colour associations (MSc UX research).

## Run locally (no database needed)

```bash
npm install
npm run dev
```

App runs at http://localhost:3000. Without Supabase configured it operates in **local mode** — full flow works, the submission payload is logged to the browser console at the result step, and a small `local mode` label is shown on the result card.

## Hook up Supabase (when ready to collect real data)

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.local.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Restart `npm run dev`.
5. Export CSV from Supabase dashboard → Table Editor → `responses`.

## Project layout

- `app/` — routes (`/`, `/base`, `/like`, `/shift`, `/result`)
- `components/` — `BrandLogo`, `HueSlider`, `HSBSliders`, `HolographicCard`
- `lib/colour.ts` — HSB types/helpers
- `lib/session.ts` — localStorage state (survives refresh)
- `lib/supabase.ts` — null when env not set → app stays in local mode
- `supabase/schema.sql` — schema + RLS policies
