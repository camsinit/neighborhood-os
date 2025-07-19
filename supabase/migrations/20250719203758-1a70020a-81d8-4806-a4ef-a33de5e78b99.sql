
-- Add image_url column to safety_updates table to store uploaded image URLs
ALTER TABLE public.safety_updates 
ADD COLUMN image_url TEXT;

-- Create a dedicated storage bucket for safety update images
INSERT INTO storage.buckets (id, name, public)
VALUES ('safety_images', 'safety_images', true);

-- Create RLS policies for the safety_images bucket
CREATE POLICY "Anyone can view safety images" ON storage.objects
FOR SELECT USING (bucket_id = 'safety_images');

CREATE POLICY "Users can upload safety images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'safety_images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own safety images" ON storage.objects
FOR UPDATE USING (bucket_id = 'safety_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own safety images" ON storage.objects
FOR DELETE USING (bucket_id = 'safety_images' AND auth.uid()::text = (storage.foldername(name))[1]);
