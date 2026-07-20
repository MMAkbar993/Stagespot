-- ============================================================================
-- 1. Real background auto-completion (Section 5.6) — was only updating on
-- read (whoever happened to open that booking's page). pg_cron runs this
-- independent of any page view.
-- ============================================================================
create extension if not exists pg_cron with schema extensions;

create or replace function complete_overdue_bookings()
returns void
language sql
security definer
set search_path = public
as $$
  update bookings
  set status = 'completed'
  where status = 'confirmed'
    and scheduled_date < current_date;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'complete-overdue-bookings') then
    perform cron.unschedule('complete-overdue-bookings');
  end if;
end $$;

select cron.schedule('complete-overdue-bookings', '*/15 * * * *', 'select complete_overdue_bookings();');

-- ============================================================================
-- 2. Batched rating lookup — Explore/Home/landing each called avg_rating()
-- once PER performer (up to 50 separate network round trips per page load).
-- One call with the full id array replaces the N+1 pattern.
-- ============================================================================
create or replace function avg_ratings_bulk(user_ids uuid[])
returns table(user_id uuid, avg_rating numeric)
language sql
security definer
stable
set search_path = public
as $$
  with ratings as (
    select b.performer_id as user_id, f.star_rating
    from bookings b join feedback f on f.booking_id = b.id
    where f.author_role = 'venue' and b.performer_id = any(user_ids)
    union all
    select b.venue_id as user_id, f.star_rating
    from bookings b join feedback f on f.booking_id = b.id
    where f.author_role = 'performer' and b.venue_id = any(user_ids)
  )
  select u.id as user_id, (select round(avg(r.star_rating)::numeric, 2) from ratings r where r.user_id = u.id) as avg_rating
  from unnest(user_ids) as u(id);
$$;

-- ============================================================================
-- 3. Missing indexes on columns filtered on every discovery/admin-queue query.
-- ============================================================================
create index if not exists performer_profiles_verification_status_idx on performer_profiles (verification_status);
create index if not exists venue_profiles_verification_status_idx on venue_profiles (verification_status);
create index if not exists feedback_booking_id_idx on feedback (booking_id);

-- ============================================================================
-- 4. Venue photo uploads — was a plain URL text field; venues now upload
-- images directly, same pattern as the profile-pictures bucket.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('venue-photos', 'venue-photos', true)
on conflict (id) do nothing;

create policy "venue_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'venue-photos');

create policy "venue_photos_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'venue-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "venue_photos_owner_update"
  on storage.objects for update
  using (bucket_id = 'venue-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "venue_photos_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'venue-photos' and (storage.foldername(name))[1] = auth.uid()::text);
