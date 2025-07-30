-- Enable Row Level Security
ALTER TABLE public.seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "volunteers_can_read_own_data" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_can_insert_own_data" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_can_update_own_data" ON public.volunteers;
DROP POLICY IF EXISTS "admins_can_manage_volunteers" ON public.volunteers;

-- Volunteers table policies (non-recursive)
CREATE POLICY "volunteers_can_read_own_data" ON public.volunteers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "volunteers_can_insert_own_data" ON public.volunteers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "volunteers_can_update_own_data" ON public.volunteers
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin access based on auth metadata (non-recursive)
CREATE POLICY "admins_can_manage_volunteers" ON public.volunteers
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Seniors table policies
CREATE POLICY "volunteers_can_read_seniors" ON public.seniors
  FOR SELECT USING (active = true);

CREATE POLICY "admins_can_manage_seniors" ON public.seniors
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Deliveries table policies
CREATE POLICY "volunteers_can_read_own_deliveries" ON public.deliveries
  FOR SELECT USING (volunteer_id = auth.uid());

CREATE POLICY "volunteers_can_update_own_deliveries" ON public.deliveries
  FOR UPDATE USING (volunteer_id = auth.uid()) WITH CHECK (volunteer_id = auth.uid());

CREATE POLICY "admins_can_manage_deliveries" ON public.deliveries
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Storage policies for profile pictures
CREATE POLICY "users_can_upload_own_picture" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_can_view_pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "users_can_update_own_picture" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
