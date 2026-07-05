-- 0004_maker_ownership_and_rls.sql — M2 maker ownership + REAL RLS (idempotent, single paste)
-- Additive on top of 0000_reset_and_init.sql. Safe to re-run.
-- MODEL (verified against 0000): 0000 REVOKEs ALL from anon/authenticated and grants ONLY to
-- service_role. RLS is ENABLED on all three tables. So maker (authenticated) access needs BOTH
-- (a) table-level GRANTs AND (b) owner-scoped RLS policies — GRANTs are checked BEFORE policies.
-- The anonymous /r + /api path is untouched: it uses the SECRET client (bypasses RLS) and the
-- token-scoped SECURITY DEFINER RPCs. anon role gets NOTHING here.

begin;

-- 1) Ownership column. NULLABLE (legacy M1 rows have no owner → invisible to every maker, correct).
--    on delete set null: deleting a maker's auth account ORPHANS projects (keeps /r links alive)
--    rather than cascade-wiping client-facing review pages.
alter table public.projects
  add column if not exists owner_id uuid references auth.users(id) on delete set null;
create index if not exists projects_owner_id_idx on public.projects (owner_id);

-- 2) TABLE GRANTs for the maker role (REQUIRED — RLS alone grants nothing).
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select                          on public.rounds   to authenticated;
grant select                          on public.pins     to authenticated;

-- 3) RLS policies — authenticated role ONLY, scoped by ownership.
-- projects
drop policy if exists projects_owner_select on public.projects;
create policy projects_owner_select on public.projects
  for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists projects_owner_insert on public.projects;
create policy projects_owner_insert on public.projects
  for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists projects_owner_update on public.projects;
create policy projects_owner_update on public.projects
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists projects_owner_delete on public.projects;
create policy projects_owner_delete on public.projects
  for delete to authenticated using (owner_id = (select auth.uid()));

-- rounds (read via owned project) — so dashboard rounds(count) is non-empty under RLS
drop policy if exists rounds_owner_select on public.rounds;
create policy rounds_owner_select on public.rounds
  for select to authenticated using (exists (
    select 1 from public.projects p
    where p.id = rounds.project_id and p.owner_id = (select auth.uid())));

-- pins (read via owned project)
drop policy if exists pins_owner_select on public.pins;
create policy pins_owner_select on public.pins
  for select to authenticated using (exists (
    select 1 from public.projects p
    where p.id = pins.project_id and p.owner_id = (select auth.uid())));

-- 4) Close the delete_project cross-tenant hole. It is SECURITY DEFINER (bypasses RLS) and takes
--    an arbitrary uuid. Add an internal owner check so a maker can only delete their OWN project.
create or replace function public.delete_project(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_owner uuid;
begin
  select owner_id into v_owner from public.projects where id = p_project_id;
  if not found then
    raise exception 'unknown project' using errcode = 'P0002';
  end if;
  if v_owner is distinct from auth.uid() then
    raise exception 'not project owner' using errcode = 'P0001';
  end if;
  perform set_config('sujungpin.allow_cascade_delete', 'on', true);
  delete from public.projects where id = p_project_id;
  perform set_config('sujungpin.allow_cascade_delete', 'off', true);
end;
$$;
revoke all on function public.delete_project(uuid) from public, anon;
grant execute on function public.delete_project(uuid) to authenticated, service_role;

-- NOTE: submit_round(text) is the anonymous client path — deliberately NOT owner-gated; it stays
-- token-scoped and service_role-only (0000). Do not add an owner check there.
-- NOTE: Storage 'drafts' — NO new policies. Uploads keep using the SECRET client server-side.

commit;

-- ============================ VERIFY (run as an RLS-subject role) ============================
-- V0: select rolbypassrls from pg_roles where rolname = current_user;                 -- false
-- V1: select column_name, is_nullable from information_schema.columns
--     where table_schema='public' and table_name='projects' and column_name='owner_id'; -- owner_id | YES
-- V2: select relname, relrowsecurity from pg_class where relname in ('projects','rounds','pins'); -- all true
-- V3: select has_table_privilege('authenticated','public.projects','select'),
--            has_table_privilege('authenticated','public.projects','insert');          -- both true
-- V4: select tablename, policyname, roles, cmd from pg_policies
--     where schemaname='public' and 'anon' = any(roles);                               -- 0 rows
-- V5 (maker isolation): set local role authenticated;
--     select set_config('request.jwt.claims',
--       json_build_object('sub','<UUID-A>','role','authenticated')::text, true);
--     select count(*) from public.projects;  -- only A's rows; reset role;
-- V6 (owner-spoof blocked): as A, insert owner_id='<UUID-B>' → ERROR 42501; owner_id='<UUID-A>' → ok
-- V7 (delete guard): as A, select delete_project('<B-project-id>') → ERROR 'not project owner'
