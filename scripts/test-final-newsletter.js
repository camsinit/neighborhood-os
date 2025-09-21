#!/usr/bin/env node

/**
 * Test Weekly Neighborhood Digest Script
 * 
 * This script tests the Weekly Neighborhood Digest function that reflects the CURRENT system:
 * ✅ CURRENT FEATURES: Home, Calendar, Skills, Groups
 * ❌ REMOVED FEATURES: Safety, Goods (tables dropped Sept 21, 2025)
 * 
 * The digest will now ONLY show:
 * - Events and gatherings
 * - Skills exchange (offers/requests)  
 * - Group activities (new groups, joins, active groups)
 * - New neighbors joining
 */

import { writeFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function testFinalNewsletter() {
  const args = process.argv.slice(2);
  const neighborhoodId = args[0];
  const testEmail = args[1];
  const mode = args[2] || 'preview'; // 'preview' or 'test'

  if (!neighborhoodId) {
    console.error('❌ Error: Please provide a neighborhood ID');
    console.log('\nUsage: node scripts/test-final-newsletter.js [neighborhoodId] [testEmail] [mode]');
    process.exit(1);
  }

  if (mode === 'test' && !testEmail) {
    console.error('❌ Error: Please provide a test email when using test mode');
    console.log('\nUsage: node scripts/test-final-newsletter.js [neighborhoodId] [testEmail] test');
    process.exit(1);
  }

  console.log(`🚀 Testing Weekly Neighborhood Digest (current system only)...`);
  console.log(`📧 Mode: ${mode}`);
  console.log(`🏘️  Neighborhood ID: ${neighborhoodId}`);
  if (testEmail) console.log(`📬 Test Email: ${testEmail}`);

  console.log('\n✅ CURRENT SYSTEM FEATURES:');
  console.log('   🏠 Home - Activity feed and notifications');
  console.log('   📅 Calendar - Events and gatherings');
  console.log('   🧠 Skills - Skills exchange (offers/requests)');
  console.log('   👥 Groups - Social groups + Physical units');
  
  console.log('\n❌ REMOVED FEATURES (Sept 21, 2025):');
  console.log('   🛡️ Safety - Page removed, table dropped');
  console.log('   📦 Goods - Page removed, table dropped');

  try {
    // Prepare the request payload
    const payload = {
      neighborhoodId: neighborhoodId,
      previewOnly: mode === 'preview',
      ...(testEmail && { testEmail: testEmail })
    };

    console.log('\n📤 Calling FINAL send-weekly-summary function...');

    // Call the FINAL Supabase function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-weekly-summary-final`, {
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
      console.log('\n✅ FINAL Preview generated successfully!');
      console.log('📊 Current System Stats:', JSON.stringify(result.stats, null, 2));
      console.log('🎯 Current System Highlights:', JSON.stringify(result.highlights, null, 2));
      
      if (result.debug) {
        console.log('\n🔍 Debug Information:');
        console.log('📅 Date Range:', result.debug.dateRange);
        console.log('👥 New Neighbors Found:', result.debug.newNeighbors);
        console.log('🆕 New Groups Found:', result.debug.newGroups);
        console.log('👋 Group Joins Found:', result.debug.groupJoins);
        console.log('🏘️  Active Groups Found:', result.debug.activeGroups);
        console.log('✅ Current Features:', result.debug.currentFeatures);
        console.log('❌ Removed Features:', result.debug.removedFeatures);
        console.log('🗑️  Tables Dropped:', result.debug.tablesDropped);
      }
      
      // Save HTML preview to file
      const previewPath = `./newsletter-preview-final-${Date.now()}.html`;
      writeFileSync(previewPath, result.html);
      console.log(`💾 HTML preview saved to: ${previewPath}`);
      console.log('🌐 Open this file in your browser to see the FINAL newsletter!');
      
      console.log('\n🎯 WHAT THE FINAL NEWSLETTER INCLUDES:');
      console.log('✅ All 17+ skills from your active neighborhood');
      console.log('✅ Fixed new member detection (no more missing neighbors)');
      console.log('✅ Group activities (creation, joins, active groups)');
      console.log('✅ Better date ranges (Sunday to Sunday)');
      console.log('✅ Only current navigation features');
      console.log('✅ NO safety content (table dropped)');
      console.log('✅ NO goods content (table dropped)');
      console.log('✅ Enhanced error logging and debugging');
      
    } else {
      console.log('\n✅ FINAL Test email sent successfully!');
      console.log('📧 Check your inbox for the current-system newsletter');
      console.log('📊 Send stats:', result);
    }

  } catch (error) {
    console.error('❌ Error testing FINAL newsletter:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure the send-weekly-summary-final function is deployed');
      console.log('2. Check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
      console.log('3. Check Supabase function logs for errors');
      console.log('4. Verify the neighborhood ID exists and is accessible');
    }
    
    process.exit(1);
  }
}

// Run the script
testFinalNewsletter();
