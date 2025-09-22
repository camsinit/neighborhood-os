#!/usr/bin/env node

/**
 * Test Updated Weekly Newsletter Script
 * 
 * This script tests the UPDATED newsletter function that includes:
 * - Groups activities (new groups, group joins)
 * - Fixed member queries 
 * - Better date ranges
 * - Enhanced activity detection
 * - Current system features only
 */

import { writeFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function testUpdatedNewsletter() {
  const args = process.argv.slice(2);
  const neighborhoodId = args[0];
  const testEmail = args[1];
  const mode = args[2] || 'preview'; // 'preview' or 'test'

  if (!neighborhoodId) {
    console.error('❌ Error: Please provide a neighborhood ID');
    console.log('\nUsage: node scripts/test-updated-newsletter.js [neighborhoodId] [testEmail] [mode]');
    process.exit(1);
  }

  if (mode === 'test' && !testEmail) {
    console.error('❌ Error: Please provide a test email when using test mode');
    console.log('\nUsage: node scripts/test-updated-newsletter.js [neighborhoodId] [testEmail] test');
    process.exit(1);
  }

  console.log(`🚀 Testing UPDATED weekly newsletter...`);
  console.log(`📧 Mode: ${mode}`);
  console.log(`🏘️  Neighborhood ID: ${neighborhoodId}`);
  if (testEmail) console.log(`📬 Test Email: ${testEmail}`);

  try {
    // Prepare the request payload
    const payload = {
      neighborhoodId: neighborhoodId,
      previewOnly: mode === 'preview',
      ...(testEmail && { testEmail: testEmail })
    };

    console.log('\n📤 Calling UPDATED send-weekly-summary function...');

    // Call the UPDATED Supabase function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-weekly-summary-updated`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Function call failed:', result);
      process.exit(1);
    }

    if (mode === 'preview') {
      console.log('\n✅ UPDATED Preview generated successfully!');
      console.log('📊 Enhanced Stats:', JSON.stringify(result.stats, null, 2));
      console.log('🎯 Enhanced Highlights:', JSON.stringify(result.highlights, null, 2));
      
      if (result.debug) {
        console.log('\n🔍 Debug Information:');
        console.log('📅 Date Range:', result.debug.dateRange);
        console.log('👥 New Neighbors Found:', result.debug.newNeighbors);
        console.log('🆕 New Groups Found:', result.debug.newGroups);
        console.log('👋 Group Joins Found:', result.debug.groupJoins);
        console.log('🏘️  Active Groups Found:', result.debug.activeGroups);
      }
      
      // Save HTML preview to file
      const previewPath = `./newsletter-preview-updated-${Date.now()}.html`;
      writeFileSync(previewPath, result.html);
      console.log(`💾 HTML preview saved to: ${previewPath}`);
      console.log('🌐 Open this file in your browser to see the UPDATED newsletter!');
      
      console.log('\n🆕 NEW FEATURES INCLUDED:');
      console.log('✅ Groups activities (creation, joins, active groups)');
      console.log('✅ Fixed member queries (no more missing new neighbors)');
      console.log('✅ Better date ranges (Sunday to Sunday)');
      console.log('✅ Enhanced activity limits (shows more content)');
      console.log('✅ Current navigation (Groups instead of outdated features)');
      console.log('✅ Comprehensive error logging');
      
    } else {
      console.log('\n✅ UPDATED Test email sent successfully!');
      console.log('📧 Check your inbox for the enhanced newsletter');
      console.log('📊 Send stats:', result);
    }

  } catch (error) {
    console.error('❌ Error testing UPDATED newsletter:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure the send-weekly-summary-updated function is deployed');
      console.log('2. Check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
      console.log('3. Check Supabase function logs for errors');
      console.log('4. Verify the neighborhood ID exists and is accessible');
    }
    
    process.exit(1);
  }
}

// Run the script
testUpdatedNewsletter();
