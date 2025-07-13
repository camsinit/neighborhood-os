import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create a Supabase client with the service role key for admin permissions
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Interface for onboarding series request
 */
interface OnboardingSeriesRequest {
  userEmail: string;
  firstName: string;
  neighborhoodName: string;
  userId: string;
  neighborhoodId: string;
}

/**
 * Queue the complete 7-part onboarding email series
 * Called when a user completes onboarding after accepting an invite
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { 
      userEmail, 
      firstName, 
      neighborhoodName,
      userId,
      neighborhoodId
    }: OnboardingSeriesRequest = await req.json();

    // Validate required fields
    if (!userEmail || !firstName || !neighborhoodName || !userId || !neighborhoodId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: userEmail, firstName, neighborhoodName, userId, neighborhoodId" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Queuing onboarding series for ${firstName} (${userEmail}) in ${neighborhoodName}`);

    // Create the 7-part email series with proper intervals
    const emailEntries = [];
    const now = new Date();

    for (let i = 1; i <= 7; i++) {
      const scheduledFor = new Date(now);
      
      // Schedule emails at increasing intervals:
      // Email 1: Immediate (0 days)
      // Email 2: 1 day
      // Email 3: 3 days  
      // Email 4: 7 days
      // Email 5: 14 days
      // Email 6: 21 days
      // Email 7: 30 days
      const dayOffsets = [0, 1, 3, 7, 14, 21, 30];
      scheduledFor.setDate(now.getDate() + dayOffsets[i - 1]);

      emailEntries.push({
        recipient_email: userEmail,
        template_type: 'onboarding_series',
        template_data: {
          firstName,
          neighborhoodName,
          emailNumber: i
        },
        scheduled_for: scheduledFor.toISOString(),
        neighborhood_id: neighborhoodId,
        user_id: userId
      });
    }

    // Insert all emails into the queue
    const { error } = await supabase
      .from('email_queue')
      .insert(emailEntries);

    if (error) {
      console.error("Error queuing onboarding series:", error);
      throw error;
    }

    console.log(`Successfully queued ${emailEntries.length} onboarding emails for ${firstName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Onboarding series queued successfully",
        emailCount: emailEntries.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in queue-onboarding-series function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to queue onboarding series" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);