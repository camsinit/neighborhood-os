
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.6.2';

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

// Initialize Anthropic client
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY') || '';
const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

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
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('name, description')
      .eq('id', this.neighborhoodId)
      .single();
      
    if (error) {
      console.error('Error fetching neighborhood:', error);
      return null;
    }
    
    return data;
  }

  /**
   * Fetch upcoming events in the neighborhood
   */
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, start_time, end_time, location')
      .eq('neighborhood_id', this.neighborhoodId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(10);
      
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return data;
  }
  
  /**
   * Fetch available skills in the neighborhood
   */
  async getSkills() {
    const { data, error } = await supabase
      .from('skills_exchange')
      .select('id, title, description, type, created_by')
      .eq('neighborhood_id', this.neighborhoodId)
      .eq('status', 'active')
      .limit(10);
      
    if (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
    
    return data;
  }
  
  /**
   * Fetch recent safety updates in the neighborhood
   */
  async getSafetyUpdates() {
    const { data, error } = await supabase
      .from('safety_updates')
      .select('id, title, description, created_at, update_type')
      .eq('neighborhood_id', this.neighborhoodId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('Error fetching safety updates:', error);
      return [];
    }
    
    return data;
  }
  
  /**
   * Format the fetched data into a string that provides context to Claude
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
    
    // Format the context for Claude
    let context = `
NEIGHBORHOOD CONTEXT
--------------------
`;
    
    // Add neighborhood info
    if (neighborhood) {
      context += `
Neighborhood: ${neighborhood.name}
${neighborhood.description ? `Description: ${neighborhood.description}` : ''}

`;
    }
    
    // Add events
    context += `
UPCOMING EVENTS
--------------
`;
    
    if (events.length > 0) {
      events.forEach(event => {
        const startDate = new Date(event.start_time).toLocaleString();
        const endDate = new Date(event.end_time).toLocaleString();
        
        context += `
- Event: ${event.title} (ID: ${event.id})
  Description: ${event.description || 'No description provided'}
  When: ${startDate} to ${endDate}
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
  Type: ${skill.type === 'offer' ? 'Offering help' : 'Requesting help'}
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
  Type: ${update.update_type || 'General'}
  Posted: ${updateDate}
  Details: ${update.description || 'No details provided'}
`;
      });
    } else {
      context += `
No recent safety updates found.
`;
    }
    
    return { contextString: context, contextData };
  }
}

/**
 * ResponseProcessor class handles response formatting and special item references
 */
class ResponseProcessor {
  /**
   * Format special item references in the AI response
   */
  processResponseForItemReferences(response: string, contextData: any) {
    // Process events
    if (contextData.events) {
      contextData.events.forEach((event: any) => {
        const eventRegex = new RegExp(`(^|\\s)"?${event.title}"?(\\s|$|\\.|,|:)`, 'gi');
        response = response.replace(eventRegex, ` [EVENT:${event.id}:${event.title}] `);
      });
    }
    
    // Process skills
    if (contextData.skills) {
      contextData.skills.forEach((skill: any) => {
        const skillRegex = new RegExp(`(^|\\s)"?${skill.title}"?(\\s|$|\\.|,|:)`, 'gi');
        response = response.replace(skillRegex, ` [SKILL:${skill.id}:${skill.title}] `);
      });
    }
    
    // Process safety updates
    if (contextData.safetyUpdates) {
      contextData.safetyUpdates.forEach((update: any) => {
        const updateRegex = new RegExp(`(^|\\s)"?${update.title}"?(\\s|$|\\.|,|:)`, 'gi');
        response = response.replace(updateRegex, ` [SAFETY:${update.id}:${update.title}] `);
      });
    }
    
    return response;
  }
}

/**
 * AnthropicHandler class manages interactions with the Anthropic API
 */
class AnthropicHandler {
  /**
   * Format system prompt based on the action type and context
   */
  formatSystemPrompt(context: string, actionType?: string) {
    let basePrompt = `
You are a friendly and helpful AI assistant for a neighborhood community app.

IMPORTANT FORMATTING INSTRUCTIONS:
- Provide responses that are clear, concise, and suitable for all age groups (7-70)
- Use simple language that everyone can understand
- Use headers, bullet points, and short paragraphs
- When referring to specific events, skills, or safety updates from the context, use their exact titles

${context}

When referencing specific items from the context, always use their exact titles so they can be properly linked in the UI.
`;

    // Add specific instructions based on action type
    if (actionType) {
      switch (actionType) {
        case 'Events Question':
          basePrompt += `
Focus on providing information about upcoming events in the neighborhood. Highlight event details, times, and locations if available.
`;
          break;
        case 'Skills & Help':
          basePrompt += `
Focus on matching the user's needs with available skills and help offerings in the neighborhood. Suggest relevant skills that might address their question.
`;
          break;
        default:
          // No special instructions needed
          break;
      }
    }

    return basePrompt;
  }

  /**
   * Handle the entire Claude request/response process
   */
  async processRequest(message: string, context: string, contextData: any, actionType?: string) {
    try {
      // Create system prompt
      const systemPrompt = this.formatSystemPrompt(context, actionType);
      
      // Request completion from Claude
      const completion = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      });
      
      // Process the response
      const responseProcessor = new ResponseProcessor();
      const processedResponse = responseProcessor.processResponseForItemReferences(
        completion.content[0].text,
        contextData
      );
      
      return {
        response: processedResponse,
        context: contextData
      };
    } catch (error) {
      console.error('Error processing request with Anthropic:', error);
      throw new Error('Failed to get a response from Claude');
    }
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
    if (actionType) {
      console.log(`Action type: ${actionType}`);
    }
    
    // Process data to create context
    const dataProcessor = new DataProcessor(userId, neighborhoodId);
    const { contextString, contextData } = await dataProcessor.formatDataForContext();
    
    // Handle the request with Anthropic
    const anthropicHandler = new AnthropicHandler();
    const result = await anthropicHandler.processRequest(message, contextString, contextData, actionType);
    
    // Return the result
    return new Response(
      JSON.stringify(result),
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
