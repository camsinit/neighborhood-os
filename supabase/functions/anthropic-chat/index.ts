
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Updated CORS Headers for browser access
// Include x-application-name in the allowed headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * DataProcessor class handles all data preparation and fetching
 * from Supabase to provide context to Claude
 */
class DataProcessor {
  userId: string;
  neighborhoodId: string;

  constructor(userId: string, neighborhoodId: string) {
    this.userId = userId;
    this.neighborhoodId = neighborhoodId;
  }

  /**
   * Fetch neighborhood information
   */
  async getNeighborhoodInfo() {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('name')
        .eq('id', this.neighborhoodId)
        .single();
        
      if (error) {
        console.error('Error fetching neighborhood:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error in getNeighborhoodInfo:', err);
      return null;
    }
  }

  /**
   * Fetch upcoming events in the neighborhood
   */
  async getEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, location, time')
        .eq('neighborhood_id', this.neighborhoodId)
        .gte('time', new Date().toISOString())
        .order('time', { ascending: true })
        .limit(10);
        
      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }
      
      return data;
    } catch (err) {
      console.error('Error in getEvents:', err);
      return [];
    }
  }
  
  /**
   * Fetch available skills in the neighborhood
   */
  async getSkills() {
    try {
      const { data, error } = await supabase
        .from('skills_exchange')
        .select('id, title, description, request_type')
        .eq('neighborhood_id', this.neighborhoodId)
        .eq('is_archived', false)
        .limit(10);
        
      if (error) {
        console.error('Error fetching skills:', error);
        return [];
      }
      
      return data;
    } catch (err) {
      console.error('Error in getSkills:', err);
      return [];
    }
  }
  
  /**
   * Fetch recent safety updates in the neighborhood
   */
  async getSafetyUpdates() {
    try {
      const { data, error } = await supabase
        .from('safety_updates')
        .select('id, title, description, type, created_at')
        .eq('neighborhood_id', this.neighborhoodId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching safety updates:', error);
        return [];
      }
      
      return data;
    } catch (err) {
      console.error('Error in getSafetyUpdates:', err);
      return [];
    }
  }
  
  /**
   * Format the fetched data into a string that provides context
   */
  async formatDataForContext() {
    // Gather all the data
    const [neighborhood, events, skills, safetyUpdates] = await Promise.all([
      this.getNeighborhoodInfo(),
      this.getEvents(),
      this.getSkills(),
      this.getSafetyUpdates()
    ]);
    
    // Context data for including in the response
    const contextData = {
      events: events.map(event => ({ id: event.id, title: event.title })),
      skills: skills.map(skill => ({ id: skill.id, title: skill.title })),
      safetyUpdates: safetyUpdates.map(update => ({ id: update.id, title: update.title }))
    };
    
    // Format the context for the assistant
    let context = `
NEIGHBORHOOD CONTEXT
--------------------
`;
    
    // Add neighborhood info
    if (neighborhood) {
      context += `
Neighborhood: ${neighborhood.name}

`;
    }
    
    // Add events
    context += `
UPCOMING EVENTS
--------------
`;
    
    if (events.length > 0) {
      events.forEach(event => {
        const eventDate = new Date(event.time).toLocaleString();
        
        context += `
- Event: ${event.title} (ID: ${event.id})
  Description: ${event.description || 'No description provided'}
  When: ${eventDate}
  Where: ${event.location || 'Location not specified'}
`;
      });
    } else {
      context += `
No upcoming events found.
`;
    }
    
    // Add skills
    context += `
AVAILABLE SKILLS AND HELP
------------------------
`;
    
    if (skills.length > 0) {
      skills.forEach(skill => {
        context += `
- Skill: ${skill.title} (ID: ${skill.id})
  Type: ${skill.request_type === 'offer' ? 'Offering help' : 'Requesting help'}
  Description: ${skill.description || 'No description provided'}
`;
      });
    } else {
      context += `
No skills or help offerings found.
`;
    }
    
    // Add safety updates
    context += `
RECENT SAFETY UPDATES
-------------------
`;
    
    if (safetyUpdates.length > 0) {
      safetyUpdates.forEach(update => {
        const updateDate = new Date(update.created_at).toLocaleString();
        
        context += `
- Update: ${update.title} (ID: ${update.id})
  Type: ${update.type || 'General'}
  Posted: ${updateDate}
  Details: ${update.description || 'No details provided'}
`;
      });
    } else {
      context += `
No recent safety updates found.
`;
    }
    
    console.log(`Prepared neighborhood context with: { eventCount: ${events.length}, skillCount: ${skills.length}, safetyUpdateCount: ${safetyUpdates.length} }`);
    console.log(`Message length: ${context.length} characters`);
    
    return { contextString: context, contextData };
  }
}

// Main handler for the edge function
serve(async (req) => {
  // Handle OPTIONS request for CORS - improved to return proper headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }
  
  try {
    // Parse request body
    const requestData = await req.json();
    const { message, userId, neighborhoodId, actionType } = requestData;
    
    // Validate required fields
    if (!message || !userId || !neighborhoodId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: message, userId, or neighborhoodId"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    console.log(`Processing request for user ${userId} in neighborhood ${neighborhoodId}`);
    
    // Process data to create context
    const dataProcessor = new DataProcessor(userId, neighborhoodId);
    const { contextString, contextData } = await dataProcessor.formatDataForContext();
    
    // For now, return a simulated AI response since we're having issues with Anthropic
    const simulatedResponse = generateFallbackResponse(message, contextString);
    
    // Return the result with simplified data
    return new Response(
      JSON.stringify({
        response: simulatedResponse,
        context: {} // Empty context to disable interactive elements
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/**
 * Generate a fallback response when the AI service is unavailable
 */
function generateFallbackResponse(message: string, context: string): string {
  // Simple set of keywords to match against for basic responses
  if (message.toLowerCase().includes('event') || message.toLowerCase().includes('calendar')) {
    return "I can see there are several events in your neighborhood. You can check the calendar page for detailed information about upcoming events.";
  }
  
  if (message.toLowerCase().includes('skill') || message.toLowerCase().includes('help')) {
    return "Your neighbors have various skills to share. Check the Skills page to see who can help with what you need.";
  }
  
  if (message.toLowerCase().includes('safety') || message.toLowerCase().includes('emergency')) {
    return "Safety is important in your neighborhood. You can view recent safety updates on the Safety page.";
  }
  
  return "I'm your neighborhood assistant. I can help you learn about events, skills offered by your neighbors, and safety updates. Try asking me about these topics!";
}
