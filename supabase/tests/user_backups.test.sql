begin;

select plan(6);

select has_table('public', 'user_backups', 'user backup table exists');
select col_is_pk('public', 'user_backups', 'user_id', 'each user has one backup row');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.user_backups'::regclass),
  'row-level security is enabled'
);
select ok(
  not has_table_privilege('anon', 'public.user_backups', 'select'),
  'anonymous role cannot read backups'
);
select ok(
  has_table_privilege('authenticated', 'public.user_backups', 'select'),
  'authenticated role has the required read grant'
);
select ok(
  (select count(*) = 4
   from pg_policies
   where schemaname = 'public'
     and tablename = 'user_backups'
     and roles @> array['authenticated']::name[]
     and coalesce(qual, '') like '%auth.uid%'
     and coalesce(with_check, '') like '%auth.uid%'),
  'all four policies are restricted to the authenticated owner'
);

select * from finish();
rollback;
