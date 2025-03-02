
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create a Supabase client with the service role key for admin permissions
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Edge Function to handle waitlist signups
 * 
 * This function receives an email address and adds it to the waitlist
 * table in the database. It includes validation and error handling.
 */
serve(async (req) => {
  // Set up CORS headers for the response
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    // Parse the request body to get the email
    const requestData = await req.json();
    const { email } = requestData;

    // Validate email
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { headers, status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { headers, status: 400 }
      );
    }

    console.log(`Processing waitlist signup for email: ${email}`);
    
    // Insert email into waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert({ email })
      .select("id, email");

    // Check for errors
    if (error) {
      console.error("Database error:", error);
      
      // Handle duplicate email error specifically
      if (error.code === '23505') { // Unique violation
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "You're already on our waitlist!"
          }),
          { headers, status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Failed to join waitlist" }),
        { headers, status: 500 }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully joined the waitlist",
        data
      }),
      { headers, status: 200 }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    // General error response
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers, status: 500 }
    );
  }
});
