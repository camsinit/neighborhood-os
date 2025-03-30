
// This Edge Function securely communicates with Anthropic's API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers to allow our web app to communicate with this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // Include x-application-name in the allowed headers
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
};

// Create a Supabase client for database operations
const getSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace('Bearer ', '') || '';
  
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    }
  );
};

// Fetch and filter neighborhood events (privacy-focused)
async function getNeighborhoodEvents(supabase: any, neighborhoodId: string) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(`
        id, 
        title, 
        description, 
        time, 
        location, 
        is_recurring
      `)
      .eq('neighborhood_id', neighborhoodId)
      .order('time', { ascending: true })
      .limit(10);
      
    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }
    
    // Further anonymize data by removing any potential PII from descriptions
    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description 
        ? sanitizeText(event.description) 
        : "No description provided",
      time: event.time,
      location: event.location,
      isRecurring: event.is_recurring
    }));
  } catch (err) {
    console.error("Exception in getNeighborhoodEvents:", err);
    return [];
  }
}

// Fetch and filter neighborhood skills (privacy-focused)
async function getNeighborhoodSkills(supabase: any, neighborhoodId: string) {
  try {
    const { data, error } = await supabase
      .from("skills_exchange")
      .select(`
        id, 
        title, 
        description, 
        skill_category,
        request_type
      `)
      .eq('neighborhood_id', neighborhoodId)
      .eq('is_archived', false)
      .limit(10);
      
    if (error) {
      console.error("Error fetching skills:", error);
      return [];
    }
    
    // Anonymize skills data
    return data.map((skill: any) => ({
      id: skill.id,
      title: skill.title,
      category: skill.skill_category,
      type: skill.request_type, // 'offer' or 'need'
      description: skill.description 
        ? sanitizeText(skill.description) 
        : "No description provided"
    }));
  } catch (err) {
    console.error("Exception in getNeighborhoodSkills:", err);
    return [];
  }
}

// Fetch and filter safety updates (privacy-focused)
async function getSafetyUpdates(supabase: any, neighborhoodId: string) {
  try {
    const { data, error } = await supabase
      .from("safety_updates")
      .select(`
        id, 
        title, 
        description, 
        type, 
        created_at
      `)
      .eq('neighborhood_id', neighborhoodId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error("Error fetching safety updates:", error);
      return [];
    }
    
    // Anonymize safety data
    return data.map((update: any) => ({
      id: update.id,
      title: update.title,
      type: update.type,
      date: update.created_at,
      description: update.description 
        ? sanitizeText(update.description) 
        : "No details provided"
    }));
  } catch (err) {
    console.error("Exception in getSafetyUpdates:", err);
    return [];
  }
}

// Sanitize text by removing potential PII
function sanitizeText(text: string): string {
  if (!text) return "";
  
  // Replace email patterns
  let sanitized = text.replace(/\S+@\S+\.\S+/g, "[email removed]");
  
  // Replace phone number patterns (various formats)
  sanitized = sanitized.replace(/(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, "[phone number removed]");
  
  // Replace address patterns (simplified approach)
  sanitized = sanitized.replace(/\d+\s+[A-Za-z0-9\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|court|ct|lane|ln|way|parkway|pkwy)\b/gi, "[address removed]");
  
  return sanitized;
}

// Format neighborhood data for the AI prompt
function prepareNeighborhoodContext(events: any[], skills: any[], safetyUpdates: any[]): string {
  let context = "Here is some information about the neighborhood:\n\n";
  
  // Add events information
  if (events.length > 0) {
    context += "UPCOMING EVENTS:\n";
    events.forEach((event, index) => {
      const date = new Date(event.time).toLocaleDateString('en-US', {
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      context += `${index + 1}. "${event.title}" - ${date} at ${event.location}\n`;
      if (event.description) {
        context += `   Description: ${event.description}\n`;
      }
    });
    context += "\n";
  }
  
  // Add skills information
  if (skills.length > 0) {
    context += "CURRENT SKILLS IN THE NEIGHBORHOOD:\n";
    const offers = skills.filter(s => s.type === 'offer');
    const needs = skills.filter(s => s.type === 'need');
    
    if (offers.length > 0) {
      context += "Skills being offered:\n";
      offers.forEach((skill, index) => {
        context += `${index + 1}. "${skill.title}" (${skill.category})\n`;
      });
    }
    
    if (needs.length > 0) {
      context += "Skills being requested:\n";
      needs.forEach((skill, index) => {
        context += `${index + 1}. "${skill.title}" (${skill.category})\n`;
      });
    }
    context += "\n";
  }
  
  // Add safety updates
  if (safetyUpdates.length > 0) {
    context += "RECENT SAFETY UPDATES:\n";
    safetyUpdates.forEach((update, index) => {
      const date = new Date(update.date).toLocaleDateString();
      context += `${index + 1}. ${update.title} (${update.type}) - Posted on ${date}\n`;
      if (update.description) {
        context += `   Details: ${update.description}\n`;
      }
    });
  }
  
  return context;
}

// Main function that handles the HTTP request
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body which contains the user message
    const { message, userId, neighborhoodId } = await req.json();
    
    // Validate the request
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the Anthropic API key from environment variables
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.error('Missing Anthropic API key');
      return new Response(
        JSON.stringify({ error: 'Internal configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log information about this request for debugging
    console.log(`Processing chat request from user ${userId} in neighborhood ${neighborhoodId}`);
    console.log(`Message length: ${message.length} characters`);
    
    // Create Supabase client and fetch neighborhood data
    const supabase = getSupabaseClient(req);
    
    // Fetch filtered neighborhood data in parallel
    const [events, skills, safetyUpdates] = await Promise.all([
      getNeighborhoodEvents(supabase, neighborhoodId),
      getNeighborhoodSkills(supabase, neighborhoodId),
      getSafetyUpdates(supabase, neighborhoodId)
    ]);
    
    // Prepare neighborhood context for the AI
    const neighborhoodContext = prepareNeighborhoodContext(events, skills, safetyUpdates);
    console.log("Prepared neighborhood context with:", {
      eventCount: events.length,
      skillCount: skills.length,
      safetyUpdateCount: safetyUpdates.length
    });

    // Call the Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `As a friendly, helpful neighborhood assistant, please respond to this question from a neighbor: ${message}.

${neighborhoodContext}

Please follow these guidelines when responding:
1. Use a friendly, welcoming tone like a helpful neighbor would use
2. Format your responses with clear headings, bullet points, and simple language
3. When referring to specific events, skills, or updates, format them like this: [ITEM_TYPE:ITEM_ID:ITEM_NAME]
4. Focus on providing practical information about the neighborhood
5. Keep your answers accessible for people aged 7-70
6. Use a dash of subtle humor when appropriate
7. Be concise but thorough

Remember, your goal is to help neighbors find ways to engage with their community and connect with each other.`
          }
        ]
      }),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the response and return it
    const data = await response.json();
    const aiResponse = data.content && data.content[0] ? data.content[0].text : 'Sorry, I couldn\'t generate a response';
    
    // Process the response to include original item IDs for frontend processing
    const processedResponse = {
      response: aiResponse,
      context: {
        events: events.map(e => ({ id: e.id, title: e.title })),
        skills: skills.map(s => ({ id: s.id, title: s.title })),
        safetyUpdates: safetyUpdates.map(u => ({ id: u.id, title: u.title }))
      }
    };
    
    return new Response(
      JSON.stringify(processedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Handle any errors
    console.error('Error in anthropic-chat function:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
