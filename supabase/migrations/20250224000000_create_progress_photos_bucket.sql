-- Create the progress-photos bucket so uploads don't return 400 (bucket missing).
-- If your Supabase version uses a different storage.buckets schema, create the bucket
-- manually in Dashboard → Storage → New bucket → name: progress-photos, public: true.
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
