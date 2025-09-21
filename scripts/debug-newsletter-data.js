#!/usr/bin/env node

/**
 * Debug Newsletter Data Script
 * 
 * This script helps debug why newsletter data isn't showing expected results
 * It runs the same queries as the newsletter but shows detailed results
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function debugNewsletterData() {
  const args = process.argv.slice(2);
  const neighborhoodId = args[0];

  if (!neighborhoodId) {
    console.error('❌ Error: Please provide a neighborhood ID');
    console.log('\nUsage: node scripts/debug-newsletter-data.js [neighborhoodId]');
    process.exit(1);
  }

  console.log(`🔍 Debugging newsletter data for neighborhood: ${neighborhoodId}`);
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Calculate date range for the past week (same as newsletter)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();
  const nowISO = new Date().toISOString();
  
  console.log(`📅 Date range: ${weekAgoISO} to ${nowISO}`);
  console.log(`📅 Week ago: ${weekAgo.toLocaleDateString()} ${weekAgo.toLocaleTimeString()}`);
  console.log(`📅 Now: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);

  try {
    // Get neighborhood info
    console.log('\n🏘️  Getting neighborhood info...');
    const { data: neighborhood, error: neighborhoodError } = await supabase
      .from('neighborhoods')
      .select('name, created_at')
      .eq('id', neighborhoodId)
      .single();
    
    if (neighborhoodError) {
      console.error('❌ Error getting neighborhood:', neighborhoodError);
      return;
    }
    
    console.log(`✅ Neighborhood: ${neighborhood.name} (created: ${neighborhood.created_at})`);

    // Debug new members query
    console.log('\n👥 Debugging new members query...');
    console.log('Query: neighborhood_members where neighborhood_id =', neighborhoodId, 'and joined_at >=', weekAgoISO);
    
    const { data: newMembersData, error: newMembersError } = await supabase
      .from('neighborhood_members')
      .select(`
        user_id,
        joined_at,
        status,
        profiles!inner(display_name, created_at)
      `)
      .eq('neighborhood_id', neighborhoodId)
      .gte('joined_at', weekAgoISO)
      .limit(10);

    if (newMembersError) {
      console.error('❌ Error getting new members:', newMembersError);
    } else {
      console.log(`📊 Found ${newMembersData?.length || 0} new members this week:`);
      newMembersData?.forEach((member, i) => {
        console.log(`   ${i+1}. ${member.profiles?.display_name || 'No name'} (${member.user_id})`);
        console.log(`      Joined: ${member.joined_at}`);
        console.log(`      Status: ${member.status}`);
        console.log(`      Profile created: ${member.profiles?.created_at}`);
      });
    }

    // Let's also check all members to see what's there
    console.log('\n👥 All members in neighborhood (for comparison):');
    const { data: allMembers, error: allMembersError } = await supabase
      .from('neighborhood_members')
      .select(`
        user_id,
        joined_at,
        status,
        profiles!inner(display_name)
      `)
      .eq('neighborhood_id', neighborhoodId)
      .order('joined_at', { ascending: false })
      .limit(20);

    if (allMembersError) {
      console.error('❌ Error getting all members:', allMembersError);
    } else {
      console.log(`📊 Total members found: ${allMembers?.length || 0}`);
      allMembers?.forEach((member, i) => {
        const joinedDate = new Date(member.joined_at);
        const isThisWeek = joinedDate >= weekAgo;
        console.log(`   ${i+1}. ${member.profiles?.display_name || 'No name'} - ${member.joined_at} ${isThisWeek ? '🆕' : ''}`);
      });
    }

    // Check activities table for neighbor_joined events
    console.log('\n📝 Checking activities for neighbor_joined events...');
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('neighborhood_id', neighborhoodId)
      .eq('activity_type', 'neighbor_joined')
      .gte('created_at', weekAgoISO)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.error('❌ Error getting activities:', activitiesError);
    } else {
      console.log(`📊 Found ${activities?.length || 0} neighbor_joined activities this week:`);
      activities?.forEach((activity, i) => {
        console.log(`   ${i+1}. ${activity.title} - ${activity.created_at}`);
        console.log(`      Actor: ${activity.actor_id}`);
        console.log(`      Metadata:`, activity.metadata);
      });
    }

    // Check recent skills
    console.log('\n🛠️  Checking recent skills...');
    const { data: skillsData, error: skillsError } = await supabase
      .from('skills_exchange')
      .select('id, title, skill_category, request_type, created_at, is_archived')
      .eq('neighborhood_id', neighborhoodId)
      .gte('created_at', weekAgoISO)
      .order('created_at', { ascending: false });

    if (skillsError) {
      console.error('❌ Error getting skills:', skillsError);
    } else {
      console.log(`📊 Found ${skillsData?.length || 0} skills activities this week:`);
      skillsData?.forEach((skill, i) => {
        console.log(`   ${i+1}. ${skill.title} (${skill.request_type}) - ${skill.created_at} - Archived: ${skill.is_archived}`);
      });
    }

    // Check all skills for comparison
    console.log('\n🛠️  All skills in neighborhood (for comparison):');
    const { data: allSkills, error: allSkillsError } = await supabase
      .from('skills_exchange')
      .select('id, title, skill_category, request_type, created_at, is_archived')
      .eq('neighborhood_id', neighborhoodId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (allSkillsError) {
      console.error('❌ Error getting all skills:', allSkillsError);
    } else {
      console.log(`📊 Total skills found: ${allSkills?.length || 0}`);
      allSkills?.forEach((skill, i) => {
        const createdDate = new Date(skill.created_at);
        const isThisWeek = createdDate >= weekAgo;
        console.log(`   ${i+1}. ${skill.title} (${skill.request_type}) - ${skill.created_at} - Archived: ${skill.is_archived} ${isThisWeek ? '🆕' : ''}`);
      });
    }

  } catch (error) {
    console.error('❌ Error debugging newsletter data:', error);
  }
}

// Run the script
debugNewsletterData();
