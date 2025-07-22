-- Create storage bucket for neighborhood assets
INSERT INTO storage.buckets (id, name, public) VALUES ('neighborhood-assets', 'neighborhood-assets', true);

-- Create storage policies for neighborhood assets
CREATE POLICY "Neighborhood assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'neighborhood-assets');

-- Allow neighborhood admins to upload assets
CREATE POLICY "Neighborhood admins can upload assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'neighborhood-assets' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE created_by = auth.uid()
  )
);

-- Allow neighborhood admins to update their assets
CREATE POLICY "Neighborhood admins can update their assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'neighborhood-assets' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE created_by = auth.uid()
  )
);

-- Allow neighborhood admins to delete their assets
CREATE POLICY "Neighborhood admins can delete their assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'neighborhood-assets' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE created_by = auth.uid()
  )
);