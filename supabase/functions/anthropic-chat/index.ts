
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
        .select('id, title, description, request_type, user_id, skill_category')
        .eq('neighborhood_id', this.neighborhoodId)
        .eq('is_archived', false)
        .limit(10);
        
      if (error) {
        console.error('Error fetching skills:', error);
        return [];
      }
      
      // Get user profiles for skill owners
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(skill => skill.user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
          
        if (!profilesError && profiles) {
          // Add display names to skills
          data.forEach(skill => {
            const owner = profiles.find(p => p.id === skill.user_id);
            skill.owner_name = owner?.display_name || 'Neighbor';
          });
        }
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
      skills: skills.map(skill => ({ 
        id: skill.id, 
        title: skill.title,
        category: skill.skill_category,
        type: skill.request_type,
        owner: skill.owner_name || 'Neighbor'
      })),
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
  Category: ${skill.skill_category || 'General'}
  Owner: ${skill.owner_name || 'Neighbor'}
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
    
    return { contextString: context, contextData, rawData: { neighborhood, events, skills, safetyUpdates } };
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
    const { contextString, contextData, rawData } = await dataProcessor.formatDataForContext();
    
    // Generate an improved fallback response based on the message content and available data
    const improvedResponse = generateImprovedResponse(message, contextString, rawData);
    
    // Return the result with simplified data
    return new Response(
      JSON.stringify({
        response: improvedResponse,
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
 * Generate an improved response when the AI service is unavailable
 * This function uses basic keyword matching to provide more relevant responses
 */
function generateImprovedResponse(message: string, context: string, rawData: any): string {
  const lowerMessage = message.toLowerCase();
  const { neighborhood, events, skills, safetyUpdates } = rawData;
  
  // Check for meme-related questions
  if (lowerMessage.includes('meme') || lowerMessage.includes('memes')) {
    // Look for skills related to memes, art, or design
    const relevantSkills = skills.filter(skill => 
      skill.title.toLowerCase().includes('meme') ||
      skill.title.toLowerCase().includes('design') ||
      skill.title.toLowerCase().includes('art') ||
      skill.title.toLowerCase().includes('photo') ||
      (skill.description && (
        skill.description.toLowerCase().includes('meme') ||
        skill.description.toLowerCase().includes('design') ||
        skill.description.toLowerCase().includes('art') ||
        skill.description.toLowerCase().includes('photo')
      ))
    );
    
    if (relevantSkills.length > 0) {
      let response = "I found some neighbors who might be able to help with memes:\n\n";
      relevantSkills.forEach(skill => {
        response += `- ${skill.owner_name || 'A neighbor'} ${skill.request_type === 'offer' ? 'offers' : 'requested'}: ${skill.title}\n`;
      });
      response += "\nYou can check the Skills page for more details and to connect with them!";
      return response;
    } else {
      return "I don't see anyone specifically offering meme creation skills right now. You could post your own request for help with memes in the Skills section, or check back later as neighbors update their skill offerings.";
    }
  }
  
  // Check for event-related questions
  if (lowerMessage.includes('event') || lowerMessage.includes('happening') || lowerMessage.includes('calendar')) {
    if (events.length > 0) {
      let response = `Here are some upcoming events in ${neighborhood?.name || 'your neighborhood'}:\n\n`;
      events.slice(0, 3).forEach(event => {
        const eventDate = new Date(event.time).toLocaleString();
        response += `- ${event.title} on ${eventDate} at ${event.location || 'location TBD'}\n`;
      });
      if (events.length > 3) {
        response += `\nAnd ${events.length - 3} more events. Check the Calendar page for all upcoming events!`;
      } else {
        response += "\nCheck the Calendar page for more details!";
      }
      return response;
    } else {
      return "There are no upcoming events scheduled at the moment. You can add a new event through the Calendar page!";
    }
  }
  
  // Check for skill or help related questions
  if (lowerMessage.includes('skill') || lowerMessage.includes('help') || lowerMessage.includes('offer') || lowerMessage.includes('need')) {
    // See if there's a specific skill category mentioned
    let categorySearch = '';
    const categories = ['art', 'cooking', 'music', 'technology', 'gardening', 'babysitting', 'tutoring', 'repairs', 'transportation'];
    
    for (const category of categories) {
      if (lowerMessage.includes(category)) {
        categorySearch = category;
        break;
      }
    }
    
    if (categorySearch) {
      const matchingSkills = skills.filter(skill => 
        skill.title.toLowerCase().includes(categorySearch) || 
        skill.skill_category?.toLowerCase().includes(categorySearch) ||
        (skill.description && skill.description.toLowerCase().includes(categorySearch))
      );
      
      if (matchingSkills.length > 0) {
        let response = `I found ${matchingSkills.length} neighbors offering or requesting help with ${categorySearch}:\n\n`;
        matchingSkills.forEach(skill => {
          response += `- ${skill.owner_name || 'A neighbor'} ${skill.request_type === 'offer' ? 'offers' : 'requested'}: ${skill.title}\n`;
        });
        response += "\nCheck out the Skills page for more details!";
        return response;
      } else {
        return `I don't see any current listings related to ${categorySearch}. You could post your own skill request or offering in the Skills section!`;
      }
    }
    
    if (skills.length > 0) {
      let response = "Here are some skills being offered or requested in your neighborhood:\n\n";
      skills.slice(0, 5).forEach(skill => {
        response += `- ${skill.owner_name || 'A neighbor'} ${skill.request_type === 'offer' ? 'offers' : 'requested'}: ${skill.title}\n`;
      });
      if (skills.length > 5) {
        response += `\nAnd ${skills.length - 5} more. Visit the Skills page to see all listings!`;
      } else {
        response += "\nVisit the Skills page to see more details!";
      }
      return response;
    } else {
      return "There are no skills currently being offered or requested. You can be the first to add one through the Skills page!";
    }
  }
  
  // Check for safety-related questions
  if (lowerMessage.includes('safety') || lowerMessage.includes('emergency') || lowerMessage.includes('alert')) {
    if (safetyUpdates.length > 0) {
      let response = "Here are the most recent safety updates:\n\n";
      safetyUpdates.forEach(update => {
        const updateDate = new Date(update.created_at).toLocaleString();
        response += `- ${update.title} (posted ${updateDate})\n`;
      });
      response += "\nVisit the Safety page for more information and to add your own updates.";
      return response;
    } else {
      return "There are no recent safety updates in your neighborhood. You can add safety information through the Safety page if needed.";
    }
  }
  
  // Generic response if no specific topic is matched
  return `I'm your neighborhood assistant for ${neighborhood?.name || 'your community'}. I can help you learn about events (${events.length} upcoming), skills offered by neighbors (${skills.length} available), and safety updates (${safetyUpdates.length} recent). Try asking me specific questions about these topics!`;
}
