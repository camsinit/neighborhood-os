import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { WeeklySummaryEmail } from './_templates/weekly-summary.tsx'
import { corsHeaders, handleCorsPreflightRequest, successResponse, errorResponse } from '../_shared/cors.ts'
import { getProfileURL, getEventURL, getSkillURL, getGroupURL } from './_utils/urlGenerator.ts'

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
 * FINAL: Generate AI-powered newsletter content using Claude
 * Based on CURRENT system: Home, Calendar, Skills, Groups only
 * NO goods, NO safety (tables were dropped)
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
      weekInReview: `Calvin and Mac have been the community champions this week, keeping their groups active and our skill-sharing network buzzing. It's been one of those weeks where you can really feel the neighborly energy - people stepping up to help, offering what they know, and keeping our little corner of the world connected.`,
      skillsExchange: `Fresh offers from your neighbors this week, from tech security to yard work to professional services. Plus someone's looking for carpentry help - perfect chance to be the hero of someone's home project.`,
      communityGroups: `Calvin's Group and Mac's Group are both going strong with 2 members each, keeping the community spirit alive with regular updates and welcoming new faces.`,
      weekAhead: `The week ahead is full of possibility! Perfect timing for someone to organize a neighborhood walk, start a group for a shared interest, or offer to help with something they're good at. Sometimes the best connections start with the simplest gestures.`
    };
  }

  try {
    // Calculate total activity count - ONLY current features
    const totalActivities = 
      pastWeekActivities.completedEvents.length + 
      pastWeekActivities.newGroups.length + 
      pastWeekActivities.groupJoins.length + 
      pastWeekActivities.completedSkills.length + 
      upcomingActivities.events.length + 
      upcomingActivities.skills.length;
    
    const isLowActivity = totalActivities <= 3;
    
    // Create activity URLs - ONLY current features
    const createEventUrl = `https://neighborhoodos.com/n/${neighborhoodId}/calendar?create=true`;
    const createSkillUrl = `https://neighborhoodos.com/n/${neighborhoodId}/skills?create=true`;
    const createGroupUrl = `https://neighborhoodos.com/n/${neighborhoodId}/groups?create=true`;
    const groupsUrl = `https://neighborhoodos.com/n/${neighborhoodId}/groups`;
    
    // Weekly Neighborhood Digest prompt - generates bulletin board content
    const prompt = `You are writing the weekly neighborhood digest for "${neighborhoodName}" - a community bulletin that feels like it's written by a friendly neighbor who knows everyone and what's happening.

WRITING STYLE: Write like a friendly neighbor, not a corporate newsletter. Use natural, conversational language. Think "letter from a friend" not "company announcement." Be warm, inclusive, and encouraging.

ACTIVITY LEVEL: ${isLowActivity ? 'LOW - Gently encourage neighbors to start activities with friendly suggestions' : 'NORMAL - Celebrate what happened and build excitement for what\'s coming'}

CURRENT NEIGHBORHOOD FEATURES (these are the ONLY features that exist):
- Home: Activity feed and notifications
- Calendar: Events and gatherings  
- Skills: Skills exchange (offers/requests)
- Groups: Social groups + Physical units (streets/floors/blocks)

NEW NEIGHBORS THIS WEEK:
${newNeighbors.length > 0 ? 
  newNeighbors.map(n => `- ${n.name} (Profile: ${n.profileUrl})`).join('\n') : 
  '- No new neighbors this week'}

WHAT HAPPENED THIS WEEK:
Events Held: ${pastWeekActivities.completedEvents.map(e => `"${e.title}" (${e.url})`).join(', ') || 'None'}
New Groups Created: ${pastWeekActivities.newGroups.map(g => `"${g.name}" (${g.type})`).join(', ') || 'None'}
New Group Members: ${pastWeekActivities.groupJoins.map(j => `${j.memberName} joined "${j.groupName}"`).join(', ') || 'None'}
Skills Completed: ${pastWeekActivities.completedSkills.map(s => `"${s.title}" (${s.url})`).join(', ') || 'None'}

WHAT'S COMING UP:
Upcoming Events: ${upcomingActivities.events.map(e => `"${e.title}" on ${e.date} (${e.url})`).join(', ') || 'None'}
New Skills Available: ${upcomingActivities.skills.map(s => `"${s.title}" - ${s.requestType} (${s.url})`).join(', ') || 'None'}
Active Groups: ${upcomingActivities.activeGroups.map(g => `"${g.name}" (${g.memberCount} members)`).join(', ') || 'None'}

WAYS TO GET INVOLVED (include these links naturally when encouraging participation):
- Create Event: ${createEventUrl}
- Share/Request Skills: ${createSkillUrl}  
- Start a Group: ${createGroupUrl}
- Browse Groups: ${groupsUrl}

ACTIVE NEIGHBORS TO HIGHLIGHT:
${newNeighbors.length > 0 ? 
  newNeighbors.map(n => `- ${n.name} (new neighbor this week)`).join('\n') : ''}
${pastWeekActivities.newGroups.length > 0 ? 
  pastWeekActivities.newGroups.map(g => `- ${g.createdBy} (created "${g.name}" group)`).join('\n') : ''}
${pastWeekActivities.groupJoins.length > 0 ? 
  pastWeekActivities.groupJoins.map(j => `- ${j.memberName} (joined "${j.groupName}")`).join('\n') : ''}

SKILLS DATA FOR BULLETIN:
Skills Offered: ${upcomingActivities.skills.filter(s => s.requestType === 'offer').map(s => `"${s.title}" (${s.category})`).join(', ') || 'None'}
Skills Requested: ${upcomingActivities.skills.filter(s => s.requestType === 'request').map(s => `"${s.title}" (${s.category})`).join(', ') || 'None'}

GROUPS DATA FOR BULLETIN:
Active Groups: ${upcomingActivities.activeGroups.map(g => `"${g.name}" (${g.memberCount} members, ${g.type})`).join(', ') || 'None'}
New Groups: ${pastWeekActivities.newGroups.map(g => `"${g.name}" (${g.type}, created by ${g.createdBy})`).join(', ') || 'None'}

EVENTS DATA FOR BULLETIN:
Recent Events: ${pastWeekActivities.completedEvents.map(e => `"${e.title}" (${e.attendees} attended)`).join(', ') || 'None'}
Upcoming Events: ${upcomingActivities.events.map(e => `"${e.title}" on ${e.date}`).join(', ') || 'None'}

Generate content in this EXACT format structure:

{
  "weekInReview": "Write a 2-3 sentence intro that mentions the most active neighbors by name and describes the community energy. NO bold formatting (**). Example: 'Calvin and Mac have been the community champions this week, keeping their groups active and our skill-sharing network buzzing. It's been one of those weeks where you can really feel the neighborly energy - people stepping up to help, offering what they know, and keeping our little corner of the world connected.'",
  
  "skillsExchange": "Write intro text for skills section. NO bold formatting. Do NOT include individual skill listings - those will be generated separately with proper links and context.",
  
  "communityGroups": "Write intro text for groups section. NO bold formatting. Do NOT include individual group listings - those will be generated separately with proper links and recent updates.",
  
  "weekAhead": "Write a 2-3 sentence forward-looking section about upcoming opportunities and suggestions for neighbors to populate the dashboard next week. Focus on encouraging participation in events, skills sharing, and group activities."
}

WRITING GUIDELINES:
- Mention active neighbors by name naturally
- Add contextual commentary ("perfect timing with...", "classic [neighborhood] energy")
- Use the neighborhood's name in community references
- Keep the bulletin board feel with clear sections
- Make every activity sound appealing and accessible
- Include the personality and energy of the community`;

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
      // Return default digest content if parsing fails
      return {
        weekInReview: `${neighborhoodName} has been buzzing with activity this week! It's been one of those weeks where you can really feel the neighborly energy - people stepping up to help, offering what they know, and keeping our community connected.`,
        skillsExchange: `Fresh offers from your neighbors this week, from tech security to yard work to professional services. Plus someone's looking for carpentry help - perfect chance to be the hero of someone's home project.`,
        communityGroups: `${upcomingActivities.activeGroups.map(g => `${g.name} (${g.memberCount} members)`).join(' and ')} ${upcomingActivities.activeGroups.length > 1 ? 'are' : 'is'} keeping the community spirit alive with regular updates and welcoming new faces.`,
        weekAhead: `The week ahead is full of possibility! Perfect timing for someone to organize a neighborhood walk, start a group for a shared interest, or offer to help with something they're good at. Sometimes the best connections start with the simplest gestures.`
      };
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    // Return default digest content if AI generation fails
    return {
      weekInReview: `${neighborhoodName} has been buzzing with activity this week! It's been one of those weeks where you can really feel the neighborly energy - people stepping up to help, offering what they know, and keeping our community connected.`,
      skillsExchange: `Fresh offers from your neighbors this week, from tech security to yard work to professional services. Plus someone's looking for carpentry help - perfect chance to be the hero of someone's home project.`,
      communityGroups: `${upcomingActivities.activeGroups.map(g => `${g.name} (${g.memberCount} members)`).join(' and ')} ${upcomingActivities.activeGroups.length > 1 ? 'are' : 'is'} keeping the community spirit alive with regular updates and welcoming new faces.`,
      weekAhead: `The week ahead is full of possibility! Perfect timing for someone to organize a neighborhood walk, start a group for a shared interest, or offer to help with something they're good at. Sometimes the best connections start with the simplest gestures.`
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { neighborhoodId, testEmail, previewOnly }: WeeklySummaryRequest = await req.json();
    
    // Better weekly date range (Sunday to Sunday)
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay()); // Last Sunday
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const weekAgoISO = lastWeekStart.toISOString();
    const thisWeekISO = thisWeekStart.toISOString();
    
    console.log(`FINAL newsletter date range: ${weekAgoISO} to ${thisWeekISO}`);
    
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

    // FINAL: Only query tables that actually exist
    const [
      upcomingEventsData, 
      completedEventsData,
      availableSkillsData, 
      completedSkillsData,
      newMembersData,
      newGroupsData,        
      groupJoinsData,       
      activeGroupsData      
    ] = await Promise.all([
      // Upcoming events (next week) 
      supabase
        .from('events')
        .select('id, title, time, group_id, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', now.toISOString())
        .lte('time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_archived', false)
        .order('time')
        .limit(10),

      // Past week's completed events
      supabase
        .from('events')
        .select('id, title, time, group_id, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', weekAgoISO)
        .lte('time', thisWeekISO)
        .order('time', { ascending: false })
        .limit(10),

      // Current available skills (recent posts)
      supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type, created_at')
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
        .limit(20),

      // Groups created this week
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

      // Group joins this week
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

      // Active groups with member counts
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

    // Process new neighbors with better fallbacks
    const newNeighbors = newMembersData.data?.map(member => ({
      name: member.profiles?.display_name || `New Neighbor (${member.user_id.substring(0, 8)})`,
      userId: member.user_id,
      profileUrl: getProfileURL(neighborhoodId, member.user_id),
      joinedAt: member.joined_at
    })) || [];

    console.log(`Found ${newNeighbors.length} new members:`, newNeighbors);

    // Process group activities
    const newGroups = newGroupsData.data?.map(group => ({
      id: group.id,
      name: group.name,
      type: group.group_type,
      unitValue: group.physical_unit_value,
      createdBy: group.profiles?.display_name || 'Someone',
      createdAt: group.created_at,
      url: getGroupURL(neighborhoodId, group.id)
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
      unitValue: group.physical_unit_value,
      url: getGroupURL(neighborhoodId, group.id)
    })) || [];

    console.log(`Found ${newGroups.length} new groups, ${groupJoins.length} group joins, ${activeGroups.length} active groups`);

    // Process past week activities - ONLY current features
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

      // Group activities
      newGroups: newGroups,
      groupJoins: groupJoins
    };

    // Process upcoming activities - ONLY current features
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
        id: skill.id,
        title: skill.title,
        url: getSkillURL(neighborhoodId, skill.id),
        category: skill.skill_category,
        requestType: skill.request_type
      })) || [],

      activeGroups: activeGroups
    };

    // FINAL: Stats for current features only
    const stats = {
      newMembers: newNeighbors.length,
      upcomingEvents: upcomingActivities.events.length,
      activeSkillRequests: upcomingActivities.skills.filter(s => s.requestType === 'request').length,
      availableSkills: upcomingActivities.skills.filter(s => s.requestType === 'offer').length,
      newGroups: newGroups.length,
      groupJoins: groupJoins.length,
      activeGroups: activeGroups.length
    };

    // FINAL: Highlights for current features only
    const highlights = {
      events: upcomingActivities.events.slice(0, 5),
      skills: upcomingActivities.skills.slice(0, 8).map(skill => ({
        id: skill.id,
        title: skill.title,
        category: skill.category,
        requestType: skill.requestType
      })),
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
        neighborhoodId: neighborhoodId,
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
            activeGroups,
            currentFeatures: ['Home', 'Calendar', 'Skills', 'Groups'],
            removedFeatures: ['Safety', 'Goods'],
            tablesDropped: ['safety_updates', 'goods_exchange']
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
          activeGroups: activeGroups.length,
          currentFeatures: ['Home', 'Calendar', 'Skills', 'Groups']
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
    console.error('Error in send-weekly-summary-final:', error);
    return errorResponse(error);
  }
};

serve(handler);
