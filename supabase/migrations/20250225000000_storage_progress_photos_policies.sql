-- Storage policies for progress-photos bucket
-- Run this after creating the bucket "progress-photos" in Dashboard → Storage (as public bucket).
-- These policies allow authenticated users to upload and everyone to read (public bucket).

-- Allow authenticated users to upload (INSERT) to progress-photos
CREATE POLICY "Authenticated users can upload progress photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'progress-photos');

-- Allow public read (SELECT) so getPublicUrl() works for progress-photos
CREATE POLICY "Public read for progress-photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'progress-photos');

-- Allow authenticated users to delete their own objects (owner_id is set by Storage on upload; type is text)
CREATE POLICY "Users can delete own progress photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'progress-photos'
  AND owner_id = (auth.uid())::text
);

-- Allow authenticated users to update their own (e.g. for overwrite)
CREATE POLICY "Users can update own progress photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'progress-photos'
  AND owner_id = (auth.uid())::text
);
