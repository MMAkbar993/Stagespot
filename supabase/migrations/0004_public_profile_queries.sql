-- avg_rating/has_completed_booking are called from public profile pages and
-- must see all bookings/feedback to compute a correct aggregate, regardless of
-- who is asking. Without security definer they'd run under the caller's own
-- RLS, silently under-counting for anyone who isn't a participant/admin.
alter function avg_rating(uuid) security definer set search_path = public;
alter function has_completed_booking(uuid, uuid) security definer set search_path = public;

-- "Recent performances" (performer profile) and "Past gigs hosted" (venue
-- profile) are explicitly public-facing fields (Section 5.2/5.3), but bookings
-- are otherwise restricted to participants/admin. Add public visibility for
-- completed bookings specifically — requested/accepted/confirmed stay private.
create policy "bookings_select_completed_public" on bookings
  for select using (status = 'completed');
