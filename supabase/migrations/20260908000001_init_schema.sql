-- Household members. Not every member has a login (kids can just be a name a
-- parent adds), so profiles are only loosely linked to auth.users via user_id.
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  avatar text not null default '🙂',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Authenticated users can view profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "Authenticated users can manage profiles"
  on profiles for all
  to authenticated
  using (true)
  with check (true);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Rooms being tracked for cleanliness decay.
create table rooms (
  id bigint generated always as identity primary key,
  name text not null,
  last_cleaned timestamptz not null default now(),
  decay_rate int not null default 7,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

alter table rooms enable row level security;

create policy "Authenticated users can view rooms"
  on rooms for select
  to authenticated
  using (true);

create policy "Authenticated users can manage rooms"
  on rooms for all
  to authenticated
  using (true)
  with check (true);

-- Chores/tasks, each tied to a room and optionally assigned to a household member.
-- 'daily'/'weekly' tasks recur: completing one logs completed_at but the task
-- stays on the list and becomes due again after its cadence elapses.
create table tasks (
  id bigint generated always as identity primary key,
  room_id bigint not null references rooms (id) on delete cascade,
  title text not null,
  assigned_to uuid references profiles (id) on delete set null,
  frequency text not null default 'once' check (frequency in ('once', 'daily', 'weekly')),
  due_date date,
  completed_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "Authenticated users can view tasks"
  on tasks for select
  to authenticated
  using (true);

create policy "Authenticated users can manage tasks"
  on tasks for all
  to authenticated
  using (true)
  with check (true);

-- A log of every time a task was completed, so recurring (daily/weekly) tasks
-- can still report historical stats even though tasks.completed_at only holds
-- the most recent completion.
create table task_completions (
  id bigint generated always as identity primary key,
  task_id bigint not null references tasks (id) on delete cascade,
  completed_by uuid references profiles (id) on delete set null,
  completed_at timestamptz not null default now()
);

alter table task_completions enable row level security;

create policy "Authenticated users can view task completions"
  on task_completions for select
  to authenticated
  using (true);

create policy "Authenticated users can log task completions"
  on task_completions for insert
  to authenticated
  with check (true);
