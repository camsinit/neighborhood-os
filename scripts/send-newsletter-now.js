#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://nnwzfliblfuldwxpuata.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud3pmbGlibGZ1bGR3eHB1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTYwNTgsImV4cCI6MjA1NDk5MjA1OH0.jEa99YSuIt36oOyaAvIZ5pGCDk9vSa3tBfi43Uqm8OU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendNewsletterNow(neighborhoodId, mode = 'send') {
  console.log('🚀 Manually triggering newsletter for today (Sunday)');
  console.log('📅 Current time:', new Date().toLocaleString());
  console.log('🏘️  Neighborhood ID:', neighborhoodId);
  console.log('📧 Mode:', mode);
  console.log('');

  try {
    // Call the send-weekly-summary-final function directly
    console.log('📤 Calling send-weekly-summary-final function...');

    const { data, error } = await supabase.functions.invoke('send-weekly-summary-final', {
      body: {
        neighborhoodId: neighborhoodId,
        mode: mode, // 'send' for actual email, 'preview' for preview only
        scheduledSend: true, // Flag to indicate this is a scheduled/manual send
        overrideSendCheck: true // Override the "already sent this week" check
      }
    });

    if (error) {
      console.error('❌ Error sending newsletter:', error);
      return;
    }

    console.log('✅ Newsletter sent successfully!');

    if (data) {
      console.log('\n📊 Results:');
      if (data.mode) console.log('  Mode:', data.mode);
      if (data.neighborhoodId) console.log('  Neighborhood:', data.neighborhoodId);
      if (data.recipients) console.log('  Recipients:', data.recipients);
      if (data.emailsSent) console.log('  Emails sent:', data.emailsSent);
      if (data.previewUrl) console.log('  Preview URL:', data.previewUrl);

      if (data.stats) {
        console.log('\n📈 Newsletter Stats:');
        console.log('  New members:', data.stats.newMembers);
        console.log('  Upcoming events:', data.stats.upcomingEvents);
        console.log('  Active skill requests:', data.stats.activeSkillRequests);
        console.log('  Available skills:', data.stats.availableSkills);
      }
    }

    if (mode === 'send') {
      console.log('\n✉️  Newsletter has been sent to all active neighborhood members!');
      console.log('📬 Check your email inbox for the weekly digest.');
    } else {
      console.log('\n👁️  Preview mode - no emails were sent.');
      console.log('💡 Use mode "send" to actually send the newsletter.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get parameters from command line
const neighborhoodId = process.argv[2] || 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';
const mode = process.argv[3] || 'send'; // Default to actually sending

console.log('================================================');
console.log('   MANUAL NEWSLETTER TRIGGER FOR SUNDAY');
console.log('================================================\n');

if (!process.argv[2]) {
  console.log('ℹ️  Usage: node scripts/send-newsletter-now.js [neighborhoodId] [mode]');
  console.log('  - neighborhoodId: The neighborhood to send newsletter for');
  console.log('  - mode: "send" (default) or "preview"');
  console.log('\nUsing default test neighborhood ID...\n');
}

// Confirm before sending
if (mode === 'send') {
  console.log('⚠️  WARNING: This will send REAL emails to neighborhood members!');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

  setTimeout(() => {
    sendNewsletterNow(neighborhoodId, mode);
  }, 3000);
} else {
  sendNewsletterNow(neighborhoodId, mode);
}