-- Create delivery tracking table for executive summary
-- Script: 46-create-delivery-tracking-table.sql

-- Create delivery_tracking table
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_date DATE NOT NULL,
  milk_gallons INTEGER DEFAULT 0,
  bread_delivered INTEGER DEFAULT 0,
  egg_trays INTEGER DEFAULT 0,
  misc_items TEXT,
  goal_achieved BOOLEAN DEFAULT false,
  cost_milk DECIMAL(10,2) DEFAULT 0.00,
  cost_eggs DECIMAL(10,2) DEFAULT 0.00,
  cost_bread DECIMAL(10,2) DEFAULT 0.00,
  additional_cost DECIMAL(10,2) DEFAULT 0.00,
  improvement_areas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.volunteers(id),
  notes TEXT
);

-- Add comments for documentation
COMMENT ON TABLE public.delivery_tracking IS 'Monthly delivery tracking for executive summary and reporting';
COMMENT ON COLUMN public.delivery_tracking.delivery_date IS 'Date of the monthly delivery';
COMMENT ON COLUMN public.delivery_tracking.milk_gallons IS 'Number of milk gallons delivered';
COMMENT ON COLUMN public.delivery_tracking.bread_delivered IS 'Number of bread items delivered';
COMMENT ON COLUMN public.delivery_tracking.egg_trays IS 'Number of egg trays delivered';
COMMENT ON COLUMN public.delivery_tracking.misc_items IS 'Miscellaneous items delivered';
COMMENT ON COLUMN public.delivery_tracking.goal_achieved IS 'Whether the delivery goal was achieved';
COMMENT ON COLUMN public.delivery_tracking.cost_milk IS 'Cost for milk items';
COMMENT ON COLUMN public.delivery_tracking.cost_eggs IS 'Cost for egg items';
COMMENT ON COLUMN public.delivery_tracking.cost_bread IS 'Cost for bread items';
COMMENT ON COLUMN public.delivery_tracking.additional_cost IS 'Additional costs incurred';
COMMENT ON COLUMN public.delivery_tracking.improvement_areas IS 'Areas for improvement noted';

-- Create index on delivery_date for efficient queries
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_date ON public.delivery_tracking(delivery_date);

-- Create unique constraint on delivery_date to prevent duplicate entries for the same month
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_tracking_unique_date ON public.delivery_tracking(delivery_date);

-- Insert sample data for the 12 months based on the image
INSERT INTO public.delivery_tracking (delivery_date, milk_gallons, bread_delivered, egg_trays, misc_items, goal_achieved, cost_milk, cost_eggs, cost_bread, additional_cost, improvement_areas) VALUES
  ('2025-01-11', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-02-10', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-03-09', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-04-13', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-05-10', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-06-08', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-07-13', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-08-17', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-09-16', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-10-12', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-11-07', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, ''),
  ('2025-12-14', 0, 0, 0, '', false, 0.00, 0.00, 0.00, 0.00, '')
ON CONFLICT (delivery_date) DO NOTHING;

-- Verify the table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'delivery_tracking' 
ORDER BY ordinal_position;

-- Show sample data
SELECT * FROM public.delivery_tracking ORDER BY delivery_date;
