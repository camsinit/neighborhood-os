#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://nnwzfliblfuldwxpuata.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function checkNewsletterSend(neighborhoodId) {
  console.log('🔍 Investigating Newsletter Send Results');
  console.log('======================================');
  console.log('Neighborhood ID:', neighborhoodId);
  console.log('');

  try {
    // 1. Check who SHOULD have received it
    console.log('1️⃣ Who SHOULD have received newsletter...');
    const { data: expectedRecipients, error: recipientError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: neighborhoodId
      });

    if (recipientError) {
      console.error('❌ Error getting expected recipients:', recipientError);
    } else {
      console.log(`Expected ${expectedRecipients?.length || 0} recipients:`);
      if (expectedRecipients?.length > 0) {
        expectedRecipients.forEach((r, i) => {
          console.log(`   ${i+1}. ${r.display_name} (${r.email})`);
        });
      }
    }

    // 2. Check recent email queue entries
    console.log('\n2️⃣ Checking email queue for recent sends...');

    // Get recent newsletter emails from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: queueEntries, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('template_id', 'weekly-summary')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (queueError) {
      console.error('❌ Error checking email queue:', queueError);
    } else {
      console.log(`Found ${queueEntries?.length || 0} newsletter emails in queue (last hour):`);

      if (queueEntries?.length > 0) {
        const delivered = queueEntries.filter(e => e.status === 'delivered');
        const failed = queueEntries.filter(e => e.status === 'failed');
        const pending = queueEntries.filter(e => e.status === 'pending');

        console.log(`   ✅ Delivered: ${delivered.length}`);
        console.log(`   ❌ Failed: ${failed.length}`);
        console.log(`   ⏳ Pending: ${pending.length}`);

        console.log('\n   Detailed results:');
        queueEntries.forEach((entry, i) => {
          console.log(`   ${i+1}. ${entry.recipient_email} | ${entry.status} | ${entry.created_at}`);
          if (entry.error) {
            console.log(`      Error: ${entry.error}`);
          }
        });

        // Check for missing recipients
        if (expectedRecipients?.length > 0) {
          console.log('\n   📋 Analysis:');
          const sentEmails = queueEntries.map(e => e.recipient_email);
          const expectedEmails = expectedRecipients.map(r => r.email);

          const missing = expectedEmails.filter(email => !sentEmails.includes(email));
          const unexpected = sentEmails.filter(email => !expectedEmails.includes(email));

          if (missing.length > 0) {
            console.log(`   ❌ Missing (should have received but didn't): ${missing.length}`);
            missing.forEach(email => console.log(`      - ${email}`));
          }

          if (unexpected.length > 0) {
            console.log(`   ⚠️  Unexpected (got email but not in expected list): ${unexpected.length}`);
            unexpected.forEach(email => console.log(`      - ${email}`));
          }

          if (missing.length === 0 && unexpected.length === 0) {
            console.log(`   ✅ Perfect match! All expected recipients got emails.`);
          }
        }
      } else {
        console.log('   No newsletter emails found in recent queue.');
        console.log('   Either the send failed, or emails are older than 1 hour.');
      }
    }

    // 3. Check if the newsletter function actually ran
    console.log('\n3️⃣ Testing the digest function again...');
    const { data: currentRecipients, error: currentError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: neighborhoodId
      });

    if (currentError) {
      console.error('❌ Current digest function error:', currentError);
    } else {
      console.log(`Currently returns ${currentRecipients?.length || 0} recipients`);

      if (currentRecipients?.length !== expectedRecipients?.length) {
        console.log('⚠️  Recipient count changed since last check!');
      }
    }

    // 4. Summary and diagnosis
    console.log('\n📋 DIAGNOSIS');
    console.log('============');

    if (!queueEntries || queueEntries.length === 0) {
      console.log('❌ NO emails were queued at all');
      console.log('   Possible causes:');
      console.log('   - Newsletter function failed silently');
      console.log('   - Function couldn\'t access email queue');
      console.log('   - Function ran but recipients list was empty');
    } else if (queueEntries.length < (expectedRecipients?.length || 0)) {
      console.log('❌ PARTIAL send - some recipients missing');
      console.log('   Possible causes:');
      console.log('   - Function had permission issues for some users');
      console.log('   - Some users\' email preferences changed during send');
      console.log('   - Function encountered errors partway through');
    } else if (queueEntries.some(e => e.status === 'failed')) {
      console.log('❌ Some emails FAILED to deliver');
      console.log('   Check error messages above for specific issues');
    } else {
      console.log('✅ All expected emails were queued and delivered!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

const neighborhoodId = process.argv[2] || 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';

console.log('================================================');
console.log('   NEWSLETTER SEND INVESTIGATION');
console.log('================================================\n');

checkNewsletterSend(neighborhoodId);