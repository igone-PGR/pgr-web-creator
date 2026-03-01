
-- =============================================
-- FIX: Convert all RESTRICTIVE policies to PERMISSIVE
-- PostgreSQL requires at least one PERMISSIVE policy for RLS to work correctly.
-- RESTRICTIVE policies only narrow access when combined with PERMISSIVE ones.
-- =============================================

-- === user_roles ===
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- === profiles ===
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile"
  ON public.profiles AS PERMISSIVE
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- === projects ===
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;

CREATE POLICY "Admins can view all projects"
  ON public.projects AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update projects"
  ON public.projects AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete projects"
  ON public.projects AS PERMISSIVE
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role inserts via edge functions; this policy is a fallback
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects AS PERMISSIVE
  FOR INSERT TO authenticated
  WITH CHECK (true);
