#!/usr/bin/env node

// This script will directly run the SQL in the database via the API
// since the migration system seems to have issues

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nnwzfliblfuldwxpuata.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud3pmbGlibGZ1bGR3eHB1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTYwNTgsImV4cCI6MjA1NDk5MjA1OH0.jEa99YSuIt36oOyaAvIZ5pGCDk9vSa3tBfi43Uqm8OU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDigestFunction() {
  console.log('🔧 Applying the digest function fix directly...');

  const fixSQL = `
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
      LEFT JOIN auth.users au ON p.id = au.id
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
      AND au.email IS NOT NULL;
    END;
    $function$;
  `;

  try {
    const { error } = await supabase.rpc('exec', { sql: fixSQL });

    if (error) {
      console.log('❌ Error applying fix:', error);
      return;
    }

    console.log('✅ Function fix applied successfully!');

    // Test the function
    console.log('🧪 Testing the function...');
    const { data: testResult, error: testError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d'
      });

    if (testError) {
      console.log('❌ Error testing function:', testError);
      return;
    }

    console.log(`📧 Function now returns ${testResult.length} recipients:`);
    testResult.forEach((recipient, i) => {
      console.log(`  ${i + 1}. ${recipient.display_name} (${recipient.email})`);
    });

    if (testResult.length === 7) {
      console.log('🎉 SUCCESS! All 7 neighbors are now included!');
    } else {
      console.log(`❌ Still only returning ${testResult.length} of 7 expected neighbors`);
    }

  } catch (error) {
    console.log('❌ Error:', error);
  }
}

fixDigestFunction();