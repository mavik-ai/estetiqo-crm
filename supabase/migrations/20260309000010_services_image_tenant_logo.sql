-- Serviços: descrição e imagem
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Clínica: logo
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Storage buckets públicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('service-images', 'service-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('clinic-logos',   'clinic-logos',   true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies
CREATE POLICY "service_images_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-images');
CREATE POLICY "service_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "service_images_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'service-images');

CREATE POLICY "clinic_logos_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'clinic-logos');
CREATE POLICY "clinic_logos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'clinic-logos');
CREATE POLICY "clinic_logos_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'clinic-logos');
