
// Supabase Edge Function to handle waitlist signups
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

// CORS headers to allow browser requests from any origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client using environment variables
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { email } = await req.json();

    // Basic validation
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Valid email is required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Validate email format using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log(`Processing waitlist signup for email: ${email}`);

    // Insert the email into the waitlist table
    const { data, error } = await supabaseClient
      .from("waitlist")
      .insert([{ email }])
      .select();

    if (error) {
      console.error("Error adding to waitlist:", error);
      
      // Check if it's a unique constraint violation (duplicate email)
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "This email is already on the waitlist" 
          }),
          { 
            status: 409, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
      
      throw error;
    }

    console.log("Successfully added to waitlist:", data);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully added to waitlist" 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Server error processing your request" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
