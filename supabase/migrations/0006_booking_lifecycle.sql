-- The original insert policy let a participant create a booking with ANY
-- initial status and claim ANY initiated_by value. Require a fresh booking
-- to start at 'requested' and correctly attribute who initiated it, since
-- the transition trigger below depends on initiated_by being trustworthy.
drop policy "bookings_insert_participant" on bookings;
create policy "bookings_insert_participant" on bookings
  for insert
  with check (
    status = 'requested'
    and (
      (auth.uid() = performer_id and initiated_by = 'performer')
      or (auth.uid() = venue_id and initiated_by = 'venue')
    )
  );

-- RLS's bookings_update_participant policy only checks "are you a
-- participant," not "is this transition legal" — a participant could
-- otherwise set status to anything (e.g. self-marking a booking
-- 'completed' the moment it's requested). Enforce the actual state machine
-- (Section 5.6) at the database level so this holds regardless of which
-- client/path performs the update.
create or replace function validate_booking_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.gig_id is distinct from old.gig_id
     or new.performer_id is distinct from old.performer_id
     or new.venue_id is distinct from old.venue_id
     or new.initiated_by is distinct from old.initiated_by
     or new.scheduled_date is distinct from old.scheduled_date then
    raise exception 'Only status may change on an existing booking';
  end if;

  if new.status = old.status then
    return new;
  end if;

  if old.status = 'requested' and new.status = 'accepted' then
    if (old.initiated_by = 'performer' and auth.uid() <> old.venue_id)
       or (old.initiated_by = 'venue' and auth.uid() <> old.performer_id) then
      raise exception 'Only the receiving party can accept a request';
    end if;
  elsif old.status = 'requested' and new.status = 'declined' then
    null; -- either party may decline/withdraw before acceptance
  elsif old.status = 'accepted' and new.status = 'confirmed' then
    null; -- either party may confirm once mutual interest is established
  elsif old.status in ('accepted', 'confirmed') and new.status = 'cancelled' then
    null; -- either party may cancel after acceptance
  elsif old.status = 'confirmed' and new.status = 'completed' then
    if old.scheduled_date > current_date then
      raise exception 'Cannot complete a booking before its scheduled date';
    end if;
  else
    raise exception 'Invalid booking status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_booking_transition on bookings;
create trigger enforce_booking_transition
  before update on bookings
  for each row execute function validate_booking_transition();

-- Contact/address reveal (Section 5.6): profiles.email and venue_profiles.address
-- aren't otherwise readable by the counterparty via RLS. This function is the
-- single controlled path for revealing them, gated on the booking actually
-- being confirmed/completed and the caller actually being a participant.
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
    select p.email, v.address
    from profiles p, venue_profiles v
    where p.id = b.performer_id and v.user_id = b.venue_id;
end;
$$;

grant execute on function get_booking_reveal(uuid) to authenticated;
