-- Run in Supabase SQL Editor against the live database.
-- Adds latitude/longitude for distance-based search (EP-01).
-- Nullable — backfilled by scripts/geocode-organisations.ts, not required at insert time.
-- See DECISIONS.md 2026-08-19 entry.

alter table public.organisations
  add column latitude numeric,
  add column longitude numeric;
