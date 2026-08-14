select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  coalesce(count(p.policyname), 0) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.schemaname = n.nspname
  and p.tablename = c.relname
where c.relkind = 'r'
  and n.nspname = 'public'
order by c.relname;
