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
  testEmail?: string; // Optional: for testing purposes
  previewOnly?: boolean; // Optional: for preview mode (returns HTML without sending)
}

/**
 * Generate AI-powered newsletter content using Claude
 * This function takes comprehensive neighborhood activity data and creates engaging, personalized content
 * structured in 3 sections: new neighbor welcome, past week recap, and week ahead preview
 */
async function generateAIContent(neighborhoodName: string, stats: any, highlights: any, neighborhoodId: string, newNeighbors: any[], pastWeekActivities: any, upcomingActivities: any) {
  // If no Claude API key is available, return default content in new 3-section format
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
    
    // Create a friendly, letter-like prompt for Claude to generate personal neighborhood content
    const prompt = `You are writing a personal weekly letter to a neighbor in "${neighborhoodName}" - imagine you're a friendly neighbor who knows what's happening in the community and wants to share updates in a warm, conversational way.

WRITING STYLE: Write like a friendly neighbor, not a corporate newsletter. Use natural, conversational language. Think "letter from a friend" not "company announcement." Be warm, inclusive, and encouraging.

ACTIVITY LEVEL: ${isLowActivity ? 'LOW - Gently encourage neighbors to start activities with friendly suggestions' : 'NORMAL - Celebrate what happened and build excitement for what\'s coming'}

NEW NEIGHBORS THIS WEEK:
${newNeighbors.length > 0 ? 
  newNeighbors.map(n => `- ${n.name} (Profile: ${n.profileUrl})`).join('\n') : 
  '- No new neighbors this week'}

WHAT HAPPENED THIS WEEK:
Completed Events: ${pastWeekActivities.completedEvents.map(e => `"${e.title}" (${e.url})`).join(', ') || 'None'}
Items Claimed/Archived: ${pastWeekActivities.archivedGoods.map(g => `"${g.title}" (${g.url})`).join(', ') || 'None'}
Skills Sessions Completed: ${pastWeekActivities.completedSkills.map(s => `"${s.title}" (${s.url})`).join(', ') || 'None'}
New Safety Updates: ${pastWeekActivities.safetyUpdates.map(s => `"${s.title}" (${s.url})`).join(', ') || 'None'}
New Profile Updates: ${pastWeekActivities.profileUpdates || 'None'}

WHAT'S COMING UP:
Upcoming Events: ${upcomingActivities.events.map(e => `"${e.title}" on ${e.date} (${e.url})`).join(', ') || 'None'}
New Skills Available: ${upcomingActivities.skills.map(s => `"${s.title}" - ${s.requestType} (${s.url})`).join(', ') || 'None'}
New Items Shared: ${upcomingActivities.goods.map(g => `"${g.title}" in ${g.category} (${g.url})`).join(', ') || 'None'}

WAYS TO GET INVOLVED (include these links naturally when encouraging participation):
- Create Event: ${createEventUrl}
- Share/Request Skills: ${createSkillUrl}  
- Share/Request Items: ${createGoodsUrl}
- Post Safety Update: ${createSafetyUrl}

Write exactly 3 sections in a personal, letter-like tone:

1. newNeighborWelcome: (ONLY if new neighbors joined) Write a genuine welcome like you're introducing them at a coffee shop. Mention them by name with links to their profiles. If no new neighbors, return empty string.

2. pastWeekRecap: Share what happened this week like you're catching up with a friend. ${isLowActivity ? 'Since things were quiet, gently suggest that this might be a perfect time for someone to organize something simple. Include activity creation links naturally: "It was one of those peaceful weeks in the neighborhood - maybe the perfect time for someone to <a href=\\"' + createEventUrl + '\\">organize a coffee meet-up</a> or <a href=\\"' + createSkillUrl + '\\">share a skill</a> they have?"' : 'Celebrate what actually happened and mention any highlights with enthusiasm.'}

3. weekAheadPreview: Create SPECIFIC, timely suggestions based on current neighbor activity and skills. Connect actual neighbor names to opportunities. Examples: "With Rascal Raccoon's tech skills available, this is perfect timing to <a href=\\"' + createEventUrl + '\\">organize a neighborhood WiFi workshop</a>." or "Mac's carpentry request could spark a <a href=\\"' + createGroupUrl + '\\">DIY home improvement group</a> - who else has projects?" Make suggestions feel connected to real activity, mention specific skills that could be shared, groups that could be created, or events that would complement current neighborhood interests. Change suggestions weekly based on actual data.

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
    
    // Try to parse the JSON response
    try {
      const aiContent = JSON.parse(content);
      console.log('AI content generated successfully');
      return aiContent;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return default content in new 3-section format if parsing fails
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
    // Return default content in new 3-section format if AI generation fails
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
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { neighborhoodId, testEmail, previewOnly }: WeeklySummaryRequest = await req.json();
    
    // Calculate date range for the past week (expanded to 30 days to catch more activity)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 30);
    const weekAgoISO = weekAgo.toISOString();
    
    // Get neighborhood info
    const { data: neighborhood } = await supabase
      .from('neighborhoods')
      .select('name')
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


      // Current available skills (recent posts) with user profiles
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
        .limit(5)
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
        url: getSkillURL(neighborhoodId, skill.id),
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

    // CURATED HIGHLIGHTS - Focus on community story, not data dump
    
    // Group skills by person to avoid one person dominating
    const skillsByPerson = {};
    upcomingActivities.skills.forEach(skill => {
      const personKey = skill.neighborName;
      if (!skillsByPerson[personKey]) {
        skillsByPerson[personKey] = {
          neighborName: skill.neighborName,
          neighborUserId: skill.neighborUserId,
          neighborProfileUrl: skill.neighborProfileUrl,
          skills: []
        };
      }
      skillsByPerson[personKey].skills.push(skill);
    });

    // Create curated highlights - max 3-4 people, prioritize variety
    const curatedSkills = Object.values(skillsByPerson)
      .sort((a, b) => b.skills.length - a.skills.length) // People with more skills first
      .slice(0, 4) // Max 4 people
      .map(person => ({
        neighborName: person.neighborName,
        neighborUserId: person.neighborUserId,
        neighborProfileUrl: person.neighborProfileUrl,
        skillCount: person.skills.length,
        topSkills: person.skills.slice(0, 3), // Show top 3 skills per person
        allSkills: person.skills
      }));

    const highlights = {
      createdEvents: pastWeekActivities.createdEvents.slice(0, 4), // Max 4 events
      upcomingEvents: upcomingActivities.events.slice(0, 3), // Max 3 upcoming events
      skillsByPerson: curatedSkills,
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
        memberName: testEmail ? 'Test User' : 'Neighbor',
        weekOf,
        baseUrl: 'https://neighborhoodos.com', // Use production URL directly
        stats,
        highlights,
        aiContent, // Pass AI-generated content to email template
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
        failed,
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
    console.error("Error in send-weekly-summary function:", error);
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
