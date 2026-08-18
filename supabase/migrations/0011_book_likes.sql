-- Likes on book reviews, owned by the visitor's (anonymous) auth session —
-- same ownership model as book_comments (0003/0004).
--
-- Model:
--   * One like per session per book, enforced by a UNIQUE constraint in the
--     database (not just in app code).
--   * SELECT stays public so the client can show counts and highlight the
--     visitor's own like. user_id values are opaque anonymous uuids, the same
--     exposure book_comments already has.
--   * INSERT only as yourself (user_id = auth.uid()); no UPDATE policy at all;
--     DELETE your own like (unlike) or anything if you are the real admin.
--
-- PRE-REQUISITE: "Allow anonymous sign-ins" enabled (already required by 0004).

create table if not exists public.book_likes (
  id uuid primary key default gen_random_uuid(),
  book_id bigint not null references public."BookReview" (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (book_id, user_id)
);

create index if not exists book_likes_book_id_idx
  on public.book_likes (book_id);

alter table public.book_likes enable row level security;

-- Explicit grants instead of the permissive Supabase default privileges
-- (which would hand INSERT/UPDATE/DELETE on every column to anon too).
revoke all on table public.book_likes from anon, authenticated;
grant select on table public.book_likes to anon, authenticated;
grant insert, delete on table public.book_likes to authenticated;

-- SELECT: public read (counts + "did I like this?").
create policy "likes_select_public"
  on public.book_likes
  for select
  to anon, authenticated
  using (true);

-- INSERT: only as yourself. The unique constraint blocks double likes.
create policy "likes_insert_own"
  on public.book_likes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- DELETE: your own like (unlike), or any like if you are the real admin.
create policy "likes_delete_own_or_admin"
  on public.book_likes
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_blog_admin())
  );

-- No UPDATE policy on purpose: a like is created or removed, never edited.
