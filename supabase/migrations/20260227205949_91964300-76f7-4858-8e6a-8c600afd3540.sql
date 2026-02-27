
-- Remove overly permissive public INSERT policy
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.projects;

-- Replace with authenticated-only INSERT (as a safety net; primary inserts use service role)
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
