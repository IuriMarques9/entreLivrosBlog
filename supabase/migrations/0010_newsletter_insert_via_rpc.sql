-- Double opt-in is enforced by the SECURITY DEFINER RPC public.newsletter_subscribe
-- (it always writes confirmed = false and mints a confirm_token). The leftover
-- public INSERT policy let an anonymous client POST directly to
-- /rest/v1/newsletter_subscribers with `confirmed: true`, bypassing double
-- opt-in and poisoning the list. Subscriptions now go ONLY through the RPC
-- (which bypasses RLS as definer); the admin still inserts via
-- newsletter_admin_modify. So the public INSERT policy is removed.
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
