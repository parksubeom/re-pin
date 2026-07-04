-- sujungpin M1 Step-0 — 0001 init schema
-- Run order: 0001 -> 0002 -> 0003. Paste into Supabase SQL editor or `supabase db push`.

-- pgcrypto lives in the `extensions` schema on Supabase; qualify everything.
create extension if not exists pgcrypto with schema extensions;

-- true base64url share token, no line wrap, no '=' padding (24 bytes -> 32 chars).
-- SET search_path pins gen_random_bytes resolution so column DEFAULTs never fail.
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
  image_path      text,                                                -- null until upload
  share_token     text not null unique default public.gen_share_token(),
  included_rounds int  not null check (included_rounds >= 1),
  next_round_no   int  not null default 1 check (next_round_no >= 1),  -- never-rewinding allocator
  created_at      timestamptz not null default now()
);

create table public.rounds (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  no         int  not null check (no >= 1),
  created_at timestamptz not null default now(),
  unique (project_id, no)
);

create table public.pins (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  -- ON DELETE NO ACTION (not RESTRICT): lets a project-delete cascade remove a round and
  -- its pins in one statement without FK-ordering errors, while still preventing deleting a
  -- round out from under live pins in isolation. See delete_project() in 0003.
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
