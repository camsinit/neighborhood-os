#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This script requires SERVICE_ROLE_KEY for full access
// Get it from Supabase Dashboard > Settings > API

const supabaseUrl = process.env.SUPABASE_URL || "https://nnwzfliblfuldwxpuata.supabase.co";

// You need to set this environment variable with your service role key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set!');
  console.log('\nTo get your service role key:');
  console.log('1. Go to https://supabase.com/dashboard/project/nnwzfliblfuldwxpuata/settings/api');
  console.log('2. Copy the "service_role" key (keep it secret!)');
  console.log('3. Run: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"');
  console.log('4. Then run this script again');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function sendNewsletterWithServiceRole(neighborhoodId, mode = 'send') {
  console.log('🚀 Sending Newsletter with Full Access (Service Role)');
  console.log('=====================================================');
  console.log('📅 Current time:', new Date().toLocaleString());
  console.log('🏘️  Neighborhood ID:', neighborhoodId);
  console.log('📧 Mode:', mode);
  console.log('');

  try {
    // First, get neighborhood details to verify it exists
    console.log('1️⃣ Verifying neighborhood...');
    const { data: neighborhood, error: nError } = await supabase
      .from('neighborhoods')
      .select('*')
      .eq('id', neighborhoodId)
      .single();

    if (nError || !neighborhood) {
      console.error('❌ Neighborhood not found:', nError);
      return;
    }

    console.log('✅ Found neighborhood:', neighborhood.name);
    console.log('   Timezone:', neighborhood.timezone || 'Not set');
    console.log('   Last digest sent:', neighborhood.last_weekly_digest_sent || 'Never');

    // Get all users who should receive the newsletter
    console.log('\n2️⃣ Getting newsletter recipients...');
    const { data: recipients, error: recipientError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: neighborhoodId
      });

    if (recipientError) {
      console.error('❌ Error getting recipients:', recipientError);
      return;
    }

    if (!recipients || recipients.length === 0) {
      console.log('⚠️  No recipients found for this neighborhood');
      console.log('   Check that:');
      console.log('   - Users are active members');
      console.log('   - Users have email notifications enabled');
      return;
    }

    console.log(`✅ Found ${recipients.length} recipients:`);
    recipients.forEach(r => {
      console.log(`   - ${r.display_name} (${r.email})`);
    });

    // Call the newsletter function
    console.log('\n3️⃣ Calling send-weekly-summary-final function...');
    const { data, error } = await supabase.functions.invoke('send-weekly-summary-final', {
      body: {
        neighborhoodId: neighborhoodId,
        mode: mode,
        scheduledSend: true,
        overrideSendCheck: true // Force send even if recently sent
      }
    });

    if (error) {
      console.error('❌ Error sending newsletter:', error);
      return;
    }

    console.log('✅ Newsletter function called successfully!');

    if (data) {
      if (data.error) {
        console.error('❌ Function returned error:', data.error);
        return;
      }

      console.log('\n📊 Results:');
      if (data.stats) {
        console.log('   Newsletter Stats:');
        console.log('   - New members:', data.stats.newMembers);
        console.log('   - Upcoming events:', data.stats.upcomingEvents);
        console.log('   - Available skills:', data.stats.availableSkills);
      }
      if (data.emailsSent !== undefined) {
        console.log('   Emails sent:', data.emailsSent);
      }
    }

    // Update the last sent timestamp if in send mode
    if (mode === 'send') {
      console.log('\n4️⃣ Updating last sent timestamp...');
      const { error: updateError } = await supabase
        .from('neighborhoods')
        .update({ last_weekly_digest_sent: new Date().toISOString() })
        .eq('id', neighborhoodId);

      if (updateError) {
        console.warn('⚠️  Failed to update last sent time:', updateError);
      } else {
        console.log('✅ Updated last sent timestamp');
      }

      console.log('\n✉️  NEWSLETTER SENT SUCCESSFULLY!');
      console.log('📬 Recipients should check their email inbox.');
    } else {
      console.log('\n👁️  Preview mode - no emails were sent.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get parameters from command line
const neighborhoodId = process.argv[2] || 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';
const mode = process.argv[3] || 'send';

console.log('================================================');
console.log('   NEWSLETTER SENDER (WITH SERVICE ROLE)');
console.log('================================================\n');

if (!process.argv[2]) {
  console.log('ℹ️  Usage: node scripts/send-newsletter-service.js [neighborhoodId] [mode]');
  console.log('  - neighborhoodId: The neighborhood to send newsletter for');
  console.log('  - mode: "send" (default) or "preview"');
  console.log('\nUsing default test neighborhood ID...\n');
}

sendNewsletterWithServiceRole(neighborhoodId, mode);