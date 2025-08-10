-- Restore Authentication and RLS Policies
-- Run this after confirming the app works without auth

-- Re-enable RLS on all tables
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senior_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create simple, working RLS policies for volunteers
CREATE POLICY "volunteers_read_policy" ON public.volunteers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "volunteers_insert_policy" ON public.volunteers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "volunteers_update_policy" ON public.volunteers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "volunteers_admin_policy" ON public.volunteers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.volunteers 
      WHERE volunteers.id = auth.uid() 
      AND volunteers.role IN ('admin', 'super_admin')
    )
  );

-- Create simple, working RLS policies for seniors
CREATE POLICY "seniors_read_policy" ON public.seniors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "seniors_admin_policy" ON public.seniors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.volunteers 
      WHERE volunteers.id = auth.uid() 
      AND volunteers.role IN ('admin', 'super_admin')
    )
  );

-- Create simple, working RLS policies for deliveries
CREATE POLICY "deliveries_read_policy" ON public.deliveries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "deliveries_insert_policy" ON public.deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "deliveries_update_policy" ON public.deliveries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = volunteer_id)
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "deliveries_admin_policy" ON public.deliveries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.volunteers 
      WHERE volunteers.id = auth.uid() 
      AND volunteers.role IN ('admin', 'super_admin')
    )
  );

-- Create simple, working RLS policies for senior_assignments
CREATE POLICY "senior_assignments_read_policy" ON public.senior_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "senior_assignments_admin_policy" ON public.senior_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.volunteers 
      WHERE volunteers.id = auth.uid() 
      AND volunteers.role IN ('admin', 'super_admin')
    )
  );

-- Create simple, working RLS policies for admins
CREATE POLICY "admins_read_policy" ON public.admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admins_admin_policy" ON public.admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.volunteers 
      WHERE volunteers.id = auth.uid() 
      AND volunteers.role IN ('admin', 'super_admin')
    )
  );

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
