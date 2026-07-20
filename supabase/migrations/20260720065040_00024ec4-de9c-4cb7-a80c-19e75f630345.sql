
DROP POLICY IF EXISTS "project_photos_public_read" ON storage.objects;

-- Only service role can list; public URLs still work for the generated sites (public bucket bypasses RLS on direct GET).
CREATE POLICY "project_photos_service_read"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'project-photos');
