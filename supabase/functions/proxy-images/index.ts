import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract the image path from the URL
    const url = new URL(req.url);
    const imagePath = url.searchParams.get('path');
    
    if (!imagePath) {
      return new Response('Missing image path parameter', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Construct the Supabase storage URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${imagePath}`;

    // Fetch the image from Supabase
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return new Response('Image not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Get the image data
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': imageData.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error proxying image:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
