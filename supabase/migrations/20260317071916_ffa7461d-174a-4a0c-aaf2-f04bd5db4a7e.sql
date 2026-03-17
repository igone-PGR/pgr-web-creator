-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

-- Allow anyone to upload files to the bucket (photos uploaded during form submission)
CREATE POLICY "Anyone can upload project photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'project-photos');

-- Allow anyone to read project photos (they need to be public)
CREATE POLICY "Anyone can view project photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'project-photos');