-- Create senior assignments table for admin management
-- This table tracks which seniors are assigned to which volunteers

CREATE TABLE public.senior_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.admins(id),
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one active assignment per senior per volunteer
  UNIQUE(senior_id, volunteer_id, assignment_date)
);

-- Create indexes for better performance
CREATE INDEX idx_senior_assignments_senior ON public.senior_assignments(senior_id);
CREATE INDEX idx_senior_assignments_volunteer ON public.senior_assignments(volunteer_id);
CREATE INDEX idx_senior_assignments_date ON public.senior_assignments(assignment_date);
CREATE INDEX idx_senior_assignments_status ON public.senior_assignments(status);
CREATE INDEX idx_senior_assignments_active ON public.senior_assignments(senior_id, volunteer_id, status) WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE public.senior_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for senior_assignments
-- Admins can see all assignments
CREATE POLICY "Admins can view all senior assignments" ON public.senior_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Admins can insert assignments
CREATE POLICY "Admins can insert senior assignments" ON public.senior_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Admins can update assignments
CREATE POLICY "Admins can update senior assignments" ON public.senior_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Admins can delete assignments
CREATE POLICY "Admins can delete senior assignments" ON public.senior_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Volunteers can see their own assignments
CREATE POLICY "Volunteers can view their own assignments" ON public.senior_assignments
  FOR SELECT USING (
    volunteer_id = auth.uid() AND status = 'active'
  );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_senior_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_senior_assignments_updated_at
  BEFORE UPDATE ON public.senior_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_senior_assignments_updated_at();

-- Create a view for easier querying of assignments with senior and volunteer details
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
  a.name as assigned_by_name
FROM public.senior_assignments sa
JOIN public.seniors s ON sa.senior_id = s.id
JOIN public.volunteers v ON sa.volunteer_id = v.id
JOIN public.admins a ON sa.assigned_by = a.id
WHERE s.active = true AND v.active = true;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.senior_assignments TO authenticated;
GRANT SELECT ON public.senior_assignments_view TO authenticated;

-- Verify the table was created
SELECT 
  'Senior Assignments Table Created' as status,
  COUNT(*) as total_assignments
FROM public.senior_assignments; 