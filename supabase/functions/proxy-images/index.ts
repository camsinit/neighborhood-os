import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // Construct the direct public URL for the image
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const publicImageUrl = `${supabaseUrl}/storage/v1/object/public/${imagePath}`;

    // Fetch the image directly from the public URL
    const response = await fetch(publicImageUrl);
    
    if (!response.ok) {
      console.error('Error fetching image:', response.status, response.statusText);
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
