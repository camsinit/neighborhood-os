#!/usr/bin/env node

/**
 * Fixed Newsletter Debug Script
 * 
 * This script helps identify why newsletter data is inaccurate by:
 * 1. Using proper weekly date ranges (Sunday to Sunday)
 * 2. Checking data with different join strategies
 * 3. Showing detailed timestamps and comparisons
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function debugNewsletterData() {
  const args = process.argv.slice(2);
  const neighborhoodId = args[0];

  if (!neighborhoodId) {
    console.error('❌ Error: Please provide a neighborhood ID');
    console.log('\nUsage: node scripts/fix-newsletter-debug.js [neighborhoodId]');
    process.exit(1);
  }

  console.log(`🔍 Debugging newsletter data for neighborhood: ${neighborhoodId}`);
  
  // Calculate BETTER date ranges
  const now = new Date();
  
  // Current newsletter logic (problematic)
  const currentWeekAgo = new Date();
  currentWeekAgo.setDate(currentWeekAgo.getDate() - 7);
  
  // Better logic: Last Sunday to This Sunday
  const thisSunday = new Date();
  thisSunday.setDate(now.getDate() - now.getDay()); // Go to start of this week (Sunday)
  thisSunday.setHours(0, 0, 0, 0);
  
  const lastSunday = new Date(thisSunday);
  lastSunday.setDate(thisSunday.getDate() - 7);
  
  console.log(`\n📅 Current Newsletter Logic (PROBLEMATIC):`);
  console.log(`   Range: ${currentWeekAgo.toISOString()} to ${now.toISOString()}`);
  console.log(`   Human: ${currentWeekAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`);
  
  console.log(`\n📅 Better Weekly Logic (RECOMMENDED):`);
  console.log(`   Range: ${lastSunday.toISOString()} to ${thisSunday.toISOString()}`);
  console.log(`   Human: ${lastSunday.toLocaleDateString()} to ${thisSunday.toLocaleDateString()}`);

  try {
    // Test with direct API calls (simulating the function's approach)
    console.log('\n🔍 Testing with direct Supabase API calls...');
    
    // Test new members with current logic
    console.log('\n👥 New Members (Current Logic):');
    const newMembersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/neighborhood_members?neighborhood_id=eq.${neighborhoodId}&joined_at=gte.${currentWeekAgo.toISOString()}&select=user_id,joined_at,status,profiles(display_name,created_at)`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      }
    );
    
    if (newMembersResponse.ok) {
      const newMembers = await newMembersResponse.json();
      console.log(`   Found: ${newMembers.length} members`);
      newMembers.forEach((member, i) => {
        console.log(`   ${i+1}. User ${member.user_id}`);
        console.log(`      Joined: ${member.joined_at}`);
        console.log(`      Profile: ${member.profiles?.display_name || 'No name'}`);
        console.log(`      Status: ${member.status}`);
      });
    } else {
      console.log(`   ❌ API Error: ${newMembersResponse.status}`);
    }

    // Test new members with better logic
    console.log('\n👥 New Members (Better Logic - Sunday to Sunday):');
    const betterMembersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/neighborhood_members?neighborhood_id=eq.${neighborhoodId}&joined_at=gte.${lastSunday.toISOString()}&joined_at=lt.${thisSunday.toISOString()}&select=user_id,joined_at,status,profiles(display_name,created_at)`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      }
    );
    
    if (betterMembersResponse.ok) {
      const betterMembers = await betterMembersResponse.json();
      console.log(`   Found: ${betterMembers.length} members`);
      betterMembers.forEach((member, i) => {
        console.log(`   ${i+1}. User ${member.user_id}`);
        console.log(`      Joined: ${member.joined_at}`);
        console.log(`      Profile: ${member.profiles?.display_name || 'No name'}`);
        console.log(`      Status: ${member.status}`);
      });
    } else {
      console.log(`   ❌ API Error: ${betterMembersResponse.status}`);
    }

    // Test ALL members to see what's actually there
    console.log('\n👥 ALL Members (for comparison):');
    const allMembersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/neighborhood_members?neighborhood_id=eq.${neighborhoodId}&select=user_id,joined_at,status,profiles(display_name)&order=joined_at.desc&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      }
    );
    
    if (allMembersResponse.ok) {
      const allMembers = await allMembersResponse.json();
      console.log(`   Found: ${allMembers.length} total members (showing last 10)`);
      allMembers.forEach((member, i) => {
        const joinedDate = new Date(member.joined_at);
        const isThisWeek = joinedDate >= currentWeekAgo;
        const isBetterWeek = joinedDate >= lastSunday && joinedDate < thisSunday;
        console.log(`   ${i+1}. ${member.profiles?.display_name || 'No name'}`);
        console.log(`      Joined: ${member.joined_at} ${isThisWeek ? '🟡 Current Logic' : ''} ${isBetterWeek ? '🟢 Better Logic' : ''}`);
        console.log(`      Status: ${member.status}`);
      });
    } else {
      console.log(`   ❌ API Error: ${allMembersResponse.status} - ${await allMembersResponse.text()}`);
    }

    // Test skills with different approaches
    console.log('\n🛠️  Skills Analysis:');
    
    // Current logic: created this week AND not archived
    const currentSkillsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/skills_exchange?neighborhood_id=eq.${neighborhoodId}&created_at=gte.${currentWeekAgo.toISOString()}&is_archived=eq.false&select=id,title,skill_category,request_type,created_at,is_archived`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      }
    );
    
    if (currentSkillsResponse.ok) {
      const currentSkills = await currentSkillsResponse.json();
      console.log(`   📊 Skills created this week (current logic): ${currentSkills.length}`);
      currentSkills.forEach((skill, i) => {
        console.log(`   ${i+1}. ${skill.title} (${skill.request_type}) - ${skill.created_at}`);
      });
    }

    // All skills for comparison
    const allSkillsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/skills_exchange?neighborhood_id=eq.${neighborhoodId}&select=id,title,skill_category,request_type,created_at,is_archived&order=created_at.desc&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      }
    );
    
    if (allSkillsResponse.ok) {
      const allSkills = await allSkillsResponse.json();
      console.log(`   📊 All skills (last 10): ${allSkills.length}`);
      allSkills.forEach((skill, i) => {
        const createdDate = new Date(skill.created_at);
        const isThisWeek = createdDate >= currentWeekAgo;
        console.log(`   ${i+1}. ${skill.title} (${skill.request_type})`);
        console.log(`      Created: ${skill.created_at} ${isThisWeek ? '🆕' : ''}`);
        console.log(`      Archived: ${skill.is_archived}`);
      });
    }

  } catch (error) {
    console.error('❌ Error debugging newsletter data:', error);
    
    console.log('\n🔧 Possible Issues:');
    console.log('1. Row Level Security (RLS) preventing access to neighborhood data');
    console.log('2. Neighborhood ID might not exist or be accessible with anon key');
    console.log('3. Date range logic might be excluding recent data');
    console.log('4. Profile joins might be filtering out members without complete profiles');
  }
}

// Run the script
debugNewsletterData();
