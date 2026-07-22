-- Ties every admin-only capability to the REAL admin identity, not merely to
-- "any non-anonymous account".
--
-- Root cause (fixed here): migrations 0006/0008 hardened the RLS so anonymous
-- sessions (signInAnonymously, used for comment ownership) can't touch admin
-- data — but the gate was only `is_anonymous = false`. Enabling e-mail/password
-- sign-ups (or any second real account) would therefore grant that account full
-- admin power at the /rest/v1 layer: dump the newsletter (PII), delete posts,
-- rewrite reviews, overwrite cover images. This migration closes that hole by
-- gating on the admin's actual e-mail via a single helper, so ONLY the blog
-- owner passes — anonymous AND any other real account are both refused.
--
-- Style note: the helper is wrapped in a scalar subselect `(select
-- public.is_blog_admin())` inside every policy so Postgres evaluates it once per
-- query (InitPlan) instead of once per row, matching the auth.* wrapping that
-- 0004/0006 introduced for advisor 0003 (auth_rls_initplan). Behaviour is
-- identical either way.

-- ---------------------------------------------------------------------------
-- Helper: the one place the admin identity is defined. Must stay in sync with
-- the app-layer allowlist (ADMIN_EMAIL / src/lib/auth-guard.ts).
--   * anonymous sessions carry is_anonymous = true  -> refused
--   * a real login carries is_anonymous = false + the account e-mail
-- SECURITY DEFINER + fixed search_path so it can be granted narrowly and can't
-- be shadowed by a caller-controlled search_path.
-- ---------------------------------------------------------------------------
create or replace function public.is_blog_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and lower(coalesce(auth.jwt() ->> 'email', '')) = 'tatilopesfelicio@hotmail.com'
$$;

revoke all on function public.is_blog_admin() from public;
grant execute on function public.is_blog_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- posts: keep public read of published rows; writes require the real admin.
-- ---------------------------------------------------------------------------
drop policy if exists "posts_admin_all" on public.posts;
create policy "posts_admin_all"
  on public.posts for all
  to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));

-- ---------------------------------------------------------------------------
-- newsletter_subscribers: public still inserts (subscribe); only the real
-- admin may read / update / delete. This is the PII-leak surface.
-- ---------------------------------------------------------------------------
drop policy if exists "newsletter_admin_select" on public.newsletter_subscribers;
create policy "newsletter_admin_select"
  on public.newsletter_subscribers for select
  to authenticated
  using ((select public.is_blog_admin()));

drop policy if exists "newsletter_admin_modify" on public.newsletter_subscribers;
create policy "newsletter_admin_modify"
  on public.newsletter_subscribers for all
  to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));

-- ---------------------------------------------------------------------------
-- suggestions: public still inserts; only the real admin may read / moderate.
-- ---------------------------------------------------------------------------
drop policy if exists "suggestions_admin_all" on public.suggestions;
create policy "suggestions_admin_all"
  on public.suggestions for all
  to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));

-- ---------------------------------------------------------------------------
-- BookReview: permissive admin-write policy (0008) + the RESTRICTIVE clamps
-- (0006) both move to the identity gate. Public "Leitura" SELECT untouched.
-- ---------------------------------------------------------------------------
alter table public."BookReview" enable row level security;

drop policy if exists "bookreview_admin_write" on public."BookReview";
create policy "bookreview_admin_write"
  on public."BookReview" for all
  to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));

drop policy if exists "bookreview_block_anon_insert" on public."BookReview";
create policy "bookreview_block_anon_insert"
  on public."BookReview" as restrictive for insert
  to authenticated
  with check ((select public.is_blog_admin()));

drop policy if exists "bookreview_block_anon_update" on public."BookReview";
create policy "bookreview_block_anon_update"
  on public."BookReview" as restrictive for update
  to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));

drop policy if exists "bookreview_block_anon_delete" on public."BookReview";
create policy "bookreview_block_anon_delete"
  on public."BookReview" as restrictive for delete
  to authenticated
  using ((select public.is_blog_admin()));

-- ---------------------------------------------------------------------------
-- book_comments: the owner branch (user_id = auth.uid()) is kept intact so any
-- reader can still edit/delete their OWN comment. The moderation OR-branch used
-- the same `is_anonymous = false` gate, i.e. the same hole (any real account
-- could moderate every comment); move it to the identity gate too. INSERT stays
-- owner-only. (Beyond the literal task list, but the exact furo this migration
-- exists to close — see report.)
-- ---------------------------------------------------------------------------
drop policy if exists "comment_update_own_or_admin" on public.book_comments;
create policy "comment_update_own_or_admin"
  on public.book_comments
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_blog_admin())
  )
  with check (
    user_id = (select auth.uid())
    or (select public.is_blog_admin())
  );

drop policy if exists "comment_delete_own_or_admin" on public.book_comments;
create policy "comment_delete_own_or_admin"
  on public.book_comments
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_blog_admin())
  );

-- ===========================================================================
-- Storage: writes to the cover buckets must require the real admin. Anonymous
-- sessions (and any other real account) can still READ the public covers but
-- can no longer upload / overwrite / delete objects via the anon key.
-- ===========================================================================

-- PostCovers: bucket + public read created in 0001. Replace the three
-- `to authenticated` write policies (bucket_id-only check) with identity-gated
-- ones. Keep "PostCovers public read".
drop policy if exists "PostCovers auth write" on storage.objects;
create policy "PostCovers auth write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'PostCovers' and (select public.is_blog_admin()));

drop policy if exists "PostCovers auth update" on storage.objects;
create policy "PostCovers auth update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'PostCovers' and (select public.is_blog_admin()))
  with check (bucket_id = 'PostCovers' and (select public.is_blog_admin()));

drop policy if exists "PostCovers auth delete" on storage.objects;
create policy "PostCovers auth delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'PostCovers' and (select public.is_blog_admin()));

-- BookCovers: bucket was created in the Supabase dashboard and never had a
-- migration, so its objects were writable by any `authenticated` session. Make
-- the bucket reproducible here (idempotent) and define the same gated policies.
insert into storage.buckets (id, name, public)
  values ('BookCovers', 'BookCovers', true)
  on conflict (id) do nothing;

-- Drop the legacy dashboard-generated BookCovers policies (auto-named
-- "<Op> 1rap6o5_*"). They granted write to ANY authenticated session (i.e. any
-- anonymous visitor) with only a bucket_id check — the exact hole this closes.
-- Must be dropped by their real names, otherwise the permissive OLD policies
-- keep coexisting with (and overriding, since storage policies are permissive)
-- the identity-gated ones below.
drop policy if exists "Insert 1rap6o5_0" on storage.objects;
drop policy if exists "Update 1rap6o5_0" on storage.objects;
drop policy if exists "Delete 1rap6o5_0" on storage.objects;
drop policy if exists "Select 1rap6o5_0" on storage.objects;
drop policy if exists "Update 1rap6o5_1" on storage.objects;
drop policy if exists "Delete 1rap6o5_1" on storage.objects;

drop policy if exists "BookCovers public read" on storage.objects;
create policy "BookCovers public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'BookCovers');

drop policy if exists "BookCovers admin write" on storage.objects;
create policy "BookCovers admin write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'BookCovers' and (select public.is_blog_admin()));

drop policy if exists "BookCovers admin update" on storage.objects;
create policy "BookCovers admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'BookCovers' and (select public.is_blog_admin()))
  with check (bucket_id = 'BookCovers' and (select public.is_blog_admin()));

drop policy if exists "BookCovers admin delete" on storage.objects;
create policy "BookCovers admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'BookCovers' and (select public.is_blog_admin()));

-- ===========================================================================
-- Newsletter double opt-in (RGPD): a new subscription must be confirmed via a
-- link before it counts. Existing rows are grandfathered (they keep whatever
-- `confirmed` they already have — the default change is forward-looking only).
-- ===========================================================================
alter table public.newsletter_subscribers
  add column if not exists confirm_token uuid not null default gen_random_uuid();

-- New subscriptions start unconfirmed; the confirm link flips this to true.
alter table public.newsletter_subscribers
  alter column confirmed set default false;

create index if not exists newsletter_subscribers_confirm_token_idx
  on public.newsletter_subscribers (confirm_token);

-- One-click confirm by token (no auth). SECURITY DEFINER so an anonymous
-- visitor can confirm ONLY the row matching their token, and only while it is
-- still unconfirmed (a spent/valid token can't be replayed to toggle state).
create or replace function public.newsletter_confirm(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.newsletter_subscribers
    set confirmed = true,
        consent_at = coalesce(consent_at, now())
    where confirm_token = p_token
      and confirmed = false;
  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

revoke all on function public.newsletter_confirm(uuid) from public;
grant execute on function public.newsletter_confirm(uuid) to anon, authenticated;

-- Atomic subscribe-or-report. The admin-only SELECT policy means an anonymous
-- subscribe can't read the row back to decide whether to (re)send a confirm
-- link, so this SECURITY DEFINER function owns that decision and returns just
-- what the server action needs:
--   'created'           + the fresh confirm_token  (send confirmation)
--   'resend'            + the existing token       (re-send confirmation)
--   'already_confirmed' + null                     (do nothing)
-- The confirm_token it returns stays server-side (the Route/Action runs with
-- the anon key on the server); it never reaches the browser. A confirm_token
-- only lets someone confirm a *pending* subscription, so exposure is low-risk.
-- ON CONFLICT keeps it race-safe under concurrent inserts.
create or replace function public.newsletter_subscribe(p_email text)
returns table (status text, confirm_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_token uuid;
  v_confirmed boolean;
begin
  insert into public.newsletter_subscribers (email, confirmed, consent_at)
    values (v_email, false, now())
    on conflict (email) do nothing
    returning newsletter_subscribers.confirm_token into v_token;

  if v_token is not null then
    return query select 'created'::text, v_token;
    return;
  end if;

  -- Row already existed: read its state to decide.
  select ns.confirmed, ns.confirm_token
    into v_confirmed, v_token
    from public.newsletter_subscribers ns
    where ns.email = v_email;

  if v_confirmed then
    return query select 'already_confirmed'::text, null::uuid;
  else
    return query select 'resend'::text, v_token;
  end if;
end;
$$;

revoke all on function public.newsletter_subscribe(text) from public;
grant execute on function public.newsletter_subscribe(text) to anon, authenticated;
