#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://nnwzfliblfuldwxpuata.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud3pmbGlibGZ1bGR3eHB1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTYwNTgsImV4cCI6MjA1NDk5MjA1OH0.jEa99YSuIt36oOyaAvIZ5pGCDk9vSa3tBfi43Uqm8OU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserNewsletter(userId, neighborhoodId) {
  console.log('🔍 Debugging Newsletter Delivery for User');
  console.log('=========================================');
  console.log('User ID:', userId);
  console.log('Neighborhood ID:', neighborhoodId);
  console.log('');

  try {
    // 1. Check if user exists and get their profile
    console.log('1️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ User profile not found or error:', profileError);
      console.log('   This user may not exist in the system.');
      return;
    }

    console.log('✅ User found:');
    console.log('   Display Name:', profile.display_name || 'Not set');
    console.log('   Username:', profile.username || 'Not set');
    console.log('   Created:', profile.created_at);

    // Check notification preferences
    const prefs = profile.notification_preferences || {};
    console.log('\n📧 Email Notification Settings:');
    console.log('   Email Enabled:', prefs.email?.enabled !== false ? '✅ YES' : '❌ NO');
    console.log('   Weekly Summary:', prefs.email?.types?.weekly_summary !== false ? '✅ YES' : '❌ NO');
    console.log('   Raw preferences:', JSON.stringify(prefs, null, 2));

    // 2. Check neighborhood membership
    console.log('\n2️⃣ Checking neighborhood membership...');
    const { data: membership, error: memberError } = await supabase
      .from('neighborhood_members')
      .select('*')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .single();

    if (memberError || !membership) {
      console.error('❌ Not a member of this neighborhood:', memberError?.message);
      console.log('   User must be an active member to receive newsletter.');

      // Check all memberships
      const { data: allMemberships } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id, status, joined_at')
        .eq('user_id', userId);

      if (allMemberships?.length > 0) {
        console.log('\n   User is member of other neighborhoods:');
        allMemberships.forEach(m => {
          console.log(`   - ${m.neighborhood_id} (${m.status})`);
        });
      }
      return;
    }

    console.log('✅ Neighborhood membership found:');
    console.log('   Status:', membership.status);
    console.log('   Joined:', membership.joined_at);
    console.log('   Membership active:', membership.status === 'active' ? '✅ YES' : '❌ NO');

    if (membership.status !== 'active') {
      console.log('⚠️  User is not an active member - they won\'t receive newsletters');
      return;
    }

    // 3. Test the get_neighborhood_emails_for_digest function
    console.log('\n3️⃣ Testing digest email function...');
    const { data: digestEmails, error: digestError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: neighborhoodId
      });

    if (digestError) {
      console.error('❌ Error getting digest emails:', digestError);
    } else {
      const userInList = digestEmails?.find(e => e.user_id === userId);
      if (userInList) {
        console.log('✅ User IS in the digest email list');
        console.log('   Email:', userInList.email || 'NO EMAIL FOUND');
        console.log('   Display name:', userInList.display_name);
      } else {
        console.log('❌ User NOT found in digest email list');
        console.log('   Total users in list:', digestEmails?.length || 0);

        if (digestEmails?.length > 0) {
          console.log('   Other users who would receive newsletter:');
          digestEmails.slice(0, 3).forEach(e => {
            console.log(`   - ${e.display_name} (${e.email ? 'has email' : 'no email'})`);
          });
        }
      }
    }

    // 4. Check email queue for recent sends
    console.log('\n4️⃣ Checking email queue for recent sends...');
    const { data: recentEmails, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (queueError) {
      console.log('⚠️  Cannot access email queue (expected due to security):', queueError.message);
    } else if (recentEmails?.length > 0) {
      console.log('📬 Recent emails for this user:');
      recentEmails.forEach(email => {
        console.log(`   - ${email.template_id} | ${email.status} | ${email.created_at}`);
        if (email.error) console.log(`     Error: ${email.error}`);
      });
    } else {
      console.log('   No recent emails found in queue');
    }

    // 5. Summary and recommendations
    console.log('\n📋 SUMMARY');
    console.log('===========');

    const issues = [];

    if (prefs.email?.enabled === false) {
      issues.push('❌ Email notifications are disabled');
    }
    if (prefs.email?.types?.weekly_summary === false) {
      issues.push('❌ Weekly summary is specifically disabled');
    }
    if (membership.status !== 'active') {
      issues.push('❌ Not an active neighborhood member');
    }
    if (!userInList) {
      issues.push('❌ Not appearing in digest recipient list');
    }

    if (issues.length === 0) {
      console.log('✅ User SHOULD be receiving newsletters');
      console.log('   If they didn\'t receive it, check:');
      console.log('   1. Email address is correct in auth.users table');
      console.log('   2. Email isn\'t going to spam folder');
      console.log('   3. Resend service is working properly');
    } else {
      console.log('Issues found:');
      issues.forEach(issue => console.log('   ' + issue));

      console.log('\n🔧 TO FIX:');
      if (prefs.email?.enabled === false || prefs.email?.types?.weekly_summary === false) {
        console.log('   - Enable email notifications in user settings');
        console.log('   - Make sure weekly_summary is enabled');
      }
      if (membership.status !== 'active') {
        console.log('   - Ensure user has active neighborhood membership');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get parameters
const userId = process.argv[2] || '74bf3085-8275-4eb2-a721-8c8e91b3d3d8';
const neighborhoodId = process.argv[3] || 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';

debugUserNewsletter(userId, neighborhoodId);