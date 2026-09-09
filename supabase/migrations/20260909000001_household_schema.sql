-- Base schema. Written as CREATE TABLE IF NOT EXISTS because this mirrors
-- tables that already exist on the hosted project (built before this
-- migration history existed) - this file both recreates them identically
-- for a fresh local database and safely no-ops the CREATE TABLE parts when
-- run against the real project, only adding what's actually missing there
-- (RLS, policies, functions, the due_date column, the auth FK).

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households (id),
  name text not null,
  email text,
  created_at timestamptz default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households (id),
  name text not null,
  decay_rate smallint,
  last_cleaned timestamptz,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms (id),
  name text not null,
  frequency smallint,
  last_completed timestamptz,
  assigned_to uuid references users (id),
  created_at timestamptz default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks (id),
  room_id uuid references rooms (id),
  user_id uuid references users (id),
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- One-off tasks need an actual due date; recurring cadence alone (frequency,
-- same pattern as rooms.decay_rate) can't express "due next Tuesday".
alter table tasks add column if not exists due_date date;

-- Team member avatars (emoji), for a bit of visual identity in the UI.
alter table users add column if not exists avatar text default '🙂';

-- Tie household membership to a real login. users.id was created without
-- this FK originally - every member should be a real authenticated account
-- so the invite-code join flow and RLS below have something to key off of.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_id_fkey'
  ) then
    alter table users
      add constraint users_id_fkey foreign key (id) references auth.users (id) on delete cascade;
  end if;
end $$;

alter table households enable row level security;
alter table users enable row level security;
alter table rooms enable row level security;
alter table tasks enable row level security;
alter table logs enable row level security;

-- Bypasses RLS on `users` (security definer) so policies elsewhere can look
-- up "my household" via a plain function call instead of a self-referential
-- subquery against a table that itself has RLS enabled.
create or replace function my_household_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from users where id = auth.uid();
$$;

drop policy if exists "Members can view their household" on households;
create policy "Members can view their household"
  on households for select
  to authenticated
  using (id = my_household_id());

drop policy if exists "Members can view their household's users" on users;
create policy "Members can view their household's users"
  on users for select
  to authenticated
  using (household_id = my_household_id());

drop policy if exists "Users can update their own row" on users;
create policy "Users can update their own row"
  on users for update
  to authenticated
  using (id = auth.uid());

drop policy if exists "Members can view their household's rooms" on rooms;
create policy "Members can view their household's rooms"
  on rooms for select
  to authenticated
  using (household_id = my_household_id());

drop policy if exists "Members can manage their household's rooms" on rooms;
create policy "Members can manage their household's rooms"
  on rooms for all
  to authenticated
  using (household_id = my_household_id())
  with check (household_id = my_household_id());

drop policy if exists "Members can view their household's tasks" on tasks;
create policy "Members can view their household's tasks"
  on tasks for select
  to authenticated
  using (room_id in (select id from rooms where household_id = my_household_id()));

drop policy if exists "Members can manage their household's tasks" on tasks;
create policy "Members can manage their household's tasks"
  on tasks for all
  to authenticated
  using (room_id in (select id from rooms where household_id = my_household_id()))
  with check (room_id in (select id from rooms where household_id = my_household_id()));

drop policy if exists "Members can view their household's logs" on logs;
create policy "Members can view their household's logs"
  on logs for select
  to authenticated
  using (room_id in (select id from rooms where household_id = my_household_id()));

drop policy if exists "Members can log completions" on logs;
create policy "Members can log completions"
  on logs for insert
  to authenticated
  with check (room_id in (select id from rooms where household_id = my_household_id()));

-- Onboarding: a signed-up user has no `users` row yet, so they can't be
-- scoped by RLS above until they've created or joined a household. Both
-- paths run as SECURITY DEFINER so they can insert the household/membership
-- row without needing a broader (and harder to secure) insert policy.
create or replace function create_household(household_name text)
returns households
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household households;
  new_code text;
begin
  new_code := upper(substr(md5(random()::text), 1, 6));
  insert into households (name, invite_code) values (household_name, new_code)
    returning * into new_household;

  insert into users (id, household_id, name, email)
    values (
      auth.uid(),
      new_household.id,
      coalesce(auth.jwt() -> 'user_metadata' ->> 'name', split_part(auth.jwt() ->> 'email', '@', 1)),
      auth.jwt() ->> 'email'
    )
    on conflict (id) do update set household_id = excluded.household_id;

  return new_household;
end;
$$;

create or replace function join_household(code text)
returns households
language plpgsql
security definer
set search_path = public
as $$
declare
  target households;
begin
  select * into target from households where invite_code = code;
  if target.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into users (id, household_id, name, email)
    values (
      auth.uid(),
      target.id,
      coalesce(auth.jwt() -> 'user_metadata' ->> 'name', split_part(auth.jwt() ->> 'email', '@', 1)),
      auth.jwt() ->> 'email'
    )
    on conflict (id) do update set household_id = excluded.household_id;

  return target;
end;
$$;
