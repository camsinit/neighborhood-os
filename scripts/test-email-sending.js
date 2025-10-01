#!/usr/bin/env node

// Test email sending to debug why some emails show "successful" but don't reach Resend
// This will help us understand what's happening with Peg and Cam's email addresses

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// The 4 email addresses from the original send
const testEmails = [
  { email: 'peglang@gmail.com', name: 'Peg Langham' },      // ❌ Didn't reach Resend
  { email: 'cclindsay@gmail.com', name: 'Cam' },            // ❌ Didn't reach Resend
  { email: 'shirahwagner@googlemail.com', name: 'Shirah Wagner' },  // ✅ Delivered
  { email: 'pamela.weimer@gmail.com', name: 'Pamela Weimer' }       // ✅ Delivered
];

async function testEmailSending() {
  console.log('🧪 Testing email sending to identify delivery issues...');
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY environment variable not set!');
    console.log('Please set it to test email sending.');
    return;
  }

  const results = [];

  for (const recipient of testEmails) {
    console.log(`📧 Testing send to: ${recipient.name} (${recipient.email})`);

    try {
      const result = await resend.emails.send({
        from: 'NeighborhoodOS <weekly@updates.neighborhoodos.com>',
        to: [recipient.email],
        subject: `Test: Newsletter Delivery Debug for ${recipient.name}`,
        html: `
          <h1>Email Delivery Test</h1>
          <p>Hello ${recipient.name},</p>
          <p>This is a test email to debug why some newsletter emails aren't being delivered.</p>
          <p>If you receive this, your email address works correctly with our system.</p>
          <p>Recipient: ${recipient.email}</p>
        `,
        tracking: {
          opens: true,
          clicks: false,
        },
      });

      console.log(`   ✅ Resend API returned:`, result);
      results.push({
        email: recipient.email,
        name: recipient.name,
        success: true,
        resendId: result.data?.id,
        result: result
      });

    } catch (error) {
      console.log(`   ❌ Resend API error:`, error);
      results.push({
        email: recipient.email,
        name: recipient.name,
        success: false,
        error: error.message,
        fullError: error
      });
    }

    console.log('');
  }

  console.log('📊 SUMMARY');
  console.log('==========');
  results.forEach(result => {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${status}: ${result.name} (${result.email})`);
    if (result.success) {
      console.log(`   Resend ID: ${result.resendId}`);
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('');
  console.log('🔍 ANALYSIS:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Successful sends: ${successful.length}/4`);
  console.log(`Failed sends: ${failed.length}/4`);

  if (failed.length > 0) {
    console.log('');
    console.log('❌ Failed email addresses:');
    failed.forEach(f => {
      console.log(`  - ${f.email}: ${f.error}`);
    });
  }
}

testEmailSending().catch(console.error);