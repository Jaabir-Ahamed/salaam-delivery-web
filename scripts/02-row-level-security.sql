-- Enable Row Level Security
ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Policies for seniors table
CREATE POLICY "Volunteers can view active seniors" ON seniors
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage all seniors" ON seniors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM volunteers 
      WHERE volunteers.id = auth.uid() 
      AND volunteers.role = 'admin' 
      AND volunteers.active = true
    )
  );

-- ─────────────────────────────────────────────────────────────
-- Row-Level Security for volunteers (no self-reference)
-- ─────────────────────────────────────────────────────────────

-- Any authenticated user may INSERT *their own* volunteer row.
DROP POLICY IF EXISTS volunteer_self_insert ON volunteers;
CREATE POLICY volunteer_self_insert
  ON volunteers FOR INSERT
  WITH CHECK (id = auth.uid());

-- A user may SELECT their own row.
DROP POLICY IF EXISTS volunteer_self_select ON volunteers;
CREATE POLICY volunteer_self_select
  ON volunteers FOR SELECT
  USING (id = auth.uid());

-- A user may UPDATE their own row.
DROP POLICY IF EXISTS volunteer_self_update ON volunteers;
CREATE POLICY volunteer_self_update
  ON volunteers FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service-role key (used by your server scripts) keeps full access.
--   No extra policy needed; service-role bypasses RLS.

-----------------------------------------------------------------
-- Seniors & deliveries policies stay unchanged (they don’t
-- self-reference and are safe).
-----------------------------------------------------------------

-- Policies for deliveries table
CREATE POLICY "Volunteers can view their deliveries" ON deliveries
  FOR SELECT USING (volunteer_id = auth.uid());

CREATE POLICY "Volunteers can update their deliveries" ON deliveries
  FOR UPDATE USING (volunteer_id = auth.uid());

CREATE POLICY "Admins can manage all deliveries" ON deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM volunteers 
      WHERE volunteers.id = auth.uid() 
      AND volunteers.role = 'admin' 
      AND volunteers.active = true
    )
  );

-- Storage policies for profile pictures
CREATE POLICY "Users can upload their own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile picture" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
