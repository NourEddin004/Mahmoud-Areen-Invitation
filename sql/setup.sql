-- ═══════════════════════════════════════════════════════════════════
-- Mahmoud & Areen — RSVP storage. Run once in Supabase → SQL Editor.
--
-- BEFORE YOU RUN IT: replace every PUT_YOUR_SECRET_HERE (3 places) with
-- the couple's secret. sql/setup.local.sql (git-ignored) already has the
-- real one filled in — paste that file instead of this one.
-- Never commit the real secret: the repo is public and the secret is the lock.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.rsvp (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text        not null check (char_length(trim(name)) between 1 and 80),
  attending  text        not null check (attending in ('yes','no')),
  guests     smallint    not null default 0 check (guests between 0 and 20),
  note       text        check (char_length(note) <= 500)
);
create index if not exists rsvp_created_at_idx on public.rsvp (created_at desc);

-- Nothing is allowed until a policy says so.
alter table public.rsvp enable row level security;

-- Guests (the public anon key) may ADD a reply. Nothing else:
-- no read, no edit, no delete. There is deliberately no SELECT policy.
drop policy if exists "a guest may reply" on public.rsvp;
create policy "a guest may reply" on public.rsvp
  for insert to anon with check (true);

-- ── the couple's list: readable only with the secret ───────────────
create or replace function public.guest_list(pass text)
returns table (id bigint, name text, attending text, guests smallint, note text, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  if pass is null or pass <> 'PUT_YOUR_SECRET_HERE' then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  return query select r.id, r.name, r.attending, r.guests, r.note, r.created_at
               from public.rsvp r order by r.created_at desc;
end $$;

-- add a guest by hand (for the aunt who replies by phone)
create or replace function public.guest_add(pass text, p_name text, p_attending text, p_guests smallint, p_note text)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare new_id bigint;
begin
  if pass is null or pass <> 'PUT_YOUR_SECRET_HERE' then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  insert into public.rsvp (name, attending, guests, note)
  values (trim(p_name), p_attending, coalesce(p_guests, 0), nullif(trim(p_note), ''))
  returning id into new_id;
  return new_id;
end $$;

-- remove one reply, by id only (no "delete all" exists on purpose)
create or replace function public.guest_remove(pass text, p_id bigint)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if pass is null or pass <> 'PUT_YOUR_SECRET_HERE' then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  delete from public.rsvp where id = p_id;
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function public.guest_list(text)                              from public, anon, authenticated;
revoke all on function public.guest_add(text, text, text, smallint, text)   from public, anon, authenticated;
revoke all on function public.guest_remove(text, bigint)                    from public, anon, authenticated;
grant execute on function public.guest_list(text)                            to anon;
grant execute on function public.guest_add(text, text, text, smallint, text) to anon;
grant execute on function public.guest_remove(text, bigint)                  to anon;

-- To change the secret later: re-run the three "create or replace function"
-- blocks with a new value. Every old couple link stops working at once.
