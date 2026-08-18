-- Lets likes surface in the admin notification centre, mirroring the
-- book_comments.is_read flow.
--
-- 0011 deliberately shipped with no UPDATE policy ("a like is created or
-- removed, never edited"). The admin marking a notification as read is the one
-- exception, so UPDATE is opened only for the is_read column (column-level
-- grant) and only for the real admin (is_blog_admin policy). Visitors still
-- cannot edit likes at all.

alter table public.book_likes
  add column if not exists is_read boolean not null default false;

grant update (is_read) on table public.book_likes to authenticated;

create policy "likes_update_admin"
  on public.book_likes
  for update
  to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));
