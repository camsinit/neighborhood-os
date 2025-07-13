-- Create email queue table for managing all email sends
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'welcome', 'onboarding_1', 'onboarding_2', etc.
  template_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'bounced', 'complained', 'failed'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  resend_email_id TEXT NULL, -- Store Resend's email ID for tracking
  error_message TEXT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  neighborhood_id UUID NULL,
  user_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for email queue access
CREATE POLICY "System can manage email queue" 
ON public.email_queue 
FOR ALL 
USING (true);

-- Create indexes for efficient querying
CREATE INDEX idx_email_queue_status_scheduled ON public.email_queue(status, scheduled_for);
CREATE INDEX idx_email_queue_user_id ON public.email_queue(user_id);
CREATE INDEX idx_email_queue_resend_id ON public.email_queue(resend_email_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_email_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON public.email_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_email_queue_updated_at();