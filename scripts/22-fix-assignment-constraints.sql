-- Fix assignment constraints to allow assignments
-- This script removes problematic constraints and adds better ones

-- Drop the existing table and view
DROP VIEW IF EXISTS public.senior_assignments_view;
DROP TABLE IF EXISTS public.senior_assignments CASCADE;

-- Recreate the table without the problematic unique constraint
CREATE TABLE public.senior_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  assigned_by UUID,
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_senior_assignments_senior ON public.senior_assignments(senior_id);
CREATE INDEX idx_senior_assignments_volunteer ON public.senior_assignments(volunteer_id);
CREATE INDEX idx_senior_assignments_date ON public.senior_assignments(assignment_date);
CREATE INDEX idx_senior_assignments_status ON public.senior_assignments(status);

-- Enable RLS
ALTER TABLE public.senior_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all senior assignments" ON public.senior_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Admins can insert senior assignments" ON public.senior_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Admins can update senior assignments" ON public.senior_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Admins can delete senior assignments" ON public.senior_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Volunteers can view their own assignments" ON public.senior_assignments
  FOR SELECT USING (
    volunteer_id = auth.uid() AND status = 'active'
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_senior_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_senior_assignments_updated_at ON public.senior_assignments;
CREATE TRIGGER update_senior_assignments_updated_at
  BEFORE UPDATE ON public.senior_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_senior_assignments_updated_at();

-- Create view with better error handling for assigned_by
CREATE VIEW public.senior_assignments_view AS
SELECT 
  sa.id,
  sa.senior_id,
  sa.volunteer_id,
  sa.assigned_by,
  sa.assignment_date,
  sa.status,
  sa.notes,
  sa.created_at,
  sa.updated_at,
  s.name as senior_name,
  s.address as senior_address,
  s.building as senior_building,
  s.unit_apt as senior_unit,
  v.name as volunteer_name,
  v.email as volunteer_email,
  COALESCE(a.name, 'System Admin') as assigned_by_name
FROM public.senior_assignments sa
JOIN public.seniors s ON sa.senior_id = s.id
JOIN public.volunteers v ON sa.volunteer_id = v.id
LEFT JOIN public.admins a ON sa.assigned_by = a.id
WHERE s.active = true AND v.active = true;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.senior_assignments TO authenticated;
GRANT SELECT ON public.senior_assignments_view TO authenticated;

-- Verify creation
SELECT 
  'Senior Assignments Constraints Fixed' as status,
  (SELECT COUNT(*) FROM public.senior_assignments) as total_assignments,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'senior_assignments_view') as view_created; 