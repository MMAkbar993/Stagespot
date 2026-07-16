-- StageSpot initial schema
-- Covers every field described in PRD Section 5. Schema shape is not fixed by
-- the PRD (Section 7) — this is the developer-chosen structure.

-- ============================================================================
-- profiles: one row per auth.users row, holds the role chosen at signup
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('performer', 'venue', 'admin')),
  email text not null,
  created_at timestamptz not null default now()
);

-- Auto-create a profiles row whenever a new auth user is created.
-- Role comes from the metadata passed to supabase.auth.signUp() at the
-- role-selection step (Section 4). Admin accounts are created directly
-- (Supabase dashboard / service role), not through this public flow, but
-- still get a profiles row via this same trigger if metadata.role = 'admin'.
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'role', 'performer'), new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================================
-- performer_profiles (Section 5.2)
-- ============================================================================
create table performer_profiles (
  user_id uuid primary key references profiles (id) on delete cascade,
  display_name text not null,
  act_type text,
  bio text,
  social_links jsonb not null default '{}',      -- { instagram: "...", youtube: "...", ... }
  portfolio_links jsonb not null default '[]',    -- [{ label, url }, ...]
  first_time_flag boolean,                        -- optional "first time performing" flag
  proof_of_work_links jsonb not null default '[]',-- submitted for admin verification
  profile_picture_url text,                       -- only uploaded file; rest are links (Section 7)
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- venue_profiles (Section 5.3)
-- ============================================================================
create table venue_profiles (
  user_id uuid primary key references profiles (id) on delete cascade,
  venue_name text not null,
  address text not null,
  state text,
  city text,
  locality text,
  lat double precision,
  lng double precision,
  act_types_wanted text[] not null default '{}',
  photos jsonb not null default '[]',             -- gallery of links
  video_link text,
  social_links jsonb not null default '{}',
  proof_of_business_links jsonb not null default '[]',
  profile_picture_url text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index venue_profiles_lat_lng_idx on venue_profiles (lat, lng);
create index venue_profiles_locality_idx on venue_profiles (city, locality);

-- ============================================================================
-- gigs: posted by verified venues (Section 5.1, 5.6)
-- ============================================================================
create table gigs (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venue_profiles (user_id) on delete cascade,
  title text not null,
  description text,
  act_types_wanted text[] not null default '{}',
  event_date date not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create index gigs_venue_id_idx on gigs (venue_id);
create index gigs_status_event_date_idx on gigs (status, event_date);

-- ============================================================================
-- bookings: the requested -> accepted -> confirmed -> completed lifecycle
-- (declined / cancelled as alternate outcomes) — Section 5.6
-- ============================================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid references gigs (id) on delete set null,
  performer_id uuid not null references performer_profiles (user_id) on delete cascade,
  venue_id uuid not null references venue_profiles (user_id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'confirmed', 'completed', 'declined', 'cancelled')),
  initiated_by text not null check (initiated_by in ('performer', 'venue')),
  scheduled_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_performer_id_idx on bookings (performer_id);
create index bookings_venue_id_idx on bookings (venue_id);
create index bookings_status_idx on bookings (status);

-- ============================================================================
-- feedback: left by both sides after a completed booking (Section 5.7)
-- ============================================================================
create table feedback (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  author_role text not null check (author_role in ('performer', 'venue')),
  star_rating int not null check (star_rating between 1 and 5),
  comment text,
  reputation_tags text[] not null default '{}', -- respectful / followed through / would work with again
  created_at timestamptz not null default now(),
  unique (booking_id, author_role)
);

-- ============================================================================
-- verification_actions: admin audit trail (Section 5.8)
-- ============================================================================
create table verification_actions (
  id uuid primary key default gen_random_uuid(),
  profile_type text not null check (profile_type in ('performer', 'venue')),
  profile_id uuid not null,
  admin_id uuid not null references profiles (id),
  action text not null check (action in ('approved', 'rejected')),
  reason text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Helper functions
-- ============================================================================

-- Used throughout RLS policies below.
create function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- Average star rating for a given profile (performer or venue user_id).
create function avg_rating(target_user_id uuid)
returns numeric as $$
  select round(avg(f.star_rating)::numeric, 2)
  from feedback f
  join bookings b on b.id = f.booking_id
  where (b.performer_id = target_user_id and f.author_role = 'venue')
     or (b.venue_id = target_user_id and f.author_role = 'performer');
$$ language sql stable set search_path = public;

-- "Already worked with" indicator (Section 5.2 / 5.3).
create function has_completed_booking(a uuid, b uuid)
returns boolean as $$
  select exists (
    select 1 from bookings
    where status = 'completed'
      and ((performer_id = a and venue_id = b) or (performer_id = b and venue_id = a))
  );
$$ language sql stable set search_path = public;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table performer_profiles enable row level security;
alter table venue_profiles enable row level security;
alter table gigs enable row level security;
alter table bookings enable row level security;
alter table feedback enable row level security;
alter table verification_actions enable row level security;

-- profiles: user reads/updates own row; admin reads all (via is_admin()).
-- Admin verification actions themselves run through a service-role route
-- handler and bypass RLS entirely, so no separate admin UPDATE policy here.
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- performer_profiles: public can see approved profiles; owner always sees own; admin sees all.
create policy "performer_profiles_select" on performer_profiles
  for select using (verification_status = 'approved' or auth.uid() = user_id or is_admin());
create policy "performer_profiles_insert_own" on performer_profiles
  for insert with check (auth.uid() = user_id);
create policy "performer_profiles_update_own" on performer_profiles
  for update using (auth.uid() = user_id);

-- venue_profiles: same pattern.
create policy "venue_profiles_select" on venue_profiles
  for select using (verification_status = 'approved' or auth.uid() = user_id or is_admin());
create policy "venue_profiles_insert_own" on venue_profiles
  for insert with check (auth.uid() = user_id);
create policy "venue_profiles_update_own" on venue_profiles
  for update using (auth.uid() = user_id);

-- gigs: public can see open gigs from approved venues; venue owner sees own always; admin sees all.
create policy "gigs_select" on gigs
  for select using (
    (status = 'open' and exists (
      select 1 from venue_profiles v where v.user_id = gigs.venue_id and v.verification_status = 'approved'
    ))
    or auth.uid() = venue_id
    or is_admin()
  );
create policy "gigs_insert_own_if_approved" on gigs
  for insert with check (
    auth.uid() = venue_id and exists (
      select 1 from venue_profiles v where v.user_id = auth.uid() and v.verification_status = 'approved'
    )
  );
create policy "gigs_update_own" on gigs
  for update using (auth.uid() = venue_id);

-- bookings: visible/editable only to the two parties involved, or admin.
create policy "bookings_select_participant_or_admin" on bookings
  for select using (auth.uid() = performer_id or auth.uid() = venue_id or is_admin());
create policy "bookings_insert_participant" on bookings
  for insert with check (auth.uid() = performer_id or auth.uid() = venue_id);
create policy "bookings_update_participant" on bookings
  for update using (auth.uid() = performer_id or auth.uid() = venue_id);

-- feedback: publicly readable (shown in the recipient's reviews section);
-- only a booking participant can write, and only about the other party.
create policy "feedback_select_public" on feedback
  for select using (true);
create policy "feedback_insert_participant" on feedback
  for insert with check (
    exists (
      select 1 from bookings b
      where b.id = feedback.booking_id
        and b.status = 'completed'
        and (
          (auth.uid() = b.performer_id and feedback.author_role = 'performer')
          or (auth.uid() = b.venue_id and feedback.author_role = 'venue')
        )
    )
  );

-- verification_actions: admin-only, accessed via service-role route handlers.
create policy "verification_actions_admin_select" on verification_actions
  for select using (is_admin());
