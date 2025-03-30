
// This Edge Function securely communicates with Anthropic's API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Set up CORS headers to allow our web app to communicate with this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
                      Focus on providing useful information for a neighborhood context, such as community events, 
                      ways to help neighbors, finding local resources, or building community. 
                      Keep your response friendly, helpful, and concise.`
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
    
    return new Response(
      JSON.stringify({ response: aiResponse }),
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
