#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://nnwzfliblfuldwxpuata.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set!');
  console.error('Please set it to debug the missing neighbors issue.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const neighborhoodId = 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';

// Known missing neighbors from the UI
const missingNeighbors = [
  'Cathy Furtado',
  'Laura Scheflow',
  'Parker Malachowsky'
];

async function debugMissingNeighbors() {
  console.log('🔍 DEBUGGING MISSING NEIGHBORS');
  console.log('==============================');
  console.log(`Neighborhood ID: ${neighborhoodId}`);
  console.log(`Missing neighbors: ${missingNeighbors.join(', ')}`);
  console.log('');

  // Step 1: Get all neighborhood members directly
  console.log('1️⃣ Checking neighborhood_members table...');
  const { data: allMembers, error: membersError } = await supabase
    .from('neighborhood_members')
    .select('user_id, status, joined_at')
    .eq('neighborhood_id', neighborhoodId);

  if (membersError) {
    console.log('❌ Error fetching members:', membersError);
    return;
  }

  console.log(`Found ${allMembers.length} total members in neighborhood_members table`);

  const activeMembers = allMembers.filter(m => m.status === 'active');
  const inactiveMembers = allMembers.filter(m => m.status !== 'active');

  console.log(`✅ Active: ${activeMembers.length}`);
  console.log(`❌ Inactive: ${inactiveMembers.length}`);
  console.log('');

  // Step 2: Check each member's profile and auth data
  console.log('2️⃣ Checking profiles and auth data for each member...');
  console.log('');

  for (const member of allMembers) {
    const userId = member.user_id;

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, email, notification_preferences')
      .eq('id', userId)
      .single();

    // Get auth data
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    console.log(`👤 User ID: ${userId.substring(0, 8)}...`);
    console.log(`   Status in neighborhood: ${member.status}`);
    console.log(`   Joined: ${member.joined_at?.substring(0, 10) || 'Unknown'}`);

    if (profileError) {
      console.log(`   ❌ Profile error: ${profileError.message}`);
    } else if (profile) {
      console.log(`   Profile name: ${profile.display_name || 'No name'}`);
      console.log(`   Profile email: ${profile.email || 'No email in profile'}`);
    } else {
      console.log(`   ❌ No profile found`);
    }

    if (authError) {
      console.log(`   ❌ Auth error: ${authError.message}`);
    } else if (authUser?.user) {
      console.log(`   Auth email: ${authUser.user.email || 'No email in auth'}`);
      console.log(`   Auth confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ❌ No auth user found`);
    }

    // Check if this user would be returned by the digest function
    const isMissing = profile?.display_name && missingNeighbors.includes(profile.display_name);
    if (isMissing) {
      console.log(`   🚨 THIS IS ONE OF THE MISSING NEIGHBORS!`);

      if (member.status !== 'active') {
        console.log(`   💡 REASON: Not marked as active in neighborhood_members`);
      } else if (!authUser?.user?.email) {
        console.log(`   💡 REASON: No email address in auth.users table`);
      } else {
        console.log(`   💡 REASON: Unknown - should be included but isn't`);
      }
    }

    console.log('');
  }

  // Step 3: Run the digest function to see what it returns
  console.log('3️⃣ Running get_neighborhood_emails_for_digest function...');
  const { data: digestEmails, error: digestError } = await supabase
    .rpc('get_neighborhood_emails_for_digest', {
      target_neighborhood_id: neighborhoodId
    });

  if (digestError) {
    console.log('❌ Error calling digest function:', digestError);
  } else {
    console.log(`Function returned ${digestEmails.length} recipients:`);
    digestEmails.forEach(recipient => {
      console.log(`  ✅ ${recipient.display_name} (${recipient.email})`);
    });
  }

  console.log('');
  console.log('🎯 SUMMARY');
  console.log('==========');
  console.log(`Total members in neighborhood: ${allMembers.length}`);
  console.log(`Active members: ${activeMembers.length}`);
  console.log(`Digest function returned: ${digestEmails?.length || 0}`);
  console.log(`Expected from UI: 7`);
  console.log(`Missing: ${7 - (digestEmails?.length || 0)}`);
}

debugMissingNeighbors().catch(console.error);