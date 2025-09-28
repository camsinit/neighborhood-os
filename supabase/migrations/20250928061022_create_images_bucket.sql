-- Create storage bucket for general images (group cover photos, etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Create RLS policies for the images bucket
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);
