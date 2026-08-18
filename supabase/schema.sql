-- Supabase schema for kennel intake + triage (INTAKE scope only)
-- Default deny via RLS; service role is only for server-side writes (e.g. public booking submission).
-- Compatible with Postgres <= 14 (no CREATE POLICY IF NOT EXISTS).

-- Core tables
create table if not exists public.kennels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text not null,
  postcode text not null,
  phone text,
  notify_new_request boolean not null default true,
  notify_accepted boolean not null default false,
  notify_rejected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kennel_id uuid not null references public.kennels (id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz not null default now()
);

create table if not exists public.capacity_settings (
  id uuid primary key default gen_random_uuid(),
  kennel_id uuid not null references public.kennels (id) on delete cascade,
  max_dogs_total integer not null check (max_dogs_total > 0),
  max_dogs_by_size jsonb not null default '{}'::jsonb,
  min_notice_days integer not null default 0 check (min_notice_days >= 0),
  updated_at timestamptz not null default now(),
  unique (kennel_id)
);

create table if not exists public.blackout_dates (
  id uuid primary key default gen_random_uuid(),
  kennel_id uuid not null references public.kennels (id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (kennel_id, date)
);

create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  kennel_id uuid not null references public.kennels (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  unique (kennel_id, email)
);

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  kennel_id uuid not null references public.kennels (id) on delete cascade,
  owner_id uuid not null references public.owners (id) on delete cascade,
  name text not null,
  breed text not null,
  size_category text not null check (size_category in ('small', 'medium', 'large')),
  vaccination_expiry_date date,
  internal_notes text,
  created_at timestamptz not null default now(),
  unique (kennel_id, owner_id, name)
);

create type if not exists public.booking_status as enum ('new', 'needs-info', 'accepted', 'rejected');
create type if not exists public.availability_signal as enum ('space', 'nearly_full', 'full');

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  kennel_id uuid not null references public.kennels (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  owner_id uuid not null references public.owners (id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  status public.booking_status not null default 'new',
  availability_signal public.availability_signal,
  capacity_snapshot jsonb,
  notes text,
  contact_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_dates check (check_out_date > check_in_date)
);

create table if not exists public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  kennel_id uuid not null references public.kennels (id) on delete cascade,
  booking_request_id uuid not null references public.booking_requests (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

-- Indexes to support common queries
create index if not exists idx_booking_requests_kennel_status on public.booking_requests (kennel_id, status);
create index if not exists idx_booking_requests_dates on public.booking_requests (kennel_id, check_in_date, check_out_date);
create index if not exists idx_dogs_owner on public.dogs (owner_id);

-- RLS: default deny then allow per-kennel staff
alter table public.kennels enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.capacity_settings enable row level security;
alter table public.blackout_dates enable row level security;
alter table public.owners enable row level security;
alter table public.dogs enable row level security;
alter table public.booking_requests enable row level security;
alter table public.internal_notes enable row level security;

-- Kennel public read: booking pages need basic kennel info by slug (non-PII)
drop policy if exists "Public can read kennels by slug" on public.kennels;
create policy "Public can read kennels by slug" on public.kennels
  for select
  using (true);

drop policy if exists "Staff can update kennel profile" on public.kennels;
create policy "Staff can update kennel profile" on public.kennels
  for update
  to authenticated
  using (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = kennels.id
  ))
  with check (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = kennels.id
  ));

-- Staff profile: staff see their mapping
drop policy if exists "Staff can read own profile" on public.staff_profiles;
create policy "Staff can read own profile" on public.staff_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Helper expression reused in policies:
-- staff_membership: user must belong to the kennel
-- With check mirrors using to keep writes scoped.
drop policy if exists "Staff can manage capacity settings" on public.capacity_settings;
create policy "Staff can manage capacity settings" on public.capacity_settings
  for all
  to authenticated
  using (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = capacity_settings.kennel_id
  ))
  with check (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = capacity_settings.kennel_id
  ));

drop policy if exists "Staff can manage blackout dates" on public.blackout_dates;
create policy "Staff can manage blackout dates" on public.blackout_dates
  for all
  to authenticated
  using (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = blackout_dates.kennel_id
  ))
  with check (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = blackout_dates.kennel_id
  ));

drop policy if exists "Staff can manage owners" on public.owners;
create policy "Staff can manage owners" on public.owners
  for all
  to authenticated
  using (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = owners.kennel_id
  ))
  with check (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = owners.kennel_id
  ));

drop policy if exists "Staff can manage dogs" on public.dogs;
create policy "Staff can manage dogs" on public.dogs
  for all
  to authenticated
  using (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = dogs.kennel_id
  ))
  with check (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = dogs.kennel_id
  ));

drop policy if exists "Staff can manage booking requests" on public.booking_requests;
create policy "Staff can manage booking requests" on public.booking_requests
  for all
  to authenticated
  using (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = booking_requests.kennel_id
  ))
  with check (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = booking_requests.kennel_id
  ));

drop policy if exists "Staff can manage internal notes" on public.internal_notes;
create policy "Staff can manage internal notes" on public.internal_notes
  for all
  to authenticated
  using (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = internal_notes.kennel_id
  ))
  with check (exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.kennel_id = internal_notes.kennel_id
  ));
