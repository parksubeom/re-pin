-- sujungpin M1 Step-0 — RESET + FULL INIT (idempotent, single paste)
-- Safe to run repeatedly. Paste this WHOLE file into the Supabase SQL editor and Run.
-- It drops the sujungpin objects (no data loss expected at Step-0) then rebuilds everything:
-- schema (0001) + triggers (0002) + submit_round/RLS/storage (0003).
-- After running, the verify queries at the very bottom must all return the expected values.

-- ============================ RESET ============================
drop function if exists public.submit_round(text)         cascade;
drop function if exists public.delete_project(uuid)        cascade;
drop function if exists public.pins_guard()                cascade;
drop function if exists public.gen_share_token(int)        cascade;
drop table    if exists public.pins                        cascade;
drop table    if exists public.rounds                      cascade;
drop table    if exists public.projects                    cascade;

-- ============================ 0001 — schema ============================
create extension if not exists pgcrypto with schema extensions;

create or replace function public.gen_share_token(n_bytes int default 24)
returns text
language sql
volatile
set search_path = extensions, public
as $$
  select rtrim(
           translate(
             replace(encode(extensions.gen_random_bytes(n_bytes), 'base64'), e'\n', ''),
             '+/', '-_'
           ), '='
         );
$$;

create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 200),
  image_path      text,
  share_token     text not null unique default public.gen_share_token(),
  included_rounds int  not null check (included_rounds >= 1),
  next_round_no   int  not null default 1 check (next_round_no >= 1),
  created_at      timestamptz not null default now()
);

create table public.rounds (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid        not null references public.projects(id) on delete cascade,
  no         int         not null check (no >= 1),
  created_at timestamptz not null default now(),
  unique (project_id, no)
);

create table public.pins (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  round_id    uuid references public.rounds(id) on delete no action,
  round_no    int,
  x           numeric(9,8) not null check (x >= 0 and x <= 1),
  y           numeric(9,8) not null check (y >= 0 and y <= 1),
  comment     text not null check (char_length(comment) between 1 and 2000),
  author_name text check (char_length(author_name) between 1 and 100),
  status      text not null default 'draft' check (status in ('draft','submitted','resolved')),
  created_at  timestamptz not null default now(),
  constraint pin_round_consistency check (
    (status = 'draft'                   and round_id is null     and round_no is null) or
    (status in ('submitted','resolved') and round_id is not null and round_no is not null)
  )
);

create index pins_project_status_idx on public.pins (project_id, status);
create index pins_round_idx           on public.pins (round_id);
create index rounds_project_idx        on public.rounds (project_id);

-- ============================ 0002 — pin mutability triggers ============================
create or replace function public.pins_guard()
returns trigger
language plpgsql
as $$
declare
  flip_allowed   boolean := coalesce(current_setting('sujungpin.allow_status_flip',   true), 'off') = 'on';
  cascade_delete boolean := coalesce(current_setting('sujungpin.allow_cascade_delete', true), 'off') = 'on';
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.round_id is not null or new.round_no is not null then
      raise exception 'pins must be inserted as draft with null round' using errcode = 'check_violation';
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if cascade_delete then return old; end if;
    if old.status <> 'draft' then
      raise exception 'pin % not deletable: status=%', old.id, old.status using errcode = 'check_violation';
    end if;
    return old;
  end if;

  -- UPDATE
  if old.status = 'draft' then
    if new.status = 'submitted' then
      if not flip_allowed then
        raise exception 'draft->submitted only via submit_round()' using errcode = 'check_violation';
      end if;
      if new.comment is distinct from old.comment
      or new.x is distinct from old.x
      or new.y is distinct from old.y
      or new.author_name is distinct from old.author_name
      or new.project_id is distinct from old.project_id
      or new.created_at is distinct from old.created_at then
        raise exception 'controlled flip may change only status/round_id/round_no' using errcode = 'check_violation';
      end if;
      return new;
    elsif new.status <> 'draft' then
      raise exception 'illegal status transition draft->%', new.status using errcode = 'check_violation';
    end if;
    return new;
  end if;

  if new.comment is distinct from old.comment
  or new.x is distinct from old.x
  or new.y is distinct from old.y
  or new.author_name is distinct from old.author_name
  or new.project_id is distinct from old.project_id
  or new.created_at is distinct from old.created_at
  or new.round_id is distinct from old.round_id
  or new.round_no is distinct from old.round_no then
    raise exception 'pin % immutable once %', old.id, old.status using errcode = 'check_violation';
  end if;
  if old.status <> new.status then
    raise exception 'status transition %->% not allowed in M1', old.status, new.status using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists pins_guard_biud on public.pins;
create trigger pins_guard_biud
  before insert or update or delete on public.pins
  for each row execute function public.pins_guard();

-- ============================ 0003 — submit_round + RLS + storage ============================
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
    raise exception 'unknown share token' using errcode = 'P0002';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_pid::text, 0));
  perform 1 from public.projects where id = v_pid for update;

  select next_round_no into v_no from public.projects where id = v_pid;

  select count(*) into v_draft from public.pins where project_id = v_pid and status = 'draft';
  if v_draft = 0 then
    raise exception 'no draft pins to submit' using errcode = 'P0003';
  end if;

  select count(*) into v_count from public.rounds where project_id = v_pid;
  if v_count >= v_included then
    raise exception 'no remaining rounds (included=%, used=%)', v_included, v_count using errcode = 'P0004';
  end if;

  insert into public.rounds(project_id, no) values (v_pid, v_no) returning * into v_round;
  update public.projects set next_round_no = next_round_no + 1 where id = v_pid;

  perform set_config('sujungpin.allow_status_flip', 'on', true);
  update public.pins set status = 'submitted', round_id = v_round.id, round_no = v_no
    where project_id = v_pid and status = 'draft';
  perform set_config('sujungpin.allow_status_flip', 'off', true);

  return v_round;
end;
$$;

create or replace function public.delete_project(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('sujungpin.allow_cascade_delete', 'on', true);
  delete from public.projects where id = p_project_id;
  perform set_config('sujungpin.allow_cascade_delete', 'off', true);
end;
$$;

alter table public.projects enable row level security;
alter table public.rounds   enable row level security;
alter table public.pins     enable row level security;
revoke all on public.projects, public.rounds, public.pins from anon, authenticated;

grant select, insert, update, delete on public.projects, public.rounds, public.pins to service_role;
revoke all on function public.submit_round(text)      from public, anon, authenticated;
revoke all on function public.delete_project(uuid)    from public, anon, authenticated;
grant execute on function public.submit_round(text)   to service_role;
grant execute on function public.delete_project(uuid) to service_role;

insert into storage.buckets (id, name, public) values ('drafts', 'drafts', false)
  on conflict (id) do update set public = false;

-- ============================ VERIFY (should all be true / expected) ============================
-- select public from storage.buckets where id = 'drafts';                                  -- expect: false
-- select has_function_privilege('service_role','public.submit_round(text)','execute');     -- expect: true
-- select count(*) from public.projects;                                                    -- expect: 0
