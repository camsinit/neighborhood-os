import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { WeeklySummaryEmail } from './_templates/weekly-summary.tsx'
import { corsHeaders, handleCorsPreflightRequest, successResponse, errorResponse } from '../_shared/cors.ts'
import { getProfileURL, getEventURL, getSkillURL, getGroupURL } from './_utils/urlGenerator.ts'
import { convertToSendingDomainUrl } from './_utils/imageProxy.ts'

// Activity grouping logic (copied from frontend)
interface Activity {
  id: string;
  actor_id: string;
  activity_type: string;
  title: string;
  content_id: string;
  created_at: string;
  metadata?: any;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface ActivityGroup {
  id: string;
  type: 'grouped' | 'single';
  activities: Activity[];
  primaryActivity: Activity;
  count: number;
}

/**
 * Groups activities that are similar and close in time
 * Same logic as frontend src/utils/activityGrouping.ts
 */
const groupActivities = (activities: Activity[]): ActivityGroup[] => {
  const groups: ActivityGroup[] = [];
  const processed = new Set<string>();

  for (const activity of activities) {
    if (processed.has(activity.id)) continue;

    const similarActivities = activities.filter(other => {
      if (processed.has(other.id) || other.id === activity.id) return false;

      if (other.actor_id !== activity.actor_id || other.activity_type !== activity.activity_type) {
        return false;
      }

      const timeDiff = Math.abs(
        new Date(other.created_at).getTime() - new Date(activity.created_at).getTime()
      );
      return timeDiff <= 60000; // 1 minute
    });

    const groupActivities = [activity, ...similarActivities];

    if (groupActivities.length >= 2) {
      groups.push({
        id: `group-${activity.id}`,
        type: 'grouped',
        activities: groupActivities,
        primaryActivity: activity,
        count: groupActivities.length
      });

      groupActivities.forEach(a => processed.add(a.id));
    } else {
      groups.push({
        id: activity.id,
        type: 'single',
        activities: [activity],
        primaryActivity: activity,
        count: 1
      });
      processed.add(activity.id);
    }
  }

  return groups;
};

// Initialize Claude API client
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!


interface WeeklySummaryRequest {
  neighborhoodId: string;
  testEmail?: string; // Optional: for testing purposes
  previewOnly?: boolean; // Optional: for preview mode (returns HTML without sending)
}

/**
 * Generate AI-powered newsletter content using Claude
 * This function takes comprehensive neighborhood activity data and creates engaging, personalized content
 * structured in 3 sections: new neighbor welcome, past week recap, and week ahead preview
 */
async function generateAIContent(neighborhoodName: string, stats: any, highlights: any, neighborhoodId: string, newNeighbors: any[], pastWeekActivities: any, upcomingActivities: any) {
  console.log('🤖 Starting AI content generation...');
  console.log('🔑 CLAUDE_API_KEY exists:', !!CLAUDE_API_KEY);
  console.log('🔑 CLAUDE_API_KEY length:', CLAUDE_API_KEY ? CLAUDE_API_KEY.length : 0);

  // If no Claude API key is available, return default content in new 3-section format
  if (!CLAUDE_API_KEY) {
    console.log('❌ No Claude API key found, using default content');
    const createEventUrl = `https://neighborhoodos.com/n/${neighborhoodId}/calendar?create=true`;
    const createSkillUrl = `https://neighborhoodos.com/n/${neighborhoodId}/skills?create=true`;
    const createGroupUrl = `https://neighborhoodos.com/n/${neighborhoodId}/groups?create=true`;
    
    return {
      thisWeek: "This past week brought new connections and community activity. Thank you to everyone who participated in making our neighborhood more vibrant.",
      weekAhead: "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
      getInvolved: [
        `<a href="${createEventUrl}">Since Parker offers electronic music production, organize a beat-making workshop</a> where neighbors can learn to create their own tracks.`,
        `<a href="${createSkillUrl}">With Pamela's Costco expertise and Laura's meal exchanges, coordinate a bulk cooking group</a> to share ingredients and recipes.`,
        `<a href="${createGroupUrl}">Parker's tech skills (WiFi troubleshooting, computer help) could launch a neighborhood tech support circle</a>.`
      ]
    };
  }

  console.log('✅ Claude API key found, proceeding with AI generation...');

  try {
    // Calculate total activity count to detect low-activity periods
    const totalActivities = 
      pastWeekActivities.completedEvents.length + 
      pastWeekActivities.archivedGoods.length + 
      pastWeekActivities.completedSkills.length + 
      pastWeekActivities.safetyUpdates.length +
      upcomingActivities.events.length + 
      upcomingActivities.skills.length + 
      upcomingActivities.goods.length;
    
    const isLowActivity = totalActivities <= 2; // Consider 2 or fewer activities as "low"
    
    // Create activity URLs for easy posting (using the same URL generation pattern)
    const createEventUrl = `https://neighborhoodos.com/n/${neighborhoodId}/calendar?create=true`;
    const createSkillUrl = `https://neighborhoodos.com/n/${neighborhoodId}/skills?create=true`;
    const createGoodsUrl = `https://neighborhoodos.com/n/${neighborhoodId}/goods?create=true`;
    const createSafetyUrl = `https://neighborhoodos.com/n/${neighborhoodId}/safety?create=true`;
    
    // Get current date for seasonal context
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const currentSeason = currentMonth === 'December' || currentMonth === 'January' || currentMonth === 'February' ? 'winter' :
                         currentMonth === 'March' || currentMonth === 'April' || currentMonth === 'May' ? 'spring' :
                         currentMonth === 'June' || currentMonth === 'July' || currentMonth === 'August' ? 'summer' : 'fall';

    // Format neighborhood data for AI analysis
    const skillSpotlight = upcomingActivities.skills.reduce((acc, skill) => {
      if (!acc[skill.neighborName]) {
        acc[skill.neighborName] = [];
      }
      acc[skill.neighborName].push(`${skill.title} (${skill.category})`);
      return acc;
    }, {});

    const skillCategories = upcomingActivities.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(`${skill.neighborName}: ${skill.title}`);
      return acc;
    }, {});

    // Identify skill gaps - common categories that are missing
    const availableCategories = Object.keys(skillCategories);
    const commonSkillCategories = ['home_repair', 'automotive', 'gardening', 'childcare', 'cooking', 'crafts'];
    const missingCategories = commonSkillCategories.filter(cat => !availableCategories.includes(cat));

    const prompt = `You are writing suggestions for a neighborhood newsletter in "${neighborhoodName}". Your job is to create 3 specific, actionable suggestions that reference actual neighbors and their real skills.

ACTUAL NEIGHBORHOOD DATA:

NEIGHBORS AND THEIR SKILLS:
${Object.entries(skillSpotlight).map(([neighbor, skills]) =>
  `${neighbor}: ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ` (+ ${skills.length - 3} more)` : ''}`
).join('\n')}

SKILLS BY CATEGORY:
${Object.entries(skillCategories).map(([category, skills]) =>
  `${category}: ${skills.slice(0, 2).join(', ')}${skills.length > 2 ? ` (+ ${skills.length - 2} more)` : ''}`
).join('\n')}

MISSING SKILL GAPS:
${missingCategories.length > 0 ? missingCategories.join(', ') : 'Most common skills are covered'}

PERFECT EXAMPLES OF WHAT I WANT:
✅ "Since Parker offers electronic music production, organize a beat-making workshop where neighbors can learn to create their own tracks"
✅ "With Pamela's Costco expertise and Laura's meal exchanges, coordinate a bulk cooking group to share ingredients and recipes"
✅ "Parker's tech skills (WiFi troubleshooting, computer help) could launch a neighborhood tech support circle"

❌ AVOID THESE GENERIC EXAMPLES:
- "Organize a skill-sharing workshop"
- "Request skills that complement our expertise"
- "Start a neighborhood support group"

YOUR TASK:
Write exactly 3 suggestions that:
1. Use ACTUAL neighbor names from the data above
2. Reference their SPECIFIC skills
3. Create concrete, actionable ideas
4. Connect neighbors with related skills when possible

REQUIREMENTS:
- Use actual neighbor names and skills from the data
- Be specific and actionable
- 1-2 sentences per suggestion
- Include natural links:
  * Events: ${createEventUrl}
  * Skills: ${createSkillUrl}
  * Groups: ${createGroupUrl}
- No em-dashes (—), use regular hyphens only
- Friendly but not overly excited

Return as JSON array: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

    console.log('📝 Prompt length:', prompt.length);
    console.log('🎯 Skill data being sent:', Object.keys(skillSpotlight).length, 'neighbors with skills');
    console.log('📊 Categories:', Object.keys(skillCategories));

    // Call Claude API
    console.log('🚀 Calling Claude API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    console.log('📨 Claude API response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Claude API error:', response.status, errorBody);
      throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log('✅ Claude API response received');
    const content = data.content[0].text;
    console.log('📄 Raw AI response:', content);

    // Try to parse the JSON response as array of suggestions
    try {
      const suggestions = JSON.parse(content);
      console.log('✨ AI suggestions generated successfully:', suggestions);

      // Build the full AI content structure with the suggestions
      return {
        thisWeek: upcomingActivities.skills.length > 0 ?
          `This past week brought new connections and community activity. ${upcomingActivities.skills.slice(0, 3).map(s => s.neighborName).filter((v, i, a) => a.indexOf(v) === i).join(', ')} shared valuable skills with the neighborhood.` :
          "This past week brought new connections and community activity. Thank you to everyone who participated in making our neighborhood more vibrant.",
        weekAhead: upcomingActivities.events.length > 0 ?
          `We have ${upcomingActivities.events.length} event${upcomingActivities.events.length !== 1 ? 's' : ''} coming up this week! Check the calendar to join in.` :
          "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
        getInvolved: suggestions // Use the AI-generated specific suggestions
      };
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', content);
      // Return default content with dynamic suggestions structure
      const createEventUrl = `https://neighborhoodos.com/n/${neighborhoodId}/calendar?create=true`;
      const createSkillUrl = `https://neighborhoodos.com/n/${neighborhoodId}/skills?create=true`;
      const createGroupUrl = `https://neighborhoodos.com/n/${neighborhoodId}/groups?create=true`;

      return {
        thisWeek: newNeighbors.length > 0 ?
          `Welcome to our newest neighbors: ${newNeighbors.map(n => `<a href="${n.profileUrl}">${n.name}</a>`).join(', ')}! This week brought new connections and community activity.` :
          "This past week brought new connections and community activity. Thank you to everyone who participated in making our neighborhood more vibrant.",
        weekAhead: "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
        getInvolved: [
          `<a href="${createEventUrl}">Since Parker offers electronic music production, organize a beat-making workshop</a> where neighbors can learn to create their own tracks.`,
          `<a href="${createSkillUrl}">With Pamela's Costco expertise and Laura's meal exchanges, coordinate a bulk cooking group</a> to share ingredients and recipes.`,
          `<a href="${createGroupUrl}">Parker's tech skills (WiFi troubleshooting, computer help) could launch a neighborhood tech support circle</a>.`
        ]
      };
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    // Return default content with dynamic suggestions structure
    const createEventUrl = `https://neighborhoodos.com/n/${neighborhoodId}/calendar?create=true`;
    const createSkillUrl = `https://neighborhoodos.com/n/${neighborhoodId}/skills?create=true`;
    const createGroupUrl = `https://neighborhoodos.com/n/${neighborhoodId}/groups?create=true`;
    
    return {
      thisWeek: newNeighbors.length > 0 ?
        `Welcome to our newest neighbors: ${newNeighbors.map(n => `<a href="${n.profileUrl}">${n.name}</a>`).join(', ')}! This week brought new connections and community activity.` :
        "This past week brought new connections and community activity. Thank you to everyone who participated in making our neighborhood more vibrant.",
      weekAhead: "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
      getInvolved: [
        `<a href="${createEventUrl}">Since Parker offers electronic music production, organize a beat-making workshop</a> where neighbors can learn to create their own tracks.`,
        `<a href="${createSkillUrl}">With Pamela's Costco expertise and Laura's meal exchanges, coordinate a bulk cooking group</a> to share ingredients and recipes.`,
        `<a href="${createGroupUrl}">Parker's tech skills (WiFi troubleshooting, computer help) could launch a neighborhood tech support circle</a>.`
      ]
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { neighborhoodId, testEmail, previewOnly }: WeeklySummaryRequest = await req.json();
    
    // Calculate date range for the past week (7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();
    
    // Get neighborhood info including cover image
    const { data: neighborhood } = await supabase
      .from('neighborhoods')
      .select('name, invite_header_image_url')
      .eq('id', neighborhoodId)
      .single();
    
    if (!neighborhood) {
      throw new Error('Neighborhood not found');
    }

    // Use the new efficient function to get member emails with preferences
    const { data: memberEmails, error: emailsError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', { 
        target_neighborhood_id: neighborhoodId 
      });

    if (emailsError) {
      console.error('Error fetching member emails:', emailsError);
      throw new Error(`Failed to get member emails: ${emailsError.message}`);
    }

    // Transform the data to match expected format
    const formattedEmails = memberEmails?.map(member => ({
      email: member.email,
      name: member.display_name || 'Neighbor'
    })) || [];

    // Gather comprehensive weekly activity data
    const [
      upcomingEventsData,
      createdEventsData,
      availableSkillsData,
      completedSkillsData,
      newMembersData
    ] = await Promise.all([
      // Events happening in next 7 days (for Week Ahead section)
      supabase
        .from('events')
        .select('id, title, time, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', new Date().toISOString())
        .lte('time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_archived', false)
        .order('time')
        .limit(10),

      // Events created in past week (for Calendar Events section)
      supabase
        .from('events')
        .select('id, title, time, created_at, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('created_at', weekAgoISO)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(10),


      // Current available skills (recent posts) with user profiles - ONLY from this week
      supabase
        .from('skills_exchange')
        .select(`
          id,
          title,
          skill_category,
          request_type,
          created_at,
          user_id,
          profiles!skills_exchange_user_id_fkey(id, display_name)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(15),

      // Completed skills activities (recently archived)
      supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type, archived_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', true)
        .gte('archived_at', weekAgoISO)
        .order('archived_at', { ascending: false })
        .limit(10),

      // New members this week with profiles
      supabase
        .from('neighborhood_members')
        .select(`
          user_id,
          profiles!inner(display_name)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .gte('joined_at', weekAgoISO)
        .limit(10),

      // Profile updates this week
      supabase
        .from('profiles')
        .select('id, display_name, updated_at')
        .gte('updated_at', weekAgoISO)
        .order('updated_at', { ascending: false })
        .limit(5),

    ]);

    // DEBUG: Log the raw query results
    console.log('🔍 DEBUG: Raw query results:');
    console.log('📅 Events data:', upcomingEventsData.data?.length || 0, 'items');
    console.log('🧠 Skills data:', availableSkillsData.data?.length || 0, 'items');
    console.log('👥 Members data:', newMembersData.data?.length || 0, 'items');
    
    if (availableSkillsData.error) {
      console.log('❌ Skills query error:', availableSkillsData.error);
    }
    if (upcomingEventsData.error) {
      console.log('❌ Events query error:', upcomingEventsData.error);
    }

    // Use the same activity fetching logic as the frontend to ensure consistent data
    const fetchActivitiesForNewsletter = async (neighborhoodId: string): Promise<any[]> => {
      if (!neighborhoodId) return [];

      // Single optimized query matching frontend exactly
      const { data: rawActivities, error } = await supabase
        .from('activities')
        .select(`
          id,
          actor_id,
          activity_type,
          content_id,
          content_type,
          title,
          created_at,
          neighborhood_id,
          metadata,
          is_public,
          profiles:actor_id (
            display_name,
            avatar_url
          )
        `)
        .eq('neighborhood_id', neighborhoodId)
        .order('created_at', { ascending: false })
        .limit(500); // Increased limit to ensure we get all recent activities

      if (error) throw error;

      // Transform and filter deleted items (matching frontend logic)
      const activities = (rawActivities || [])
        .map(rawActivity => ({
          ...rawActivity,
          metadata: rawActivity.metadata || null,
          profiles: rawActivity.profiles || { display_name: null, avatar_url: null }
        }))
        .filter(activity => {
          const metadata = activity.metadata;
          return !metadata?.deleted;
        });

      return activities;
    };

    const activitiesData = { data: await fetchActivitiesForNewsletter(neighborhoodId) };

    console.log('📊 Activities data for grouping:', activitiesData.data?.length || 0, 'items');

    // Process new neighbors with profile URLs
    const newNeighbors = newMembersData.data?.map(member => ({
      name: member.profiles?.display_name || 'New Neighbor',
      userId: member.user_id,
      profileUrl: getProfileURL(neighborhoodId, member.user_id)
    })) || [];

    // Process past week activities with URLs (current system only)
    const pastWeekActivities = {
      createdEvents: createdEventsData.data?.map(event => ({
        title: event.title,
        url: getEventURL(neighborhoodId, event.id),
        createdAt: event.created_at,
        eventTime: event.time
      })) || [],
      
      completedSkills: completedSkillsData.data?.map(skill => ({
        title: skill.title,
        url: getSkillURL(neighborhoodId, skill.id),
        category: skill.skill_category
      })) || []
    };

    // Process upcoming activities with URLs
    const upcomingActivities = {
      events: upcomingEventsData.data?.map(event => ({
        title: event.title,
        url: getEventURL(neighborhoodId, event.id),
        date: new Date(event.time).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }),
        attendees: Array.isArray(event.event_rsvps) ? event.event_rsvps.length : 0
      })) || [],
      
      
      skills: availableSkillsData.data?.map(skill => ({
        id: skill.id,
        title: skill.title,
        url: getSkillURL(neighborhoodId, skill.id, skill.skill_category),
        category: skill.skill_category,
        requestType: skill.request_type,
        neighborName: skill.profiles?.display_name || `Neighbor ${skill.user_id.substring(0, 8)}`,
        neighborUserId: skill.profiles?.id || skill.user_id,
        neighborProfileUrl: getProfileURL(neighborhoodId, skill.profiles?.id || skill.user_id)
      })) || []
    };

    // Format stats for email template (current system only)
    const stats = {
      newMembers: newNeighbors.length,
      upcomingEvents: upcomingActivities.events.length,
      activeSkillRequests: upcomingActivities.skills.filter(s => s.requestType === 'request').length,
      availableSkills: upcomingActivities.skills.filter(s => s.requestType === 'offer').length,
    };

    // CURATED HIGHLIGHTS - Focus on community story

    // Get activity groups for proper "View all" link detection
    const processedActivities = activitiesData.data?.map(activity => ({
      id: activity.id,
      actor_id: activity.actor_id,
      activity_type: activity.activity_type,
      title: activity.title,
      content_id: activity.content_id,
      created_at: activity.created_at,
      metadata: activity.metadata,
      profiles: {
        display_name: activity.profiles?.display_name || null,
        avatar_url: activity.profiles?.avatar_url || null
      }
    })) || [];

    // DEBUG: Show Parker's activities specifically
    const parkerActivities = processedActivities.filter(a => a.actor_id === 'f002afd9-be6d-492c-98a6-6501b2f25e48');
    console.log('🎯 Parker activities found:', parkerActivities.length);
    parkerActivities.forEach((activity, i) => {
      console.log(`  Activity ${i + 1}: ${activity.activity_type} - "${activity.title}" at ${activity.created_at}`);
    });

    // Filter activities to only this week (since last Sunday)
    const thisWeekActivities = processedActivities.filter(activity => {
      const activityDate = new Date(activity.created_at);
      return activityDate >= weekAgo;
    });

    console.log('🎯 DEBUG: Filtered activities to this week only:', thisWeekActivities.length, 'of', processedActivities.length, 'total activities');

    // Group activities using the same logic as the frontend, but only for this week's activities
    const activityGroups = groupActivities(thisWeekActivities);

    console.log('🎯 DEBUG: Found', activityGroups.length, 'total activity groups');
    activityGroups.forEach((group, i) => {
      console.log(`  Group ${i + 1}: ${group.type} - ${group.count} activities by ${group.primaryActivity.profiles?.display_name || group.primaryActivity.actor_id.substring(0, 8)} (${group.primaryActivity.activity_type})`);
      if (group.type === 'grouped') {
        console.log(`    Group ID: ${group.id}`);
      }
    });

    // Focus on skill activity groups
    const skillActivityGroups = activityGroups.filter(group =>
      group.primaryActivity.activity_type === 'skill_offered' ||
      group.primaryActivity.activity_type === 'skill_requested'
    );

    console.log('🧠 DEBUG: Found', skillActivityGroups.length, 'skill activity groups');

    // Create a map of user ID to activity group ID for people who actually have real grouped activities
    const activityGroupMap = new Map();

    // Frontend's URL generation logic (copied from useActivityGroupUrlState.ts)
    const createGroupUrlId = (group: any): string => {
      if (group.type === 'single') {
        return `group-${group.id}`;
      }

      // For grouped activities, create ID based on user and activity type (EXACTLY like frontend)
      const primaryActivity = group.primaryActivity;
      const activityType = primaryActivity.activity_type.replace('_', '-');
      return `group-${primaryActivity.actor_id}-${activityType}`;
    };

    // Use the real activity grouping results with frontend URL generation
    skillActivityGroups.forEach(group => {
      if (group.type === 'grouped' && group.count > 1) {
        const frontendUrlId = createGroupUrlId(group);
        activityGroupMap.set(group.primaryActivity.actor_id, frontendUrlId);
        console.log(`✅ Real activity group found: ${group.primaryActivity.profiles?.display_name || 'Unknown'} (${group.primaryActivity.actor_id.substring(0, 8)}) -> ${frontendUrlId}`);
      }
    });

    // Group skills by person for presentation, enhanced with activity group detection
    const skillsByPerson = upcomingActivities.skills.reduce((acc: any[], skill) => {
      const existingPerson = acc.find(p => p.neighborUserId === skill.neighborUserId);
      if (existingPerson) {
        existingPerson.skills.push(skill);
        existingPerson.skillCount = existingPerson.skills.length;
      } else {
        acc.push({
          neighborName: skill.neighborName,
          neighborUserId: skill.neighborUserId,
          neighborProfileUrl: skill.neighborProfileUrl,
          skillCount: 1,
          skills: [skill]
        });
      }
      return acc;
    }, [])
    .filter(person => person.skills.length > 0) // Only people with skills
    .sort((a, b) => b.skillCount - a.skillCount) // Sort by skill count
    .slice(0, 4) // Max 4 people
    .map(person => {
      // Use real activity group detection - only show "View all" for people with actual activity groups
      const activityGroupId = activityGroupMap.get(person.neighborUserId) || null;

      return {
        neighborName: person.neighborName,
        neighborUserId: person.neighborUserId,
        neighborProfileUrl: person.neighborProfileUrl,
        skillCount: person.skillCount,
        topSkills: person.skills.slice(0, 3), // Show top 3 skills
        allSkills: person.skills,
        activityGroupId: activityGroupId
      };
    });

    const highlights = {
      createdEvents: pastWeekActivities.createdEvents.slice(0, 4), // Max 4 events
      upcomingEvents: upcomingActivities.events.slice(0, 3), // Max 3 upcoming events
      skillsByPerson: skillsByPerson,
      totalSkills: upcomingActivities.skills.length,
      groups: {
        newGroups: [],
        recentJoins: [],
        activeGroups: [],
        groupEvents: [],
        groupUpdates: []
      }
    };

    // Format week date range
    const weekStart = new Date(weekAgo);
    const weekEnd = new Date();
    const weekOf = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Generate AI-powered content for the newsletter
    console.log('Generating AI-powered content...');
    console.log('New neighbors:', newNeighbors);
    console.log('Past week activities:', pastWeekActivities);
    console.log('Upcoming activities:', upcomingActivities);
    
    const aiContent = await generateAIContent(
      neighborhood.name,
      stats,
      highlights,
      neighborhoodId,
      newNeighbors,
      pastWeekActivities,
      upcomingActivities
    );
    console.log('AI content generated:', aiContent);

    // Generate the email HTML
    const html = await renderAsync(
      React.createElement(WeeklySummaryEmail, {
        neighborhoodName: neighborhood.name,
        neighborhoodId: neighborhoodId,
        memberName: testEmail ? 'Test User' : 'Neighbor',
        weekOf,
        baseUrl: 'https://neighborhoodos.com', // Use production URL directly
        coverImageUrl: convertToSendingDomainUrl(neighborhood.invite_header_image_url),
        stats,
        highlights,
        aiContent // Pass AI-generated content to email template
      })
    );

    // If preview mode, return the HTML without sending
    if (previewOnly) {
      console.log('Preview mode: returning HTML without sending emails');
      return new Response(
        JSON.stringify({ 
          success: true, 
          html,
          stats,
          highlights,
          preview: true
        }), 
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Determine recipients (test email or all members)
    const recipients = testEmail ? [{ email: testEmail, name: 'Test User' }] : formattedEmails;

    // Send emails with rate limiting to respect Resend's 2 requests/second limit
    const results = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      if (!recipient.email) {
        results.push({ status: 'fulfilled', value: null });
        continue;
      }

      console.log(`📧 Sending email ${i + 1}/${recipients.length} to ${recipient.email}...`);

      try {
        const result = await resend.emails.send({
          from: `NeighborhoodOS <weekly@updates.neighborhoodos.com>`,
          to: [recipient.email],
          subject: `Your ${neighborhood.name} weekly summary`,
          html,
          // Disable Resend's automatic link tracking to prevent URL wrapping
          tracking: {
            opens: true,
            clicks: false, // This prevents the long tracking URLs
          },
        });

        results.push({ status: 'fulfilled', value: result });
        console.log(`✅ Email sent to ${recipient.email}: ${result.data?.id || 'success'}`);

      } catch (error) {
        results.push({ status: 'rejected', reason: error });
        console.log(`❌ Email failed to ${recipient.email}:`, error.message);
      }

      // Rate limiting: Wait 600ms between sends to stay under 2 requests/second
      // (2 req/sec = 500ms minimum, we use 600ms for safety margin)
      if (i < recipients.length - 1) {
        console.log('⏱️ Waiting 600ms before next email to respect rate limits...');
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    // Improved logging to debug email delivery issues
    let actuallySuccessful = 0;
    let actuallyFailed = 0;

    results.forEach((result, index) => {
      const recipient = recipients[index];
      if (!recipient?.email) return; // Skip null recipients

      if (result.status === 'fulfilled') {
        if (result.value && result.value.data) {
          console.log(`✅ Email sent successfully to ${recipient.email}: ${result.value.data.id}`);
          actuallySuccessful++;
        } else {
          console.log(`❌ Email API call succeeded but no data returned for ${recipient.email}:`, result.value);
          actuallyFailed++;
        }
      } else {
        console.log(`❌ Email failed to ${recipient.email}:`, result.reason);
        actuallyFailed++;
      }
    });

    console.log(`Weekly summary sent: ${actuallySuccessful} actually successful, ${actuallyFailed} actually failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: actuallySuccessful,
        failed: actuallyFailed,
        stats,
        highlights 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-summary-final function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
