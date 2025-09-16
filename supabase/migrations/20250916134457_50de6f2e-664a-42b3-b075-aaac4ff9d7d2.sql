-- Add banner_image_url field to groups table for cover photos
ALTER TABLE public.groups 
ADD COLUMN banner_image_url text;