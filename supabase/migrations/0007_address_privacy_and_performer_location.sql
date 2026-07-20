-- ============================================================================
-- 1. Venue exact address was publicly selectable regardless of booking status
-- ============================================================================
-- venue_profiles.address was covered by the general "approved venues are
-- public" SELECT policy, so anyone with the publishable key could read a
-- venue's exact address directly, with no booking involved at all — RLS is
-- row-level, so hiding just one column requires moving it into its own table
-- with its own policy.
create table venue_private_details (
  user_id uuid primary key references venue_profiles(user_id) on delete cascade,
  address text not null
);

insert into venue_private_details (user_id, address)
select user_id, address from venue_profiles;

alter table venue_profiles drop column address;

alter table venue_private_details enable row level security;

create policy "venue_private_details_select" on venue_private_details
  for select using (
    auth.uid() = user_id
    or is_admin()
    or exists (
      select 1 from bookings b
      where b.venue_id = venue_private_details.user_id
        and b.performer_id = auth.uid()
        and b.status in ('confirmed', 'completed')
    )
  );

create policy "venue_private_details_insert_own" on venue_private_details
  for insert with check (auth.uid() = user_id);

create policy "venue_private_details_update_own" on venue_private_details
  for update using (auth.uid() = user_id);

-- get_booking_reveal read the address straight off venue_profiles; point it
-- at the new table instead (function body only, same signature/grants).
create or replace function get_booking_reveal(target_booking_id uuid)
returns table(performer_email text, venue_address text)
language plpgsql
security definer
set search_path = public
as $$
declare
  b bookings%rowtype;
begin
  select * into b from bookings where id = target_booking_id;

  if b.id is null then
    return;
  end if;

  if auth.uid() <> b.performer_id and auth.uid() <> b.venue_id and not is_admin() then
    raise exception 'Not authorized';
  end if;

  if b.status not in ('confirmed', 'completed') then
    return;
  end if;

  return query
    select p.email, vpd.address
    from profiles p, venue_private_details vpd
    where p.id = b.performer_id and vpd.user_id = b.venue_id;
end;
$$;

-- ============================================================================
-- 2. Performers could apply to (or be invited to) gigs regardless of their
-- own verification status — only the venue side was ever checked.
-- ============================================================================
drop policy "bookings_insert_participant" on bookings;
create policy "bookings_insert_participant" on bookings
  for insert
  with check (
    status = 'requested'
    and (
      (auth.uid() = performer_id and initiated_by = 'performer')
      or (auth.uid() = venue_id and initiated_by = 'venue')
    )
    and exists (
      select 1 from performer_profiles p
      where p.user_id = performer_id and p.verification_status = 'approved'
    )
    and exists (
      select 1 from venue_profiles v
      where v.user_id = venue_id and v.verification_status = 'approved'
    )
  );

-- ============================================================================
-- 3. Performer location, so distance-based matching has something to work
-- with on both sides. Unlike a venue's street address, this is public — it's
-- only ever a general area for matching, never a destination someone needs
-- to travel to, so there's nothing here that needs booking-gated reveal.
-- ============================================================================
alter table performer_profiles add column locality text;
alter table performer_profiles add column city text;
alter table performer_profiles add column state text;
alter table performer_profiles add column lat double precision;
alter table performer_profiles add column lng double precision;

grant update (locality, city, state, lat, lng) on performer_profiles to authenticated;
