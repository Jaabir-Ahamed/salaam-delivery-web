-- Simplify volunteers RLS to restore reads for authenticated users
-- Run in Supabase SQL editor

-- Drop existing volunteers policies
DROP POLICY IF EXISTS "Volunteers can read own record" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can read all volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Volunteers can update own record" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can manage volunteers" ON public.volunteers;

-- Ensure RLS is enabled
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to read volunteers (fixes frontend list failures)
CREATE POLICY "volunteers read authenticated" ON public.volunteers
  FOR SELECT
  TO authenticated
  USING (true);

-- Volunteers can update their own record
CREATE POLICY "volunteers update own" ON public.volunteers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can insert/update/delete any volunteer rows
CREATE POLICY "admins manage volunteers" ON public.volunteers
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid() AND a.active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid() AND a.active = true));

-- Verify policies
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies WHERE tablename = 'volunteers'
ORDER BY policyname;