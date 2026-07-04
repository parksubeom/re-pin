-- sujungpin M1 Step-0 — 0003 submit_round RPC + RLS + grants + storage
-- Distinct SQLSTATEs (P0002/P0003/P0004) so handlers map error.code, never regex on message.

-- submit_round takes the SHARE TOKEN: the DB re-derives project_id itself (defense-in-depth
-- for invariant 4 — a handler bug cannot target the wrong project).
create or replace function public.submit_round(p_share_token text)
returns public.rounds
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pid uuid; v_included int; v_count int; v_no int; v_draft int;
  v_round public.rounds;
begin
  select id, included_rounds into v_pid, v_included
    from public.projects where share_token = p_share_token;
  if not found then
    raise exception 'unknown share token' using errcode = 'P0002';    -- -> 404
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_pid::text, 0));     -- per-project serialize
  perform 1 from public.projects where id = v_pid for update;          -- row lock (real guard)

  select next_round_no into v_no from public.projects where id = v_pid;

  select count(*) into v_draft from public.pins where project_id = v_pid and status = 'draft';
  if v_draft = 0 then
    raise exception 'no draft pins to submit' using errcode = 'P0003'; -- -> 409
  end if;

  select count(*) into v_count from public.rounds where project_id = v_pid;
  if v_count >= v_included then
    raise exception 'no remaining rounds (included=%, used=%)', v_included, v_count
      using errcode = 'P0004';                                         -- -> 409
  end if;

  insert into public.rounds(project_id, no) values (v_pid, v_no) returning * into v_round;
  update public.projects set next_round_no = next_round_no + 1 where id = v_pid;  -- never rewind

  perform set_config('sujungpin.allow_status_flip', 'on', true);       -- tx-local
  update public.pins set status = 'submitted', round_id = v_round.id, round_no = v_no
    where project_id = v_pid and status = 'draft';
  perform set_config('sujungpin.allow_status_flip', 'off', true);

  return v_round;
end;
$$;

-- Admin project delete: opens the cascade-delete bypass so the append-only DELETE guard does
-- not abort the cascade.
create or replace function public.delete_project(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('sujungpin.allow_cascade_delete', 'on', true);
  delete from public.projects where id = p_project_id;   -- cascades rounds + pins
  perform set_config('sujungpin.allow_cascade_delete', 'off', true);
end;
$$;

-- ---- RLS: enable + deny-by-default for anon/authenticated ----
alter table public.projects enable row level security;
alter table public.rounds   enable row level security;
alter table public.pins     enable row level security;
-- no anon/authenticated policies => deny-by-default.
revoke all on public.projects, public.rounds, public.pins from anon, authenticated;

-- ---- GRANTs: service_role bypasses RLS but is NOSUPERUSER, so it STILL needs privileges ----
grant select, insert, update, delete on public.projects, public.rounds, public.pins to service_role;
revoke all on function public.submit_round(text)      from public, anon, authenticated;
revoke all on function public.delete_project(uuid)    from public, anon, authenticated;
grant execute on function public.submit_round(text)   to service_role;
grant execute on function public.delete_project(uuid) to service_role;

-- ---- PRIVATE storage bucket ----
-- Prefer creating via dashboard/CLI; this fallback FORCES private on conflict so a pre-existing
-- public bucket is corrected, not silently left public.
insert into storage.buckets (id, name, public) values ('drafts', 'drafts', false)
  on conflict (id) do update set public = false;
-- storage.objects RLS: no anon policy => server-minted signed URL is the only read path.

-- ---- verify (run manually after) ----
-- select public from storage.buckets where id = 'drafts';                                  -- false
-- select has_function_privilege('service_role','public.submit_round(text)','execute');     -- true
