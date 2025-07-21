
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { WelcomeEmail } from './_templates/welcome-email.tsx';
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Create Supabase client for database operations
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a logger for this function
const logger = createLogger('send-welcome-email');

/**
 * Unified Email Parameter Resolution
 * Uses our centralized system to resolve user names, URLs, and branding
 */

// Resolve user display name with proper fallbacks
function resolveUserDisplayName(profile: any, email: string): string {
  if (profile?.display_name) return profile.display_name;
  if (profile?.first_name) return profile.first_name;
  
  // Extract name from email as fallback
  const localPart = email.split('@')[0];
  const cleanName = localPart
    .replace(/[._+-]/g, ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
  
  return cleanName || 'Neighbor';
}

// Generate consistent URLs with UTM tracking
function generateWelcomeUrls(baseUrl: string, recipientId?: string) {
  const addTracking = (url: string, content?: string) => {
    const urlObj = new URL(url, baseUrl);
    urlObj.searchParams.set('utm_source', 'email');
    urlObj.searchParams.set('utm_medium', 'email');
    urlObj.searchParams.set('utm_campaign', 'welcome_email');
    if (content) urlObj.searchParams.set('utm_content', content);
    if (recipientId) urlObj.searchParams.set('utm_content', `recipient_${recipientId}`);
    return urlObj.toString();
  };

  return {
    homeUrl: addTracking('/dashboard', 'welcome_dashboard'),
    skillsUrl: addTracking('/skills', 'welcome_skills'),  
    createEventUrl: addTracking('/events/create', 'welcome_events'),
  };
}

/**
 * Interface for welcome email request - now uses resolved data
 */
interface WelcomeEmailRequest {
  recipientEmail: string;
  firstName?: string;        // Optional - will resolve from profile
  neighborhoodName?: string; // Optional - will resolve from database
  userId?: string;          // Optional - for better personalization and tracking
}

/**
 * Enhanced edge function to send welcome emails using unified parameter system
 * Automatically resolves names, neighborhoods, and generates tracked URLs
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { 
      recipientEmail, 
      firstName,
      neighborhoodName,
      userId
    }: WelcomeEmailRequest = await req.json();

    // Validate required fields
    if (!recipientEmail) {
      logger.error("Missing required field: recipientEmail");
      return errorResponse("Missing required field: recipientEmail", 400);
    }

    logger.info(`Sending welcome email to ${recipientEmail}${userId ? ` (user: ${userId})` : ''}`);

    // Resolve user profile for better personalization
    let profile = null;
    let resolvedNeighborhoodName = neighborhoodName || 'your neighborhood';
    
    if (userId) {
      try {
        // Get user profile for name resolution
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, first_name')
          .eq('id', userId)
          .single();
          
        profile = profileData;
        
        // Get user's neighborhood for proper context
        const { data: neighborhoodData } = await supabase
          .from('neighborhood_members')
          .select(`
            neighborhoods (
              name,
              city,
              state
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();
          
        if (neighborhoodData?.neighborhoods?.name) {
          resolvedNeighborhoodName = neighborhoodData.neighborhoods.name;
        }
        
        logger.info(`Resolved neighborhood: ${resolvedNeighborhoodName} for user ${userId}`);
      } catch (error) {
        logger.warn(`Could not resolve user profile for ${userId}:`, error);
        // Continue with fallbacks
      }
    }

    // Use unified name resolution system
    const recipientName = firstName || resolveUserDisplayName(profile, recipientEmail);
    
    // Generate URLs with consistent UTM tracking
    const baseUrl = "https://neighborhoodos.com";
    const { homeUrl, skillsUrl, createEventUrl } = generateWelcomeUrls(baseUrl, userId);

    logger.info(`Resolved recipient name: "${recipientName}" for neighborhood: "${resolvedNeighborhoodName}"`);

    // Prepare email parameters using unified system
    const emailParams = {
      recipientName,
      neighborhoodName: resolvedNeighborhoodName,
      homeUrl,
      skillsUrl,
      createEventUrl,
      fromName: 'neighborhoodOS',
      // Welcome-specific enhancements
      welcomeMessage: `Welcome to ${resolvedNeighborhoodName}! You're now connected with your neighbors through neighborhoodOS, a platform that helps local communities thrive together.`,
    };

    // Render React Email template
    const html = await renderAsync(
      React.createElement(WelcomeEmail, emailParams)
    );

    // Send the welcome email using consistent from address
    const emailResponse = await resend.emails.send({
      from: "neighborhoodOS <hello@updates.neighborhoodos.com>",
      to: [recipientEmail],
      subject: `Welcome to ${resolvedNeighborhoodName}, ${recipientName}! 👋`,
      html,
    });

    if (emailResponse.error) {
      logger.error("Resend API error:", emailResponse.error);
      return errorResponse(`Failed to send email: ${emailResponse.error.message}`, 500);
    }

    logger.info("Welcome email sent successfully:", emailResponse.data?.id);

    return successResponse({ 
      messageId: emailResponse.data?.id,
      resolvedData: {
        recipientName,
        neighborhoodName: resolvedNeighborhoodName,
        tracking: { homeUrl, skillsUrl, createEventUrl }
      }
    });

  } catch (error: any) {
    logger.error("Error in send-welcome-email function:", error);
    return errorResponse(error.message || "Failed to send welcome email");
  }
};

serve(handler);
