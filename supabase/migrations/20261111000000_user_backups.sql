create table if not exists public.user_backups (
  user_id uuid primary key references auth.users (id) on delete cascade,
  projects jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint user_backups_projects_is_array check (jsonb_typeof(projects) = 'array')
);

alter table public.user_backups enable row level security;

revoke all on public.user_backups from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.user_backups to authenticated;

drop policy if exists "Users can read their own backup" on public.user_backups;
create policy "Users can read their own backup"
  on public.user_backups for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own backup" on public.user_backups;
create policy "Users can create their own backup"
  on public.user_backups for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own backup" on public.user_backups;
create policy "Users can update their own backup"
  on public.user_backups for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own backup" on public.user_backups;
create policy "Users can delete their own backup"
  on public.user_backups for delete
  to authenticated
  using ((select auth.uid()) = user_id);
