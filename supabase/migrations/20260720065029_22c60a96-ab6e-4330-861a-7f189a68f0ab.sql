
-- 1) SECURITY DEFINER function hardening
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Storage policies for project-photos bucket
-- Public read stays (needed for generated websites); writes locked to service role.
DROP POLICY IF EXISTS "project_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "project_photos_service_write" ON storage.objects;
DROP POLICY IF EXISTS "project_photos_service_update" ON storage.objects;
DROP POLICY IF EXISTS "project_photos_service_delete" ON storage.objects;

CREATE POLICY "project_photos_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'project-photos');

CREATE POLICY "project_photos_service_write"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'project-photos');

CREATE POLICY "project_photos_service_update"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'project-photos')
WITH CHECK (bucket_id = 'project-photos');

CREATE POLICY "project_photos_service_delete"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'project-photos');
