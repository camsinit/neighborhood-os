-- Create debug_settings table for Super Admin preferences
CREATE TABLE public.debug_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS on debug_settings
ALTER TABLE public.debug_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for debug_settings
-- Only super admins can access debug settings
CREATE POLICY "Super admins can manage debug settings"
ON public.debug_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
  AND auth.uid() = debug_settings.user_id
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
  AND auth.uid() = debug_settings.user_id
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_debug_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_debug_settings_updated_at
  BEFORE UPDATE ON public.debug_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debug_settings_updated_at();