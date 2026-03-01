-- Drop the overly permissive INSERT policy on projects
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;

-- Replace with a restrictive policy that blocks client-side inserts
-- (all inserts go through edge functions using service role, which bypasses RLS)
CREATE POLICY "Block client project inserts"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (false);