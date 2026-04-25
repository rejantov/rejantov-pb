-- Create public storage bucket for blog media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read uploaded files
CREATE POLICY "Public read blog-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-media');

-- Allow authenticated admins to upload
CREATE POLICY "Auth upload blog-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-media');

-- Allow authenticated admins to delete
CREATE POLICY "Auth delete blog-media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blog-media');
