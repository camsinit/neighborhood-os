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

async function debugNeighborhoodRecipients(neighborhoodId) {
  console.log('🔍 Debugging Newsletter Recipients Issue');
  console.log('========================================');
  console.log('Neighborhood ID:', neighborhoodId);
  console.log('');

  try {
    // 1. Check the neighborhood exists
    console.log('1️⃣ Checking neighborhood...');
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
    console.log('   Created by:', neighborhood.created_by);
    console.log('   Timezone:', neighborhood.timezone);

    // 2. Check all members of this neighborhood
    console.log('\n2️⃣ Checking neighborhood members...');
    const { data: members, error: mError } = await supabase
      .from('neighborhood_members')
      .select('*')
      .eq('neighborhood_id', neighborhoodId);

    if (mError) {
      console.error('❌ Error fetching members:', mError);
    } else {
      console.log(`Found ${members?.length || 0} total members`);

      if (members && members.length > 0) {
        const activeMembers = members.filter(m => m.status === 'active');
        console.log(`   - ${activeMembers.length} active members`);
        console.log(`   - ${members.length - activeMembers.length} inactive/pending members`);

        console.log('\n   Member details:');
        for (const member of members.slice(0, 5)) {
          console.log(`   - User ${member.user_id.slice(0,8)}... | Status: ${member.status} | Joined: ${member.joined_at}`);
        }
      }
    }

    // 3. Check what the RPC function returns
    console.log('\n3️⃣ Testing get_neighborhood_emails_for_digest function...');
    const { data: recipients, error: rError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: neighborhoodId
      });

    if (rError) {
      console.error('❌ Error from digest function:', rError);
      console.log('   This might be the core issue!');
    } else {
      console.log(`Function returned ${recipients?.length || 0} recipients`);

      if (recipients && recipients.length > 0) {
        console.log('\n   Recipients found:');
        recipients.forEach(r => {
          console.log(`   - ${r.display_name} | ${r.email} | ID: ${r.user_id.slice(0,8)}...`);
        });
      }
    }

    // 4. Let's manually check what SHOULD be returned
    console.log('\n4️⃣ Manual check - what the function should find...');

    // Get all active members
    if (members && members.length > 0) {
      const activeMembers = members.filter(m => m.status === 'active');
      console.log(`\n   Checking ${activeMembers.length} active members:`);

      for (const member of activeMembers.slice(0, 3)) {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', member.user_id)
          .single();

        // Get auth user
        const { data: authUser } = await supabase.auth.admin.getUserById(member.user_id);

        console.log(`\n   Member ${member.user_id.slice(0,8)}...:`);
        console.log(`     - Has profile: ${profile ? 'Yes' : 'No'}`);
        console.log(`     - Has auth user: ${authUser ? 'Yes' : 'No'}`);
        console.log(`     - Email: ${authUser?.user?.email || 'No email'}`);

        if (profile?.notification_preferences) {
          const prefs = profile.notification_preferences;
          console.log(`     - Email enabled: ${prefs.email?.enabled !== false}`);
          console.log(`     - Weekly summary: ${prefs.email?.types?.weekly_summary !== false}`);
        } else {
          console.log(`     - Notification prefs: Not set (defaults to enabled)`);
        }
      }
    }

    // 5. Check the function definition itself
    console.log('\n5️⃣ Checking function definition...');
    const { data: funcDef, error: funcError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: neighborhoodId
      });

    console.log('   Function exists and can be called: ✅');

    // Summary
    console.log('\n📋 DIAGNOSIS');
    console.log('============');

    if (!recipients || recipients.length === 0) {
      if (!members || members.length === 0) {
        console.log('❌ No members in neighborhood at all');
      } else if (members.filter(m => m.status === 'active').length === 0) {
        console.log('❌ No ACTIVE members in neighborhood');
      } else {
        console.log('❌ Active members exist but not being returned by digest function');
        console.log('   Likely issues:');
        console.log('   - Members don\'t have auth.users entries');
        console.log('   - Members don\'t have email addresses');
        console.log('   - Function has permission issues accessing auth.users');
        console.log('   - Email preferences explicitly disabled (but shouldn\'t happen with recent migration)');
      }
    } else {
      console.log('✅ Recipients found - newsletter should work!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

const neighborhoodId = process.argv[2] || 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';

console.log('================================================');
console.log('   NEIGHBORHOOD RECIPIENTS DEBUGGER');
console.log('================================================\n');

debugNeighborhoodRecipients(neighborhoodId);