-- Profile pictures are the only directly-uploaded file type (Section 7).
-- Everything else (portfolio, venue photos/video, proof links) is stored as a URL.
insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

-- Each user may only upload/replace/delete their own profile picture,
-- stored under a path prefixed with their user id (e.g. "<user_id>/avatar.jpg").
-- Anyone can read (bucket is public) since profile pictures are shown on public profile pages.
create policy "profile_pictures_public_read"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');

create policy "profile_pictures_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "profile_pictures_owner_update"
  on storage.objects for update
  using (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "profile_pictures_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = auth.uid()::text);
