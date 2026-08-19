-- ============================================================
-- Zoovia schema
-- Run in Supabase SQL Editor to apply from scratch.
-- Safe to re-run on an empty database.
-- ============================================================

-- Drop old tables if migrating from the kennel-intake schema
drop table if exists public.internal_notes cascade;
drop table if exists public.booking_requests cascade;
drop table if exists public.dogs cascade;
drop table if exists public.owners cascade;
drop table if exists public.blackout_dates cascade;
drop table if exists public.capacity_settings cascade;
drop table if exists public.staff_profiles cascade;
drop table if exists public.kennels cascade;
drop type if exists public.booking_status cascade;
drop type if exists public.availability_signal cascade;

-- ============================================================
-- Core: organisations + users
-- ============================================================

-- organisations — the canonical business record.
-- Exists before any operator claims it (seeded from AAL register data).
create table public.organisations (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  slug           text        not null unique,
  licence_region text,
  street_address text,
  locality       text,
  region         text,
  postcode       text        not null,
  telephone      text,
  contact_email  text,
  website        text,
  is_claimed     boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- user_profiles — extends auth.users.
-- type = 'owner'    → dog owner, no org link
-- type = 'operator' → kennel operator, org_id points to their organisation
create table public.user_profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,
  type       text        not null check (type in ('owner', 'operator')),
  org_id     uuid        references public.organisations (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Operator config
-- ============================================================

create table public.capacity_settings (
  id               uuid    primary key default gen_random_uuid(),
  org_id           uuid    not null references public.organisations (id) on delete cascade,
  max_dogs_total   integer not null check (max_dogs_total > 0),
  max_dogs_by_size jsonb   not null default '{}'::jsonb,
  min_notice_days  integer not null default 0 check (min_notice_days >= 0),
  updated_at       timestamptz not null default now(),
  unique (org_id)
);

create table public.blackout_dates (
  id         uuid    primary key default gen_random_uuid(),
  org_id     uuid    not null references public.organisations (id) on delete cascade,
  date       date    not null,
  reason     text,
  created_at timestamptz not null default now(),
  unique (org_id, date)
);

-- ============================================================
-- Enquiry management
-- ============================================================

create table public.owners (
  id         uuid    primary key default gen_random_uuid(),
  org_id     uuid    not null references public.organisations (id) on delete cascade,
  name       text    not null,
  email      text    not null,
  phone      text,
  created_at timestamptz not null default now(),
  unique (org_id, email)
);

create table public.dogs (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references public.organisations (id) on delete cascade,
  owner_id                uuid not null references public.owners (id) on delete cascade,
  name                    text not null,
  breed                   text not null,
  size_category           text not null check (size_category in ('small', 'medium', 'large')),
  vaccination_expiry_date date,
  internal_notes          text,
  created_at              timestamptz not null default now(),
  unique (org_id, owner_id, name)
);

create type public.booking_status as enum ('new', 'needs-info', 'accepted', 'rejected');
create type public.availability_signal as enum ('space', 'nearly_full', 'full');

create table public.booking_requests (
  id                  uuid    primary key default gen_random_uuid(),
  org_id              uuid    not null references public.organisations (id) on delete cascade,
  dog_id              uuid    not null references public.dogs (id) on delete cascade,
  owner_id            uuid    not null references public.owners (id) on delete cascade,
  check_in_date       date    not null,
  check_out_date      date    not null,
  status              public.booking_status      not null default 'new',
  availability_signal public.availability_signal,
  capacity_snapshot   jsonb,
  notes               text,
  contact_opt_in      boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint check_dates check (check_out_date > check_in_date)
);

create table public.internal_notes (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organisations (id) on delete cascade,
  booking_request_id uuid not null references public.booking_requests (id) on delete cascade,
  created_by         uuid references auth.users (id) on delete set null,
  note               text not null,
  created_at         timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_organisations_postcode  on public.organisations (postcode);
create index idx_organisations_region    on public.organisations (region);
create index idx_organisations_claimed   on public.organisations (is_claimed);
create index idx_user_profiles_org       on public.user_profiles (org_id);
create index idx_booking_requests_status on public.booking_requests (org_id, status);
create index idx_booking_requests_dates  on public.booking_requests (org_id, check_in_date, check_out_date);
create index idx_dogs_owner              on public.dogs (owner_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.organisations    enable row level security;
alter table public.user_profiles    enable row level security;
alter table public.capacity_settings enable row level security;
alter table public.blackout_dates   enable row level security;
alter table public.owners           enable row level security;
alter table public.dogs             enable row level security;
alter table public.booking_requests enable row level security;
alter table public.internal_notes   enable row level security;

-- organisations: anyone can read (public directory)
create policy "Public can read organisations"
  on public.organisations for select
  using (true);

-- organisations: operators can update their own
create policy "Operators can update their organisation"
  on public.organisations for update
  to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = organisations.id
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = organisations.id
  ));

-- user_profiles: users manage their own
create policy "Users can read own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- capacity_settings
create policy "Operators can manage capacity settings"
  on public.capacity_settings for all
  to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = capacity_settings.org_id
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = capacity_settings.org_id
  ));

-- blackout_dates
create policy "Operators can manage blackout dates"
  on public.blackout_dates for all
  to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = blackout_dates.org_id
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = blackout_dates.org_id
  ));

-- owners
create policy "Operators can manage owners"
  on public.owners for all
  to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = owners.org_id
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = owners.org_id
  ));

-- dogs
create policy "Operators can manage dogs"
  on public.dogs for all
  to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = dogs.org_id
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = dogs.org_id
  ));

-- booking_requests
create policy "Operators can manage booking requests"
  on public.booking_requests for all
  to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = booking_requests.org_id
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = booking_requests.org_id
  ));

-- internal_notes
create policy "Operators can manage internal notes"
  on public.internal_notes for all
  to authenticated
  using (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = internal_notes.org_id
  ))
  with check (exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.type = 'operator' and up.org_id = internal_notes.org_id
  ));
