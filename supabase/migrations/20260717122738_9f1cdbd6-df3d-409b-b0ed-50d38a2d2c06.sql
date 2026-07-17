-- Remove the overly permissive storage policies on project-photos.
-- Uploads must now go through the `upload-project-asset` edge function (service_role).
-- Public reads via CDN URL still work because public buckets bypass RLS on object fetch;
-- removing the SELECT policy also prevents anonymous listing of the bucket.

DROP POLICY IF EXISTS "Anyone can upload project photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project photos" ON storage.objects;