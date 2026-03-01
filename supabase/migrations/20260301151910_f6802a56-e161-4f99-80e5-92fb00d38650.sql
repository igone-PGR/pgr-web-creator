
-- Block all client-side inserts to user_roles (role management via service role only)
CREATE POLICY "Block client role inserts"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Block all client-side updates to user_roles
CREATE POLICY "Block client role updates"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (false);

-- Block all client-side deletes to user_roles
CREATE POLICY "Block client role deletes"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (false);
