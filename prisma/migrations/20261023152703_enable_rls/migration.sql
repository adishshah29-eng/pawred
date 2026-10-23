-- Turn on Row Level Security for every table in the public schema.
--
-- Why: Supabase exposes the public schema through its web API. Without RLS,
-- anyone holding the publishable key (which ships to browsers) can read and
-- write these tables. With RLS on and no policies, that API sees nothing.
--
-- The app is unaffected: Prisma connects as the table owner ("postgres"),
-- and owners bypass RLS.
--
-- New tables added in later migrations need their own
--   ALTER TABLE "Name" ENABLE ROW LEVEL SECURITY;
-- line in that migration.

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
