
// Import the necessary modules and the shared utilities
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('anthropic-chat');

// Define interface for the request payload
interface ChatRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  contextIds?: string[];
}

// Handler function
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Get the API key from environment variables
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      logger.error("Missing Anthropic API key");
      return errorResponse("Anthropic API key not configured", 500);
    }

    // Parse the request body
    const { prompt, model = "claude-3-haiku-20240307", maxTokens = 500, temperature = 0.7, stream = false, contextIds = [] } = await req.json() as ChatRequest;

    // Validate the prompt
    if (!prompt) {
      logger.error("Missing prompt in request");
      return errorResponse("Missing prompt parameter", 400);
    }

    logger.info("Processing chat request", { model, maxTokens, temperature, hasContextIds: contextIds.length > 0 });

    // Prepare the API request
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "user", content: prompt }],
        stream
      })
    });

    // Check for errors in the API response
    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Anthropic API error (${response.status}):`, errorText);
      return errorResponse(`Anthropic API error: ${response.status} ${errorText}`, response.status);
    }

    // Parse the API response
    if (stream) {
      // Return the stream directly
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
        },
      });
    } else {
      const data = await response.json();
      logger.info("Successfully received response from Anthropic");
      
      // Return the AI response
      return successResponse({
        response: data.content[0].text,
        usage: data.usage,
        model: data.model
      });
    }
  } catch (error) {
    logger.error("Error in anthropic-chat:", error);
    return errorResponse(error);
  }
});
