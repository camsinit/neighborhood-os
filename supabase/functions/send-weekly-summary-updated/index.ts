import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { WeeklySummaryEmail } from './_templates/weekly-summary.tsx'
import { corsHeaders, handleCorsPreflightRequest, successResponse, errorResponse } from '../_shared/cors.ts'
import { getProfileURL, getEventURL, getGoodsURL, getSkillURL, getSafetyURL } from './_utils/urlGenerator.ts'

// Initialize Claude API client
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WeeklySummaryRequest {
  neighborhoodId: string;
  testEmail?: string;
  previewOnly?: boolean;
}

/**
 * UPDATED: Generate AI-powered newsletter content using Claude
 * Now includes group activities and reflects current system state
 */
async function generateAIContent(
  neighborhoodName: string, 
  stats: any, 
  highlights: any, 
  neighborhoodId: string, 
  newNeighbors: any[], 
  pastWeekActivities: any, 
  upcomingActivities: any
) {
  if (!CLAUDE_API_KEY) {
    console.log('No Claude API key found, using default content');
    return {
      newNeighborWelcome: newNeighbors.length > 0 ? 
        `Welcome to our newest neighbors: ${newNeighbors.map(n => n.name).join(', ')}! We're excited to have you join our ${neighborhoodName} community.` : 
        '',
      pastWeekRecap: "This past week brought new connections and community activity. Thank you to everyone who participated in making our neighborhood more vibrant.",
      weekAheadPreview: "The upcoming week has exciting opportunities to connect with your neighbors. Check out what's happening and get involved!"
    };
  }

  try {
    // Calculate total activity count including NEW group activities
    const totalActivities = 
      pastWeekActivities.completedEvents.length + 
      pastWeekActivities.newGroups.length + // NEW: Group creation
      pastWeekActivities.groupJoins.length + // NEW: Group joins
      pastWeekActivities.completedSkills.length + 
      pastWeekActivities.safetyUpdates.length +
      upcomingActivities.events.length + 
      upcomingActivities.skills.length;
    
    const isLowActivity = totalActivities <= 3; // Adjusted for new activity types
    
    // Create activity URLs for easy posting
    const createEventUrl = `https://neighborhoodos.com/n/${neighborhoodId}/calendar?create=true`;
    const createSkillUrl = `https://neighborhoodos.com/n/${neighborhoodId}/skills?create=true`;
    const createGroupUrl = `https://neighborhoodos.com/n/${neighborhoodId}/groups?create=true`; // NEW
    const createSafetyUrl = `https://neighborhoodos.com/n/${neighborhoodId}/safety?create=true`;
    
    // UPDATED prompt to include group activities
    const prompt = `You are writing a personal weekly letter to a neighbor in "${neighborhoodName}" - imagine you're a friendly neighbor who knows what's happening in the community and wants to share updates in a warm, conversational way.

WRITING STYLE: Write like a friendly neighbor, not a corporate newsletter. Use natural, conversational language. Think "letter from a friend" not "company announcement." Be warm, inclusive, and encouraging.

ACTIVITY LEVEL: ${isLowActivity ? 'LOW - Gently encourage neighbors to start activities with friendly suggestions' : 'NORMAL - Celebrate what happened and build excitement for what\'s coming'}

NEW NEIGHBORS THIS WEEK:
${newNeighbors.length > 0 ? 
  newNeighbors.map(n => `- ${n.name} (Profile: ${n.profileUrl})`).join('\n') : 
  '- No new neighbors this week'}

WHAT HAPPENED THIS WEEK:
Completed Events: ${pastWeekActivities.completedEvents.map(e => `"${e.title}" (${e.url})`).join(', ') || 'None'}
New Groups Created: ${pastWeekActivities.newGroups.map(g => `"${g.name}" (${g.type})`).join(', ') || 'None'}
New Group Members: ${pastWeekActivities.groupJoins.map(j => `${j.memberName} joined "${j.groupName}"`).join(', ') || 'None'}
Skills Sessions Completed: ${pastWeekActivities.completedSkills.map(s => `"${s.title}" (${s.url})`).join(', ') || 'None'}
New Safety Updates: ${pastWeekActivities.safetyUpdates.map(s => `"${s.title}" (${s.url})`).join(', ') || 'None'}

WHAT'S COMING UP:
Upcoming Events: ${upcomingActivities.events.map(e => `"${e.title}" on ${e.date} (${e.url})`).join(', ') || 'None'}
New Skills Available: ${upcomingActivities.skills.map(s => `"${s.title}" - ${s.requestType} (${s.url})`).join(', ') || 'None'}
Active Groups: ${upcomingActivities.activeGroups.map(g => `"${g.name}" (${g.memberCount} members)`).join(', ') || 'None'}

WAYS TO GET INVOLVED (include these links naturally when encouraging participation):
- Create Event: ${createEventUrl}
- Share/Request Skills: ${createSkillUrl}  
- Start a Group: ${createGroupUrl}
- Post Safety Update: ${createSafetyUrl}

Write exactly 3 sections in a personal, letter-like tone:

1. newNeighborWelcome: (ONLY if new neighbors joined) Write a genuine welcome like you're introducing them at a coffee shop. Mention them by name with links to their profiles. If no new neighbors, return empty string.

2. pastWeekRecap: Share what happened this week like you're catching up with a friend. ${isLowActivity ? 'Since things were quiet, gently suggest that this might be a perfect time for someone to organize something simple. Include activity creation links naturally: "It was one of those peaceful weeks in the neighborhood - maybe the perfect time for someone to <a href=\\"' + createEventUrl + '\\">organize a coffee meet-up</a>, <a href=\\"' + createGroupUrl + '\\">start a group</a>, or <a href=\\"' + createSkillUrl + '\\">share a skill</a> they have?"' : 'Celebrate what actually happened and mention any highlights with enthusiasm, especially new groups and community connections.'}

3. weekAheadPreview: Look ahead with optimism about what neighbors could do together. ${isLowActivity ? 'Since the calendar is open, paint a picture of possibilities: "The week ahead is full of possibility! Perfect timing for someone to <a href=\\"' + createEventUrl + '\\">organize a neighborhood walk</a>, <a href=\\"' + createGroupUrl + '\\">start a group for a shared interest</a>, or <a href=\\"' + createSkillUrl + '\\">offer to help with something they\'re good at</a>. Sometimes the best connections start with the simplest gestures."' : 'Build excitement about what people can join and participate in, highlighting both events and group activities.'}

WRITING GUIDELINES:
- Write like you're talking to a neighbor over the fence
- Use "we," "our," and "us" to create community feeling  
- Keep each section 2-3 sentences, flowing naturally
- Include clickable links naturally in the conversation
- Avoid corporate language, emojis, or formal headers
- Make it feel personal and authentic
- Return as JSON: {"newNeighborWelcome": "", "pastWeekRecap": "", "weekAheadPreview": ""}`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    try {
      const aiContent = JSON.parse(content);
      console.log('AI content generated successfully');
      return aiContent;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return default content if parsing fails
      return {
        newNeighborWelcome: newNeighbors.length > 0 ? 
          `Welcome to our newest neighbors: ${newNeighbors.map(n => `<a href="${n.profileUrl}">${n.name}</a>`).join(', ')}! We're excited to have you join our ${neighborhoodName} community.` : 
          '',
        pastWeekRecap: "This past week brought new connections and community activity. Thank you to everyone who participated in making our neighborhood more vibrant.",
        weekAheadPreview: "The upcoming week has exciting opportunities to connect with your neighbors. Check out what's happening and get involved!"
      };
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    // Return default content if AI generation fails
    return {
      newNeighborWelcome: newNeighbors.length > 0 ? 
        `Welcome to our newest neighbors: ${newNeighbors.map(n => `<a href="${n.profileUrl}">${n.name}</a>`).join(', ')}! We're excited to have you join our ${neighborhoodName} community.` : 
        '',
      pastWeekRecap: "This past week brought new connections and community activity. Thank you to everyone who participated in making our neighborhood more vibrant.",
      weekAheadPreview: "The upcoming week has exciting opportunities to connect with your neighbors. Check out what's happening and get involved!"
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { neighborhoodId, testEmail, previewOnly }: WeeklySummaryRequest = await req.json();
    
    // IMPROVED: Better weekly date range (Sunday to Sunday)
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay()); // Last Sunday
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const weekAgoISO = lastWeekStart.toISOString();
    const thisWeekISO = thisWeekStart.toISOString();
    
    console.log(`Weekly newsletter date range: ${weekAgoISO} to ${thisWeekISO}`);
    
    // Get neighborhood info
    const { data: neighborhood } = await supabase
      .from('neighborhoods')
      .select('name')
      .eq('id', neighborhoodId)
      .single();
    
    if (!neighborhood) {
      throw new Error('Neighborhood not found');
    }

    // Get member emails with preferences
    const { data: memberEmails, error: emailsError } = await supabase
      .rpc('get_neighborhood_emails_for_digest', { 
        target_neighborhood_id: neighborhoodId 
      });

    if (emailsError) {
      console.error('Error fetching member emails:', emailsError);
      throw new Error(`Failed to get member emails: ${emailsError.message}`);
    }

    const formattedEmails = memberEmails?.map(member => ({
      email: member.email,
      name: member.display_name || 'Neighbor'
    })) || [];

    // UPDATED: Comprehensive weekly activity data with GROUPS
    const [
      upcomingEventsData, 
      completedEventsData,
      availableSkillsData, 
      completedSkillsData,
      safetyData, 
      newMembersData,
      newGroupsData,        // NEW: Groups created this week
      groupJoinsData,       // NEW: Group joins this week
      activeGroupsData      // NEW: Active groups with recent activity
    ] = await Promise.all([
      // Upcoming events (next week) - INCREASED LIMIT
      supabase
        .from('events')
        .select('id, title, time, group_id, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', now.toISOString())
        .lte('time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_archived', false)
        .order('time')
        .limit(10), // Increased from 5

      // Past week's completed events - INCREASED LIMIT
      supabase
        .from('events')
        .select('id, title, time, group_id, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', weekAgoISO)
        .lte('time', thisWeekISO)
        .order('time', { ascending: false })
        .limit(10), // Increased from 5

      // Current available skills (recent posts) - INCREASED LIMIT
      supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type, created_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(15), // Increased from 5 to show more activity

      // Completed skills activities (recently archived)
      supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', true)
        .gte('archived_at', weekAgoISO)
        .order('archived_at', { ascending: false })
        .limit(5),

      // Recent safety updates - INCREASED LIMIT
      supabase
        .from('safety_updates')
        .select('id, title, type, created_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(8), // Increased from 3

      // FIXED: New members this week - ROBUST QUERY
      supabase
        .from('neighborhood_members')
        .select(`
          user_id,
          joined_at,
          status,
          profiles(display_name, created_at)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .eq('status', 'active')
        .gte('joined_at', weekAgoISO)
        .lte('joined_at', thisWeekISO)
        .order('joined_at', { ascending: false })
        .limit(20), // Show more new members

      // NEW: Groups created this week
      supabase
        .from('groups')
        .select(`
          id,
          name,
          group_type,
          physical_unit_value,
          description,
          created_at,
          created_by,
          profiles!groups_created_by_fkey(display_name)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .eq('status', 'active')
        .gte('created_at', weekAgoISO)
        .lte('created_at', thisWeekISO)
        .order('created_at', { ascending: false })
        .limit(10),

      // NEW: Group joins this week
      supabase
        .from('group_members')
        .select(`
          joined_at,
          role,
          profiles!group_members_user_id_fkey(display_name),
          groups!inner(
            id,
            name,
            neighborhood_id,
            group_type
          )
        `)
        .eq('groups.neighborhood_id', neighborhoodId)
        .gte('joined_at', weekAgoISO)
        .lte('joined_at', thisWeekISO)
        .neq('role', 'owner') // Don't count initial owner joins
        .order('joined_at', { ascending: false })
        .limit(15),

      // NEW: Active groups with member counts
      supabase
        .from('groups')
        .select(`
          id,
          name,
          group_type,
          physical_unit_value,
          description,
          is_private,
          created_at,
          group_members(count)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Enhanced error logging
    if (newMembersData.error) {
      console.error('Failed to fetch new members:', newMembersData.error);
    }
    if (newGroupsData.error) {
      console.error('Failed to fetch new groups:', newGroupsData.error);
    }
    if (groupJoinsData.error) {
      console.error('Failed to fetch group joins:', groupJoinsData.error);
    }

    // FIXED: Process new neighbors with better fallbacks
    const newNeighbors = newMembersData.data?.map(member => ({
      name: member.profiles?.display_name || `New Neighbor (${member.user_id.substring(0, 8)})`,
      userId: member.user_id,
      profileUrl: getProfileURL(neighborhoodId, member.user_id),
      joinedAt: member.joined_at
    })) || [];

    console.log(`Found ${newNeighbors.length} new members:`, newNeighbors);

    // NEW: Process group activities
    const newGroups = newGroupsData.data?.map(group => ({
      id: group.id,
      name: group.name,
      type: group.group_type,
      unitValue: group.physical_unit_value,
      createdBy: group.profiles?.display_name || 'Someone',
      createdAt: group.created_at
    })) || [];

    const groupJoins = groupJoinsData.data?.map(join => ({
      memberName: join.profiles?.display_name || 'Someone',
      groupName: join.groups?.name || 'a group',
      groupType: join.groups?.group_type,
      joinedAt: join.joined_at
    })) || [];

    const activeGroups = activeGroupsData.data?.map(group => ({
      id: group.id,
      name: group.name,
      type: group.group_type,
      memberCount: group.group_members?.[0]?.count || 0,
      unitValue: group.physical_unit_value
    })) || [];

    console.log(`Found ${newGroups.length} new groups, ${groupJoins.length} group joins, ${activeGroups.length} active groups`);

    // Process past week activities with URLs - UPDATED
    const pastWeekActivities = {
      completedEvents: completedEventsData.data?.map(event => ({
        title: event.title,
        url: getEventURL(neighborhoodId, event.id),
        attendees: Array.isArray(event.event_rsvps) ? event.event_rsvps.length : 0,
        isGroupEvent: !!event.group_id
      })) || [],
      
      completedSkills: completedSkillsData.data?.map(skill => ({
        title: skill.title,
        url: getSkillURL(neighborhoodId, skill.id),
        category: skill.skill_category
      })) || [],
      
      safetyUpdates: safetyData.data?.map(update => ({
        title: update.title,
        url: getSafetyURL(neighborhoodId, update.id),
        type: update.type
      })) || [],

      // NEW: Group activities
      newGroups: newGroups,
      groupJoins: groupJoins
    };

    // Process upcoming activities with URLs - UPDATED
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
        attendees: Array.isArray(event.event_rsvps) ? event.event_rsvps.length : 0,
        isGroupEvent: !!event.group_id
      })) || [],
      
      skills: availableSkillsData.data?.map(skill => ({
        title: skill.title,
        url: getSkillURL(neighborhoodId, skill.id),
        category: skill.skill_category,
        requestType: skill.request_type
      })) || [],

      // NEW: Active groups
      activeGroups: activeGroups
    };

    // UPDATED: Enhanced stats including groups
    const stats = {
      newMembers: newNeighbors.length,
      upcomingEvents: upcomingActivities.events.length,
      activeSkillRequests: upcomingActivities.skills.filter(s => s.requestType === 'request').length,
      availableSkills: upcomingActivities.skills.filter(s => s.requestType === 'offer').length,
      safetyUpdates: safetyData.data?.length || 0,
      newGroups: newGroups.length,           // NEW
      groupJoins: groupJoins.length,         // NEW
      activeGroups: activeGroups.length      // NEW
    };

    // UPDATED: Enhanced highlights including groups
    const highlights = {
      events: upcomingActivities.events.slice(0, 5),
      skills: upcomingActivities.skills.slice(0, 8).map(skill => ({
        title: skill.title,
        category: skill.category,
        requestType: skill.requestType
      })),
      safety: pastWeekActivities.safetyUpdates.slice(0, 3).map(update => ({
        title: update.title,
        type: update.type,
        daysAgo: Math.floor((Date.now() - new Date(weekAgoISO).getTime()) / (24 * 60 * 60 * 1000))
      })),
      // NEW: Group highlights
      groups: {
        newGroups: newGroups.slice(0, 5),
        recentJoins: groupJoins.slice(0, 5),
        activeGroups: activeGroups.slice(0, 5)
      }
    };

    // Format week date range
    const weekStart = new Date(lastWeekStart);
    const weekEnd = new Date(thisWeekStart);
    const weekOf = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Generate AI-powered content for the newsletter
    console.log('Generating AI-powered content...');
    console.log('New neighbors:', newNeighbors);
    console.log('Past week activities:', pastWeekActivities);
    console.log('Upcoming activities:', upcomingActivities);
    console.log('Stats:', stats);
    
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
        memberName: testEmail ? 'Test User' : 'Neighbor',
        weekOf,
        baseUrl: 'https://neighborhoodos.com',
        stats,
        highlights,
        aiContent,
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
          preview: true,
          debug: {
            dateRange: { weekAgoISO, thisWeekISO },
            newNeighbors,
            newGroups,
            groupJoins,
            activeGroups
          }
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

    // Send emails
    const emailPromises = recipients.map(async (recipient) => {
      if (!recipient.email) return null;

      return resend.emails.send({
        from: `NeighborhoodOS <weekly@updates.neighborhoodos.com>`,
        to: [recipient.email],
        subject: `Your ${neighborhood.name} weekly summary`,
        html,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Weekly summary sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        recipients: recipients.length,
        stats,
        debug: {
          dateRange: { weekAgoISO, thisWeekISO },
          newNeighbors: newNeighbors.length,
          newGroups: newGroups.length,
          groupJoins: groupJoins.length,
          activeGroups: activeGroups.length
        }
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
    console.error('Error in send-weekly-summary:', error);
    return errorResponse(error);
  }
};

serve(handler);
