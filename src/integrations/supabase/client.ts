// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://edzjbrjxrgsnynolppss.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkempicmp4cmdzbnlub2xwcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzM2ODksImV4cCI6MjA0OTUwOTY4OX0.ADWwYJb0qTmEjFD7R1ASdJEvdPeSB_B5Dnr4mQZU1Vo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);