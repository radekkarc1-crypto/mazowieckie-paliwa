create table if not exists public.user_backups (
  user_id uuid primary key references auth.users (id) on delete cascade,
  projects jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint user_backups_projects_is_array check (jsonb_typeof(projects) = 'array')
);

alter table public.user_backups enable row level security;

grant select, insert, update, delete on public.user_backups to authenticated;
revoke all on public.user_backups from anon;

drop policy if exists "Users can read their own backup" on public.user_backups;
create policy "Users can read their own backup"
  on public.user_backups for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own backup" on public.user_backups;
create policy "Users can create their own backup"
  on public.user_backups for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own backup" on public.user_backups;
create policy "Users can update their own backup"
  on public.user_backups for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own backup" on public.user_backups;
create policy "Users can delete their own backup"
  on public.user_backups for delete
  using (auth.uid() = user_id);

create or replace function public.set_user_backups_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_backups_updated_at on public.user_backups;
create trigger set_user_backups_updated_at
before update on public.user_backups
for each row execute function public.set_user_backups_updated_at();
