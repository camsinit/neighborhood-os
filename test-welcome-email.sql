-- Test Welcome Email Script
-- Run this in the Supabase SQL Editor to send a test welcome email

SELECT 
  net.http_post(
    url := 'https://nnwzfliblfuldwxpuata.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.jwt.claims', true)::json->>'token'
    ),
    body := jsonb_build_object(
      'recipientEmail', 'your-test-email@example.com',  -- Replace with your actual email
      'firstName', 'Test User',                         -- Replace with test name
      'neighborhoodName', 'Test Neighborhood'          -- Replace with your neighborhood name
    )
  ) as response;

-- Alternative: If the above doesn't work due to authentication, try this simpler version
-- that calls the function directly using Supabase's function system:

-- SELECT functions.send_welcome_email(
--   'your-test-email@example.com',
--   'Test User', 
--   'Test Neighborhood'
-- );

-- Instructions:
-- 1. Replace 'your-test-email@example.com' with your actual email address
-- 2. Replace 'Test User' with any test first name
-- 3. Replace 'Test Neighborhood' with your actual neighborhood name
-- 4. Run this script in the Supabase SQL Editor
-- 5. Check your email for the welcome message