-- project-files bucket (PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-files', 'project-files', FALSE, 52428800, ARRAY['application/pdf', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- generated-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('generated-images', 'generated-images', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "User files access" ON storage.objects FOR ALL
  USING (bucket_id = 'project-files' AND auth.uid()::TEXT = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'project-files' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "User images access" ON storage.objects FOR ALL
  USING (bucket_id = 'generated-images' AND auth.uid()::TEXT = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'generated-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
