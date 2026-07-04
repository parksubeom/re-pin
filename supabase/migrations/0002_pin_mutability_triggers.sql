-- sujungpin M1 Step-0 — 0002 pin mutability triggers
-- Enforces invariant 1 (draft-only mutability) + legal status transitions at the DB layer,
-- so even a compromised handler / raw SQL cannot mutate submitted content.

create or replace function public.pins_guard()
returns trigger
language plpgsql
as $$
declare
  flip_allowed   boolean := coalesce(current_setting('sujungpin.allow_status_flip',   true), 'off') = 'on';
  cascade_delete boolean := coalesce(current_setting('sujungpin.allow_cascade_delete', true), 'off') = 'on';
begin
  ------------------------------------------------------------------ INSERT
  -- A pin must be BORN draft. Non-draft pins only exist via the controlled submit_round flip.
  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.round_id is not null or new.round_no is not null then
      raise exception 'pins must be inserted as draft with null round'
        using errcode = 'check_violation';
    end if;
    return new;
  end if;

  ------------------------------------------------------------------ DELETE
  if tg_op = 'DELETE' then
    -- BEFORE DELETE fires on CASCADE deletes too. Allow when a project is being torn down
    -- (GUC set by delete_project()), otherwise enforce draft-only deletion.
    if cascade_delete then
      return old;
    end if;
    if old.status <> 'draft' then
      raise exception 'pin % not deletable: status=%', old.id, old.status
        using errcode = 'check_violation';
    end if;
    return old;
  end if;

  ------------------------------------------------------------------ UPDATE
  if old.status = 'draft' then
    if new.status = 'submitted' then
      if not flip_allowed then
        raise exception 'draft->submitted only via submit_round()' using errcode = 'check_violation';
      end if;
      -- controlled flip may change ONLY status/round_id/round_no
      if new.comment     is distinct from old.comment
      or new.x           is distinct from old.x
      or new.y           is distinct from old.y
      or new.author_name is distinct from old.author_name
      or new.project_id  is distinct from old.project_id
      or new.created_at  is distinct from old.created_at then
        raise exception 'controlled flip may change only status/round_id/round_no'
          using errcode = 'check_violation';
      end if;
      return new;
    elsif new.status <> 'draft' then
      raise exception 'illegal status transition draft->%', new.status using errcode = 'check_violation';
    end if;
    return new;  -- draft edits (comment/x/y) freely allowed (invariant 1)
  end if;

  -- non-draft: content AND round binding are frozen.
  if new.comment     is distinct from old.comment
  or new.x           is distinct from old.x
  or new.y           is distinct from old.y
  or new.author_name is distinct from old.author_name
  or new.project_id  is distinct from old.project_id
  or new.created_at  is distinct from old.created_at
  or new.round_id    is distinct from old.round_id
  or new.round_no    is distinct from old.round_no then
    raise exception 'pin % immutable once %', old.id, old.status using errcode = 'check_violation';
  end if;

  -- resolve is deferred to M2. Reject submitted->resolved in M1 so no handler triggers it.
  if old.status <> new.status then
    raise exception 'status transition %->% not allowed in M1', old.status, new.status
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists pins_guard_biud on public.pins;
create trigger pins_guard_biud
  before insert or update or delete on public.pins
  for each row execute function public.pins_guard();
