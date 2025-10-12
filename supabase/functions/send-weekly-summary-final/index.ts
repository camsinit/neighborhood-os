import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { WeeklySummaryEmail } from './_templates/weekly-summary.tsx'
import { corsHeaders, handleCorsPreflightRequest, successResponse, errorResponse } from '../_shared/cors.ts'
import { getProfileURL, getEventURL, getSkillURL, getSkillDetailURL, getGroupURL, getCreateEventURL, getCreateSkillOfferURL, getCreateSkillRequestURL, getCreateGroupURL } from './_utils/urlGenerator.ts'
import { convertToSendingDomainUrl } from './_utils/imageProxy.ts'

// Version marker to track deployments
const VERSION = 'v2.0.0-defensive-params';

// Helper function to shuffle an array for randomization
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Simple fallback suggestions when Claude API is unavailable
function getFallbackSuggestions(neighborhoodId: string): string[] {
  const baseUrl = `https://neighborhoodos.com/n/${neighborhoodId}`;
  return [
    `Browse the <a href="${baseUrl}/skills?utm_source=email&utm_medium=email&utm_campaign=weekly_summary">skills exchange</a> to see who can help with what!`,
    `Check out <a href="${baseUrl}/neighbors?view=groups&utm_source=email&utm_medium=email&utm_campaign=weekly_summary">neighborhood groups</a> to find your community!`,
    `Explore the <a href="${baseUrl}/calendar?utm_source=email&utm_medium=email&utm_campaign=weekly_summary">calendar</a> and join upcoming events!`
  ];
}

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
  debug?: boolean; // Optional: return debug info instead of HTML
}


/**
 * Generate AI-powered newsletter content using Claude
 * This function takes comprehensive neighborhood activity data and creates engaging, personalized content
 * structured in 3 sections: new neighbor welcome, past week recap, and week ahead preview
 */
async function generateAIContent(neighborhoodName: string, stats: any, highlights: any, neighborhoodId: string, newNeighbors: any[], pastWeekActivities: any, upcomingActivities: any, newGroups: any[] = [], allActiveSkills: any[] = []) {
  console.log('🤖 Starting AI content generation...');
  console.log('🔑 CLAUDE_API_KEY exists:', !!CLAUDE_API_KEY);
  console.log('🔑 CLAUDE_API_KEY length:', CLAUDE_API_KEY ? CLAUDE_API_KEY.length : 0);

  // If no Claude API key is available, return default content in new 3-section format
  if (!CLAUDE_API_KEY) {
    console.log('❌ No Claude API key found, using fallback content');

    // Dynamic "This Week" - keep it generic since details show below
    let thisWeekText = "This past week brought new connections and community activity.";

    if (newGroups.length > 0 || upcomingActivities.skills.length > 0) {
      thisWeekText = "This past week brought new connections and community activity. Check out what's happening below!";
    }

    return {
      thisWeek: thisWeekText,
      weekAhead: "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
      getInvolved: getFallbackSuggestions(neighborhoodId)
    };
  }

  console.log('✅ Claude API key found, proceeding with AI generation...');

  // Check if we have enough data for Claude to work with
  if (allActiveSkills.length === 0 && newGroups.length === 0) {
    console.log('⚠️ No skills or groups data available, using fallback suggestions');
    return {
      thisWeek: "This past week brought new connections and community activity.",
      weekAhead: "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
      getInvolved: getFallbackSuggestions(neighborhoodId)
    };
  }

  try {
    // Calculate total activity count to detect low-activity periods
    const totalActivities =
      pastWeekActivities.createdEvents.length +
      pastWeekActivities.completedSkills.length +
      upcomingActivities.events.length +
      upcomingActivities.skills.length;

    const isLowActivity = totalActivities <= 2; // Consider 2 or fewer activities as "low"
    
    // Create activity URLs for easy posting (using the same URL generation pattern)
    const createEventUrl = `https://neighborhoodos.com/n/${neighborhoodId}/calendar?create=true`;
    const createSkillUrl = `https://neighborhoodos.com/n/${neighborhoodId}/skills?create=true`;
    const createGroupUrl = `https://neighborhoodos.com/n/${neighborhoodId}/groups?create=true`;
    const createGoodsUrl = `https://neighborhoodos.com/n/${neighborhoodId}/goods?create=true`;
    const createSafetyUrl = `https://neighborhoodos.com/n/${neighborhoodId}/safety?create=true`;
    
    // Get current date for seasonal context
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const currentSeason = currentMonth === 'December' || currentMonth === 'January' || currentMonth === 'February' ? 'winter' :
                         currentMonth === 'March' || currentMonth === 'April' || currentMonth === 'May' ? 'spring' :
                         currentMonth === 'June' || currentMonth === 'July' || currentMonth === 'August' ? 'summer' : 'fall';

    // Shuffle data for randomization - ensures fresh suggestions each time
    const shuffledSkills = shuffleArray(allActiveSkills);
    const shuffledGroups = shuffleArray(newGroups);

    // Format neighborhood data for AI analysis - use ALL active skills, not just this week
    // Include skill IDs for contextual entity linking
    const skillSpotlightWithIds = shuffledSkills.reduce((acc, skill) => {
      if (!acc[skill.neighborName]) {
        acc[skill.neighborName] = [];
      }
      acc[skill.neighborName].push({
        title: skill.title,
        category: skill.category,
        id: skill.id
      });
      return acc;
    }, {});

    const skillCategories = shuffledSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(`${skill.neighborName}: ${skill.title}`);
      return acc;
    }, {});

    // Format groups data for AI analysis
    const groupsSpotlight = shuffledGroups.map(group => {
      const firstName = group.createdBy.split(' ')[0];
      const typeLabel = group.type === 'physical' ? 'building group' : 'community group';
      return `${group.name} (created by ${firstName}, ${typeLabel})`;
    });

    // Format upcoming events with IDs for contextual entity linking
    const eventSpotlight = upcomingActivities.events.slice(0, 5).map(event => {
      // Format date in a friendly way
      const eventDate = new Date(event.date);
      const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
      const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return {
        title: event.title,
        date: `${dayName} ${timeStr}`,
        id: event.id
      };
    });

    // Identify skill gaps - common categories that are missing
    const availableCategories = Object.keys(skillCategories);
    const commonSkillCategories = ['home_repair', 'automotive', 'gardening', 'childcare', 'cooking', 'crafts'];
    const missingCategories = commonSkillCategories.filter(cat => !availableCategories.includes(cat));

    const prompt = `You are writing content for a neighborhood newsletter in "${neighborhoodName}". Create warm, neighborly text that feels natural and specific - NOT corporate or boring.

ACTUAL NEIGHBORHOOD DATA:

PAST WEEK ACTIVITY (what happened this week):
${pastWeekActivities.createdEvents.length > 0 ? 'New Events Created:\n' + pastWeekActivities.createdEvents.slice(0, 3).map(e => {
  const eventDate = new Date(e.eventTime);
  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
  const timeStr = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles'
  });
  return `- ${e.title} (happening ${dateStr} at ${timeStr}, event ID: ${e.url.split('detail=')[1]?.split('&')[0] || 'unknown'})`;
}).join('\n') : ''}
${newNeighbors.length > 0 ? `\nNew Neighbors: ${newNeighbors.map(n => n.name).join(', ')}` : ''}
${newGroups.length > 0 ? `\nNew Groups: ${newGroups.map(g => `${g.name} (${g.type === 'physical' ? 'building' : 'community'} group by ${g.createdBy.split(' ')[0]})`).join(', ')}` : ''}

UPCOMING EVENTS (happening in next 7 days):
${upcomingActivities.events.length > 0 ? upcomingActivities.events.slice(0, 5).map(e =>
  `- ${e.title} on ${e.date}${e.attendees > 0 ? ` (${e.attendees} ${e.attendees === 1 ? 'neighbor' : 'neighbors'} going)` : ''} (event ID: ${e.id})`
).join('\n') : 'No upcoming events'}

NEIGHBORS AND THEIR SKILLS WITH IDS:
${Object.entries(skillSpotlightWithIds).map(([neighbor, skills]) =>
  `${neighbor}: ${skills.slice(0, 3).map(s => `${s.title} (${s.category}, id: ${s.id})`).join(', ')}${skills.length > 3 ? ` (+ ${skills.length - 3} more)` : ''}`
).join('\n')}

SKILLS BY CATEGORY:
${Object.entries(skillCategories).map(([category, skills]) =>
  `${category}: ${skills.slice(0, 2).join(', ')}${skills.length > 2 ? ` (+ ${skills.length - 2} more)` : ''}`
).join('\n')}

NEIGHBORHOOD GROUPS:
${groupsSpotlight.length > 0 ? groupsSpotlight.join('\n') : 'No groups created yet'}

UPCOMING EVENTS WITH IDS:
${eventSpotlight.length > 0 ? eventSpotlight.map(e => `${e.title} (${e.date}, id: ${e.id})`).join('\n') : 'No upcoming events scheduled'}

SUGGESTION FORMATS - Each must have ONE clear action:

FORMAT 1: Highlight an existing neighbor's skill (neighbor name AND skill will be linked)
✅ "{{Cam}} can help [[troubleshoot computers:skills:abc-123]] - save a trip to the repair shop!"
✅ "{{Sarah}} knows their way around [[gardening:skills:def-456]] and loves sharing tips on keeping plants alive"
✅ "{{Laura}} offers [[meal exchanges:skills:ghi-789]] for those nights when cooking feels like too much"

FORMAT 2: Suggest joining an existing group or event (group name or event will be linked)
✅ "{{Resilience Committee}} meets monthly to discuss emergency preparedness - join if you want to know your neighbors AND be ready for anything"
✅ "Don't miss [[game night:event:xyz-123]] this Friday to connect with neighbors over board games!"

FORMAT 3: Suggest creating something new (verb will be linked to create page)
✅ "Host a tool-sharing workshop so neighbors can fix things together instead of buying new"
✅ "Organize a block party to actually meet the people you wave to every morning"
✅ "Start a meal exchange group for those nights when you made too much pasta (again)"
✅ "Offer your handyman skills - someone on your block probably has a door that squeaks"

TONE GUIDELINES:
- Add relatable details (squeaky doors, too much pasta, waving to neighbors)
- Include the "why" or benefit (no trek to store, instead of buying new)
- Keep it conversational and warm
- NO over-promising! Stick to what the data actually shows
- Be specific, not generic

YOUR TASK:
Generate three pieces of content for the newsletter:

1. THIS WEEK summary (1 sentence about what happened this past week based on PAST WEEK ACTIVITY data)
   - If new events were created, mention them with [[description:event:id]] and include the EXACT date/time from the data (do not reinterpret dates - use them as provided)
   - If new neighbors joined, mention them with {{Name}}
   - If new groups formed, mention them with {{GroupName}}
   - If nothing happened, return null
   - Balance: be warm and welcoming but concise - just enough context to make it friendly

2. WEEK AHEAD summary (1 sentence about upcoming events based on UPCOMING EVENTS data)
   - Mention specific events with [[description:event:id]] and include the EXACT date/time from the data (do not reinterpret dates - copy them precisely)
   - Include how many neighbors are going if 2 or more
   - If no upcoming events, return null
   - Balance: be inviting but concise - just enough context to make it friendly

3. SUGGESTIONS (exactly 3 suggestions for "Ways to Get Involved")
   - Mix formats - use neighbor names, group names, AND create-new-thing verbs
   - Link specific skills or events using [[description:type:id]]
   - 1-2 sentences max per suggestion

CRITICAL FORMATTING FOR ALL SECTIONS:
- Wrap neighbor names in {{Name}} so we can detect them: {{Parker}}, {{Laura}}, etc.
- Wrap group names in {{GroupName}} so we can detect them: {{Piedmont Ave Resilience Committee}}
- Link specific skills or events using [[description:type:id]] syntax:
  * For skills: [[troubleshoot computers:skills:abc-123]]
  * For events: [[game night:event:xyz-456]]
  * The description should be conversational, not just the title
  * Use the actual IDs provided in the data above
- Start create-action suggestions with a verb: "Host", "Organize", "Start", "Offer", "Schedule"
- No em-dashes (—), use regular hyphens only
- Friendly, specific, actionable

Return as JSON object:
{
  "thisWeek": "summary text or null",
  "weekAhead": "summary text or null",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    console.log('📝 Prompt length:', prompt.length);
    console.log('🎯 Skill data being sent:', Object.keys(skillSpotlightWithIds).length, 'neighbors with skills');
    console.log('📊 Categories:', Object.keys(skillCategories));
    console.log('📅 Event data being sent:', eventSpotlight.length, 'upcoming events');

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
        temperature: 1.0, // Full creativity for varied suggestions each time
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

    // Try to parse the JSON response as object with thisWeek, weekAhead, and suggestions
    try {
      const aiResponse = JSON.parse(content);
      console.log('✨ AI content generated successfully:', {
        hasThisWeek: !!aiResponse.thisWeek,
        hasWeekAhead: !!aiResponse.weekAhead,
        suggestionCount: aiResponse.suggestions?.length
      });

      // Helper function to process AI text with {{Name}}, {{GroupName}}, and [[entity:type:id]] markers
      const processAIText = (text: string | null): string | null => {
        if (!text || text === 'null') return null;

        let processed = text;

        // Replace {{NeighborName}} with PURPLE links to neighbor profiles
        processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, name) => {
          const isGroupName = name.includes('Committee') || name.includes('Group') || name.includes('Club') || name.length > 25;

          if (isGroupName) {
            // Group link (PURPLE) - find group ID using URL generator function
            const group = newGroups.find(g => g.name === name);
            const groupUrl = group
              ? getGroupURL(neighborhoodId, group.groupId)
              : `${baseUrl}/neighbors?view=groups&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_suggestion`;
            return `<a href="${groupUrl}" style="color: #7c3aed; text-decoration: none; font-weight: 600;">${name}</a>`;
          } else {
            // Neighbor link (PURPLE) - find user ID by fuzzy matching name using URL generator function
            const neighbor = allActiveSkills.find(s =>
              s.neighborName.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(s.neighborName.split(' ')[0].toLowerCase())
            );

            if (neighbor && neighbor.neighborUserId) {
              return `<a href="${getProfileURL(neighborhoodId, neighbor.neighborUserId)}" style="color: #7c3aed; text-decoration: none; font-weight: 700;">${name}</a>`;
            } else {
              return `<a href="${baseUrl}/neighbors?view=directory&utm_source=email&utm_medium=email&utm_campaign=weekly_summary_suggestion" style="color: #7c3aed; text-decoration: none; font-weight: 700;">${name}</a>`;
            }
          }
        });

        // Process [[entity:type:id]] markers for contextual entity links (skills, events)
        processed = processed.replace(/\[\[([^:]+):([^:]+):([^\]]+)\]\]/g, (match, text, type, id) => {
          let entityUrl = '';
          let color = '';

          if (type === 'skills') {
            entityUrl = getSkillDetailURL(neighborhoodId, id);
            color = '#059669'; // Green for skills
          } else if (type === 'event') {
            entityUrl = getEventURL(neighborhoodId, id);
            color = '#2563eb'; // Blue for events
          }

          if (!entityUrl) {
            console.warn(`Unknown entity type: ${type}`);
            return text; // Return plain text if type is unknown
          }

          return `<a href="${entityUrl}" style="color: ${color}; text-decoration: none; font-weight: 600;">${text}</a>`;
        });

        // Detect and link action verbs at the start of text with context-based colors
        const actionVerbs = ['Host', 'Organize', 'Start', 'Offer', 'Schedule', 'Create', 'Plan', 'Set up', 'Join', 'Launch'];
        for (const verb of actionVerbs) {
          const verbRegex = new RegExp(`^(${verb})\\b`, 'i');
          if (verbRegex.test(processed)) {
            let actionUrl = '';
            let actionColor = '';

            // Check context to determine which page to link to and color to use
            if (processed.match(/workshop|event|party|meeting|gathering/i)) {
              actionUrl = getCreateEventURL(neighborhoodId);
              actionColor = '#2563eb'; // Blue for events
            } else if (processed.match(/group|circle|committee|club/i)) {
              actionUrl = getCreateGroupURL(neighborhoodId);
              actionColor = '#7c3aed'; // Purple for groups
            } else if (processed.match(/skill|help|offer|service/i)) {
              actionUrl = getCreateSkillOfferURL(neighborhoodId);
              actionColor = '#059669'; // Green for skills
            }

            if (actionUrl && actionColor) {
              processed = processed.replace(verbRegex, `<a href="${actionUrl}" style="color: ${actionColor}; text-decoration: none; font-weight: 700;">$1</a>`);
            }
            break;
          }
        }

        return processed;
      };

      // Process all three sections with the same logic
      const processedThisWeek = processAIText(aiResponse.thisWeek);
      const processedWeekAhead = processAIText(aiResponse.weekAhead);
      const processedSuggestions = aiResponse.suggestions.map(processAIText);

      console.log('✅ All sections processed with links:', {
        thisWeek: processedThisWeek ? 'generated' : 'null',
        weekAhead: processedWeekAhead ? 'generated' : 'null',
        suggestions: processedSuggestions.length
      });

      return {
        thisWeek: processedThisWeek,
        weekAhead: processedWeekAhead,
        getInvolved: processedSuggestions
      };
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', content);
      console.error('Parse error details:', parseError.message);

      // Return fallback content
      let thisWeekText = "This past week brought new connections and community activity.";

      if (newGroups.length > 0 || upcomingActivities.skills.length > 0) {
        thisWeekText = "This past week brought new connections and community activity. Check out what's happening below!";
      } else if (newNeighbors.length > 0) {
        thisWeekText = `Welcome to our newest neighbors: ${newNeighbors.map(n => `<a href="${n.profileUrl}">${n.name}</a>`).join(', ')}! This week brought new connections and community activity.`;
      }

      return {
        thisWeek: thisWeekText,
        weekAhead: "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
        getInvolved: getFallbackSuggestions(neighborhoodId),
        parseError: `Failed to parse AI response: ${parseError.message}`,
        rawResponse: content // Include raw response for debugging
      };
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    console.error('Error details:', error.message, error.stack);

    // Return fallback content
    let thisWeekText = "This past week brought new connections and community activity.";

    if (newGroups.length > 0 || upcomingActivities.skills.length > 0) {
      thisWeekText = "This past week brought new connections and community activity. Check out what's happening below!";
    } else if (newNeighbors.length > 0) {
      thisWeekText = `Welcome to our newest neighbors: ${newNeighbors.map(n => `<a href="${n.profileUrl}">${n.name}</a>`).join(', ')}! This week brought new connections and community activity.`;
    }

    return {
      thisWeek: thisWeekText,
      weekAhead: "The calendar is wide open this week! Check out the suggestions below to help fill next week's newsletter with exciting events.",
      getInvolved: getFallbackSuggestions(neighborhoodId),
      error: `AI generation failed: ${error.message}` // Add error info for debugging
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  console.log(`📦 Running newsletter function version: ${VERSION}`);

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { neighborhoodId, testEmail, previewOnly, debug }: WeeklySummaryRequest = await req.json();
    
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
      newMembersData,
      profileUpdatesData, // Profile updates (not currently used)
      allSkillsData // ALL active skills for suggestions (not just this week)
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

      // ALL active skills for suggestions (not time-bound)
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
        .order('created_at', { ascending: false })
        .limit(50), // Get up to 50 active skills for variety

    ]);

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
      events: upcomingEventsData.data?.map(event => {
        const eventDate = new Date(event.time);
        const dateStr = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'America/Los_Angeles'
        });
        const timeStr = eventDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/Los_Angeles'
        });
        return {
          title: event.title,
          url: getEventURL(neighborhoodId, event.id),
          id: event.id,
          date: `${dateStr} at ${timeStr}`,
          attendees: Array.isArray(event.event_rsvps) ? event.event_rsvps.length : 0
        };
      }) || [],
      
      
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

    // ALL active skills for suggestion generation (not time-bound)
    const allActiveSkills = allSkillsData.data?.map(skill => ({
      id: skill.id,
      title: skill.title,
      category: skill.skill_category,
      requestType: skill.request_type,
      neighborName: skill.profiles?.display_name || `Neighbor ${skill.user_id.substring(0, 8)}`,
      neighborUserId: skill.profiles?.id || skill.user_id,
    })) || [];

    console.log('📊 All active skills for suggestions:', allActiveSkills.length);
    console.log('📊 First 3 skills:', allActiveSkills.slice(0, 3).map(s => `${s.neighborName}: ${s.title}`));
    console.log('📊 allSkillsData structure:', {
      hasData: !!allSkillsData.data,
      dataLength: allSkillsData.data?.length || 0,
      hasError: !!allSkillsData.error,
      errorMsg: allSkillsData.error?.message
    });

    // Debug mode - return diagnostic info BEFORE AI generation
    if (debug) {
      return new Response(
        JSON.stringify({
          debug: true,
          allActiveSkillsCount: allActiveSkills.length,
          allActiveSkills: allActiveSkills.slice(0, 10),
          allSkillsDataLength: allSkillsData.data?.length || 0,
          allSkillsDataError: allSkillsData.error,
          hasClaudeApiKey: !!CLAUDE_API_KEY,
          claudeApiKeyLength: CLAUDE_API_KEY?.length || 0,
          message: 'Debug info - skills data check (before AI generation)'
        }, null, 2),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // CURATED HIGHLIGHTS - Focus on community story
    // Note: stats will be calculated after we process all the data

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

    // Filter activities to only this week (since last Sunday)
    const thisWeekActivities = processedActivities.filter(activity => {
      const activityDate = new Date(activity.created_at);
      return activityDate >= weekAgo;
    });

    // Group activities using the same logic as the frontend, but only for this week's activities
    const activityGroups = groupActivities(thisWeekActivities);

    // Focus on skill activity groups
    const skillActivityGroups = activityGroups.filter(group =>
      group.primaryActivity.activity_type === 'skill_offered' ||
      group.primaryActivity.activity_type === 'skill_requested'
    );

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
      }
    });

    // Extract group creation activities from this week
    const groupCreatedActivities = thisWeekActivities.filter(activity =>
      activity.activity_type === 'group_created'
    );

    // Fetch actual group details from groups table for accurate names
    const groupIds = groupCreatedActivities.map(a => a.content_id).filter(Boolean);
    let groupDetailsMap = new Map();

    if (groupIds.length > 0) {
      const { data: groupDetails } = await supabase
        .from('groups')
        .select('id, name, group_type, physical_unit_value, description')
        .in('id', groupIds);

      if (groupDetails) {
        groupDetails.forEach(group => {
          groupDetailsMap.set(group.id, group);
        });
      }
    }

    const newGroupsThisWeek = groupCreatedActivities.map(activity => {
      // Get actual group details from database
      const groupDetails = groupDetailsMap.get(activity.content_id);

      // Extract group name from: 1) database, 2) metadata, 3) title
      let groupName = groupDetails?.name || activity.metadata?.group_name;

      // Fallback: extract from title "Created group \"Group Name\""
      if (!groupName && activity.title) {
        const match = activity.title.match(/Created group "(.+)"/);
        if (match) {
          groupName = match[1];
        }
      }

      return {
        name: groupName || 'Unnamed Group',
        type: groupDetails?.group_type || activity.metadata?.group_type || 'social',
        createdBy: activity.profiles?.display_name || 'A neighbor',
        createdByUserId: activity.actor_id,
        unitValue: groupDetails?.physical_unit_value || activity.metadata?.physical_unit_value,
        description: groupDetails?.description || null,
        groupId: activity.content_id,
        createdAt: activity.created_at
      };
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
        newGroups: newGroupsThisWeek.slice(0, 3), // Max 3 new groups
        recentJoins: [], // TODO: Could extract from group_joined activities
        activeGroups: [], // TODO: Could query most active groups
        groupEvents: [],
        groupUpdates: []
      }
    };

    // Format stats for email template (including groups)
    const stats = {
      newMembers: newNeighbors.length,
      upcomingEvents: upcomingActivities.events.length,
      activeSkillRequests: upcomingActivities.skills.filter(s => s.requestType === 'request').length,
      availableSkills: upcomingActivities.skills.filter(s => s.requestType === 'offer').length,
      newGroups: newGroupsThisWeek.length,
      groupJoins: 0, // TODO: Could extract from group_joined activities
      activeGroups: 0, // TODO: Could query most active groups
    };

    // Format week date range
    const weekStart = new Date(weekAgo);
    const weekEnd = new Date();
    const weekOf = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Generate AI-powered content for the newsletter
    console.log('Generating AI-powered content...');
    console.log('New neighbors:', newNeighbors);
    console.log('New groups:', newGroupsThisWeek);
    console.log('Past week activities:', pastWeekActivities);
    console.log('Upcoming activities:', upcomingActivities);

    const aiContent = await generateAIContent(
      neighborhood.name,
      stats,
      highlights,
      neighborhoodId,
      newNeighbors,
      pastWeekActivities,
      upcomingActivities,
      newGroupsThisWeek,
      allActiveSkills // Pass all skills for suggestions
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
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          ...corsHeaders,
        },
      });
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
