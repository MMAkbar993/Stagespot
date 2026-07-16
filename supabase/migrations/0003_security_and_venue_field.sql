-- Adds a field the venue onboarding UI collects ("First time hosting") that
-- wasn't in the original schema.
alter table venue_profiles add column first_time_hosting boolean;

-- profiles.role gates every verification/authorization check in the app and
-- must never be user-editable. Drop the update policy entirely — only the
-- signup trigger and service-role admin actions should ever write this table.
drop policy "profiles_update_own" on profiles;

-- RLS row-level checks alone don't stop a performer/venue from writing
-- verification_status/rejection_reason on their own row (self-approval).
-- Restrict "own row" updates to non-authorization columns via column privileges.
revoke update on performer_profiles from authenticated;
grant update (
  display_name, act_type, bio, social_links, portfolio_links,
  first_time_flag, proof_of_work_links, profile_picture_url
) on performer_profiles to authenticated;

revoke update on venue_profiles from authenticated;
grant update (
  venue_name, address, state, city, locality, lat, lng, act_types_wanted,
  photos, video_link, social_links, proof_of_business_links,
  profile_picture_url, first_time_hosting
) on venue_profiles to authenticated;
