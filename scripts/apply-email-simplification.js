#!/usr/bin/env node

/**
 * Apply Email Preferences Simplification
 * 
 * This script applies the SQL changes to simplify email preferences
 * by removing all email notification options except weekly newsletter
 * and making it automatically enabled for all users.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nnwzfliblfuldwxpuata.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function applyEmailSimplification() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    logError('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }

  log(`${colors.bright}${colors.magenta}🚀 Applying Email Preferences Simplification${colors.reset}`);
  
  try {
    // Step 1: Update existing users to have weekly newsletter enabled
    logInfo('Step 1: Enabling weekly newsletter for existing users...');
    
    const updateUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `
          UPDATE profiles 
          SET notification_preferences = jsonb_set(
            notification_preferences,
            '{email,types,weekly_summary}',
            'true'::jsonb,
            true
          )
          WHERE notification_preferences->'email'->'types'->>'weekly_summary' IS NULL
             OR (notification_preferences->'email'->'types'->>'weekly_summary')::boolean = false;
        `
      })
    });

    if (!updateUsersResponse.ok) {
      throw new Error(`Failed to update users: ${updateUsersResponse.status}`);
    }

    logSuccess('Updated existing users to have weekly newsletter enabled');

    // Step 2: Update the get_neighborhood_emails_for_digest function
    logInfo('Step 2: Updating get_neighborhood_emails_for_digest function...');
    
    const updateFunctionResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `
          CREATE OR REPLACE FUNCTION public.get_neighborhood_emails_for_digest(target_neighborhood_id uuid)
          RETURNS TABLE(user_id uuid, email text, display_name text)
          LANGUAGE plpgsql
          SECURITY DEFINER
          SET search_path TO 'public'
          AS $function$
          BEGIN
            RETURN QUERY
            SELECT 
              p.id as user_id,
              au.email::text as email,
              p.display_name
            FROM profiles p
            JOIN auth.users au ON p.id = au.id
            WHERE p.id IN (
              -- Get active neighborhood members
              SELECT nm.user_id 
              FROM neighborhood_members nm 
              WHERE nm.neighborhood_id = target_neighborhood_id 
                AND nm.status = 'active'
              UNION
              -- Get neighborhood creator
              SELECT n.created_by
              FROM neighborhoods n
              WHERE n.id = target_neighborhood_id
            )
            -- Check if weekly newsletter is enabled (simplified check)
            AND (
              -- Check if user has weekly_summary enabled in their preferences
              (p.notification_preferences->'email'->'types'->>'weekly_summary')::boolean = true
              -- OR if they don't have preferences set (default to enabled)
              OR p.notification_preferences->'email'->'types'->>'weekly_summary' IS NULL
            );
          END;
          $function$;
        `
      })
    });

    if (!updateFunctionResponse.ok) {
      throw new Error(`Failed to update function: ${updateFunctionResponse.status}`);
    }

    logSuccess('Updated get_neighborhood_emails_for_digest function');

    // Step 3: Update the should_user_receive_email_notification function
    logInfo('Step 3: Updating should_user_receive_email_notification function...');
    
    const updateNotificationFunctionResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `
          CREATE OR REPLACE FUNCTION should_user_receive_email_notification(
            p_user_id UUID,
            p_notification_type TEXT,
            p_content_type TEXT
          ) RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            user_prefs JSONB;
            type_enabled BOOLEAN;
          BEGIN
            -- Get user's notification preferences
            SELECT notification_preferences INTO user_prefs
            FROM profiles
            WHERE id = p_user_id;
            
            -- If no preferences found, default to true for weekly_summary
            IF user_prefs IS NULL THEN
              RETURN p_notification_type = 'weekly_summary';
            END IF;
            
            -- For weekly_summary, check if it's enabled (default to true if not set)
            IF p_notification_type = 'weekly_summary' THEN
              type_enabled := COALESCE(
                (user_prefs->'email'->'types'->>'weekly_summary')::boolean,
                true  -- Default to enabled
              );
              RETURN type_enabled;
            END IF;
            
            -- For all other notification types, return false (they're removed)
            RETURN FALSE;
          END;
          $$;
        `
      })
    });

    if (!updateNotificationFunctionResponse.ok) {
      throw new Error(`Failed to update notification function: ${updateNotificationFunctionResponse.status}`);
    }

    logSuccess('Updated should_user_receive_email_notification function');

    log(`\n${colors.bright}${colors.green}✅ Email preferences simplification completed successfully!${colors.reset}`);
    log('Changes applied:');
    log('  - All existing users now have weekly newsletter enabled');
    log('  - get_neighborhood_emails_for_digest function updated to use simplified structure');
    log('  - should_user_receive_email_notification function updated for weekly_summary only');
    log('  - UI component updated to only show weekly newsletter option');

  } catch (error) {
    logError(`Failed to apply changes: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
applyEmailSimplification();
