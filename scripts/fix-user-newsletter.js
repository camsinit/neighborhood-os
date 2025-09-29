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

async function fixUserNewsletter(userId, neighborhoodId) {
  console.log('🔧 Fixing Newsletter Settings for User');
  console.log('=====================================');
  console.log('User ID:', userId);
  console.log('Neighborhood ID:', neighborhoodId);
  console.log('');

  try {
    // 1. Check if user exists
    console.log('1️⃣ Checking user in auth.users...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      console.error('❌ User not found in auth.users:', authError);
      console.log('\n⚠️  This user needs to be created in the authentication system first.');
      return;
    }

    console.log('✅ Found auth user:');
    console.log('   Email:', authUser.user.email || 'NO EMAIL!');
    console.log('   Created:', authUser.user.created_at);

    if (!authUser.user.email) {
      console.error('\n❌ User has no email address! Cannot send newsletter.');
      return;
    }

    // 2. Check/Create profile
    console.log('\n2️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log('⚠️  Profile not found, creating...');

      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: authUser.user.email.split('@')[0],
          username: authUser.user.email.split('@')[0],
          notification_preferences: {
            email: {
              enabled: true,
              types: {
                weekly_summary: true
              }
            }
          }
        });

      if (createError) {
        console.error('❌ Failed to create profile:', createError);
        return;
      }
      console.log('✅ Profile created with newsletter enabled');
    } else {
      console.log('✅ Profile exists');

      // Fix notification preferences
      console.log('\n3️⃣ Fixing notification preferences...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          notification_preferences: {
            email: {
              enabled: true,
              types: {
                weekly_summary: true
              }
            }
          }
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Failed to update preferences:', updateError);
      } else {
        console.log('✅ Newsletter preferences enabled');
      }
    }

    // 3. Check/Create neighborhood membership
    console.log('\n4️⃣ Checking neighborhood membership...');
    const { data: membership, error: memberError } = await supabase
      .from('neighborhood_members')
      .select('*')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .single();

    if (memberError || !membership) {
      console.log('⚠️  Not a member, adding to neighborhood...');

      const { error: joinError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: userId,
          neighborhood_id: neighborhoodId,
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (joinError) {
        console.error('❌ Failed to add to neighborhood:', joinError);
        return;
      }
      console.log('✅ Added as active neighborhood member');
    } else if (membership.status !== 'active') {
      console.log('⚠️  Membership not active, activating...');

      const { error: activateError } = await supabase
        .from('neighborhood_members')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .eq('neighborhood_id', neighborhoodId);

      if (activateError) {
        console.error('❌ Failed to activate membership:', activateError);
      } else {
        console.log('✅ Membership activated');
      }
    } else {
      console.log('✅ Already an active member');
    }

    // 4. Test the digest function again
    console.log('\n5️⃣ Testing newsletter recipient list...');
    const { data: recipients, error: recipientError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', {
        target_neighborhood_id: neighborhoodId
      });

    if (recipientError) {
      console.error('❌ Error getting recipients:', recipientError);
    } else {
      const userInList = recipients?.find(r => r.user_id === userId);

      if (userInList) {
        console.log('✅ SUCCESS! User is now in newsletter recipient list');
        console.log('   Email:', userInList.email);
        console.log('   Display name:', userInList.display_name);
        console.log('\n🎉 User is ready to receive newsletters!');
        console.log('   Run the send script again to send the newsletter.');
      } else {
        console.log('❌ User still not in recipient list');
        console.log('   Total recipients:', recipients?.length || 0);

        if (recipients && recipients.length > 0) {
          console.log('\n   Recipients who WILL get newsletter:');
          recipients.forEach(r => {
            console.log(`   - ${r.display_name} (${r.email})`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Your user ID
const userId = '74bf3085-8275-4eb2-a721-8c8e91b3d3d8';
const neighborhoodId = 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';

console.log('================================================');
console.log('   FIX USER NEWSLETTER SETTINGS');
console.log('================================================\n');

fixUserNewsletter(userId, neighborhoodId);