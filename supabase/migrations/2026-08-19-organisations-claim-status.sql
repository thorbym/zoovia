-- Run in Supabase SQL Editor against the live database.
-- Replaces organisations.is_claimed (boolean) with claim_status (enum),
-- preserving existing rows. See DECISIONS.md 2026-08-19 entry.

create type public.claim_status as enum ('unclaimed', 'pending_verification', 'claimed', 'rejected');

alter table public.organisations
  add column claim_status public.claim_status not null default 'unclaimed';

update public.organisations
  set claim_status = case when is_claimed then 'claimed' else 'unclaimed' end::public.claim_status;

drop index if exists idx_organisations_claimed;
create index idx_organisations_claimed on public.organisations (claim_status);

alter table public.organisations
  drop column is_claimed;
