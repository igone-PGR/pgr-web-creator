
-- Drop the overly permissive public SELECT policy on projects
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

-- Replace with admin-only SELECT policy
CREATE POLICY "Admins can view all projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
