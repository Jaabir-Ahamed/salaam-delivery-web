-- Simple admin check
-- Run this to verify your admin status

SELECT 
  'Current User' as info,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email;

SELECT 
  'Admin Status' as info,
  id,
  email,
  name,
  role,
  active
FROM public.admins
WHERE id = auth.uid();

SELECT 
  'Volunteer Status' as info,
  id,
  email,
  name,
  role,
  active
FROM public.volunteers
WHERE id = auth.uid(); 