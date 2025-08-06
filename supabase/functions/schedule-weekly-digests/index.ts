import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders, handleCorsPreflightRequest, successResponse, errorResponse, createLogger } from '../_shared/cors.ts'

/**
 * Timezone-Aware Weekly Digest Scheduler
 * 
 * This edge function runs hourly to check for neighborhoods ready to receive 
 * their weekly digest on Sunday morning at 9 AM local time.
 * 
 * Key Features:
 * - Respects neighborhood timezone settings
 * - Prevents duplicate sends within the same week
 * - Handles email preferences and subscriber checks
 * - Provides comprehensive logging and error handling
 */

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const handler = async (req: Request): Promise<Response> => {
  // Set up logging for this function execution
  const logger = createLogger('schedule-weekly-digests');
  
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    logger.info('Starting weekly digest scheduling check');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get neighborhoods that are ready for weekly digest (Sunday 9 AM local time)
    const { data: readyNeighborhoods, error: neighbourhoodsError } = await supabase
      .rpc('get_neighborhoods_ready_for_digest');
    
    if (neighbourhoodsError) {
      logger.error('Failed to get ready neighborhoods:', neighbourhoodsError);
      throw neighbourhoodsError;
    }

    if (!readyNeighborhoods || readyNeighborhoods.length === 0) {
      logger.info('No neighborhoods ready for weekly digest at this time');
      return successResponse({ 
        message: 'No neighborhoods ready for digest',
        readyCount: 0,
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`Found ${readyNeighborhoods.length} neighborhoods ready for digest`);

    // Process each neighborhood individually with error handling
    const results = [];
    for (const neighborhood of readyNeighborhoods) {
      try {
        logger.info(`Processing neighborhood: ${neighborhood.neighborhood_name} (${neighborhood.neighborhood_id})`);
        
        // Check if this neighborhood has any subscribers before sending
        const { data: subscribers, error: subscribersError } = await supabase
          .rpc('get_neighborhood_emails_for_digest', { 
            target_neighborhood_id: neighborhood.neighborhood_id 
          });
        
        if (subscribersError) {
          logger.error(`Failed to get subscribers for ${neighborhood.neighborhood_name}:`, subscribersError);
          results.push({
            neighborhoodId: neighborhood.neighborhood_id,
            neighborhoodName: neighborhood.neighborhood_name,
            status: 'error',
            error: 'Failed to get subscribers'
          });
          continue;
        }

        if (!subscribers || subscribers.length === 0) {
          logger.info(`No subscribers found for ${neighborhood.neighborhood_name}, skipping`);
          results.push({
            neighborhoodId: neighborhood.neighborhood_id,
            neighborhoodName: neighborhood.neighborhood_name,
            status: 'skipped',
            reason: 'No subscribers with digest enabled'
          });
          continue;
        }

        logger.info(`Found ${subscribers.length} subscribers for ${neighborhood.neighborhood_name}`);

        // Trigger the weekly digest generation
        const digestResponse = await supabase.functions.invoke('send-weekly-summary', {
          body: {
            neighborhoodId: neighborhood.neighborhood_id,
            scheduledSend: true // Flag to indicate this is an automated send
          }
        });

        if (digestResponse.error) {
          logger.error(`Failed to send digest for ${neighborhood.neighborhood_name}:`, digestResponse.error);
          results.push({
            neighborhoodId: neighborhood.neighborhood_id,
            neighborhoodName: neighborhood.neighborhood_name,
            status: 'error',
            error: digestResponse.error.message
          });
          continue;
        }

        // Update last_weekly_digest_sent timestamp
        const { error: updateError } = await supabase
          .from('neighborhoods')
          .update({ last_weekly_digest_sent: new Date().toISOString() })
          .eq('id', neighborhood.neighborhood_id);

        if (updateError) {
          logger.warn(`Failed to update last_weekly_digest_sent for ${neighborhood.neighborhood_name}:`, updateError);
          // Don't fail the whole process for this, just log it
        }

        results.push({
          neighborhoodId: neighborhood.neighborhood_id,
          neighborhoodName: neighborhood.neighborhood_name,
          status: 'success',
          subscriberCount: subscribers.length,
          sentAt: new Date().toISOString()
        });

        logger.info(`Successfully sent digest for ${neighborhood.neighborhood_name}`);

      } catch (error: any) {
        logger.error(`Unexpected error processing ${neighborhood.neighborhood_name}:`, error);
        results.push({
          neighborhoodId: neighborhood.neighborhood_id,
          neighborhoodName: neighborhood.neighborhood_name,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    logger.info(`Digest scheduling complete: ${successCount} sent, ${errorCount} errors, ${skippedCount} skipped`);

    return successResponse({
      message: 'Weekly digest scheduling completed',
      summary: {
        total: results.length,
        sent: successCount,
        errors: errorCount,
        skipped: skippedCount
      },
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Unexpected error in schedule-weekly-digests:', error);
    return errorResponse(error);
  }
};

serve(handler);