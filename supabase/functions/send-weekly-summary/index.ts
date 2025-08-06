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
    // Create a comprehensive prompt for Claude to generate engaging content in 3-section format
    const prompt = `You are writing a weekly neighborhood newsletter for "${neighborhoodName}". 

NEW NEIGHBORS THIS WEEK:
${newNeighbors.length > 0 ? 
  newNeighbors.map(n => `- ${n.name} (Profile: ${n.profileUrl})`).join('\n') : 
  '- No new neighbors this week'}

PAST WEEK RECAP (What happened):
Completed Events: ${pastWeekActivities.completedEvents.map(e => `"${e.title}" (${e.url})`).join(', ') || 'None'}
Items Claimed/Archived: ${pastWeekActivities.archivedGoods.map(g => `"${g.title}" (${g.url})`).join(', ') || 'None'}
Skills Sessions Completed: ${pastWeekActivities.completedSkills.map(s => `"${s.title}" (${s.url})`).join(', ') || 'None'}
New Safety Updates: ${pastWeekActivities.safetyUpdates.map(s => `"${s.title}" (${s.url})`).join(', ') || 'None'}
New Profile Updates: ${pastWeekActivities.profileUpdates || 'None'}

WEEK AHEAD PREVIEW (What's coming up):
Upcoming Events: ${upcomingActivities.events.map(e => `"${e.title}" on ${e.date} (${e.url})`).join(', ') || 'None'}
New Skills Available: ${upcomingActivities.skills.map(s => `"${s.title}" - ${s.requestType} (${s.url})`).join(', ') || 'None'}
New Items Shared: ${upcomingActivities.goods.map(g => `"${g.title}" in ${g.category} (${g.url})`).join(', ') || 'None'}

Please generate exactly 3 sections for the newsletter in HTML format with working hyperlinks:

1. newNeighborWelcome: (ONLY if there are new neighbors) Write a warm welcome message mentioning each new neighbor by name with clickable links to their profiles. If no new neighbors, return empty string.

2. pastWeekRecap: Summarize what actually happened this past week - events that took place, items that were claimed, skills sessions completed, etc. Include the provided URLs as clickable links. Be specific about actual activities that occurred.

3. weekAheadPreview: Look ahead at the upcoming week - events coming up, new skills/items posted, etc. Include the provided URLs as clickable links. Focus on what neighbors can do or participate in.

IMPORTANT: 
- Use the exact URLs provided in parentheses as href attributes
- Make titles and key phrases clickable links using <a href="URL">text</a>
- Keep each section 2-3 sentences maximum
- If a section has no content, write something brief and encouraging
- Return as JSON with these 3 keys: newNeighborWelcome, pastWeekRecap, weekAheadPreview
- Include HTML formatting with proper <a> tags for all URLs provided

Keep the tone warm, community-focused, and engaging.`;

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
    
    // Calculate date range for the past week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
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
      completedEventsData,
      availableGoodsData, 
      archivedGoodsData,
      availableSkillsData, 
      completedSkillsData,
      safetyData, 
      newMembersData,
      profileUpdatesData
    ] = await Promise.all([
      // Upcoming events (next week)
      supabase
        .from('events')
        .select('id, title, time, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', new Date().toISOString())
        .lte('time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_archived', false)
        .order('time')
        .limit(5),

      // Past week's completed events
      supabase
        .from('events')
        .select('id, title, time, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', weekAgoISO)
        .lte('time', new Date().toISOString())
        .order('time', { ascending: false })
        .limit(5),

      // Current available goods (recent offers)
      supabase
        .from('goods_exchange')
        .select('id, title, goods_category, created_at, request_type')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .eq('request_type', 'offer')
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(5),

      // Past week's archived/claimed goods  
      supabase
        .from('goods_exchange')
        .select('id, title, goods_category, archived_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', true)
        .gte('archived_at', weekAgoISO)
        .order('archived_at', { ascending: false })
        .limit(5),

      // Current available skills (recent posts)
      supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type, created_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(5),

      // Completed skills activities (recently archived)
      supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', true)
        .order('created_at', { ascending: false })
        .limit(3),

      // Recent safety updates
      supabase
        .from('safety_updates')
        .select('id, title, type, created_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(3),

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

    // Process new neighbors with profile URLs
    const newNeighbors = newMembersData.data?.map(member => ({
      name: member.profiles?.display_name || 'New Neighbor',
      userId: member.user_id,
      profileUrl: getProfileURL(neighborhoodId, member.user_id)
    })) || [];

    // Process past week activities with URLs
    const pastWeekActivities = {
      completedEvents: completedEventsData.data?.map(event => ({
        title: event.title,
        url: getEventURL(neighborhoodId, event.id),
        attendees: Array.isArray(event.event_rsvps) ? event.event_rsvps.length : 0
      })) || [],
      
      archivedGoods: archivedGoodsData.data?.map(item => ({
        title: item.title,
        url: getGoodsURL(neighborhoodId, item.id),
        category: item.goods_category
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
      
      profileUpdates: profileUpdatesData.data?.length || 0
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
      
      goods: availableGoodsData.data?.map(item => ({
        title: item.title,
        url: getGoodsURL(neighborhoodId, item.id),
        category: item.goods_category
      })) || [],
      
      skills: availableSkillsData.data?.map(skill => ({
        title: skill.title,
        url: getSkillURL(neighborhoodId, skill.id),
        category: skill.skill_category,
        requestType: skill.request_type
      })) || []
    };

    // Format stats for email template (keeping existing structure for compatibility)
    const stats = {
      newMembers: newNeighbors.length,
      upcomingEvents: upcomingActivities.events.length,
      activeSkillRequests: upcomingActivities.skills.filter(s => s.requestType === 'request').length,
      availableItems: upcomingActivities.goods.length,
      safetyUpdates: safetyData.data?.length || 0,
    };

    // Format highlights for email template (keeping existing structure for compatibility)
    const highlights = {
      events: upcomingActivities.events.slice(0, 3),
      items: upcomingActivities.goods.slice(0, 3).map(item => ({
        title: item.title,
        category: item.category,
        daysAgo: 0 // Recent items
      })),
      skills: upcomingActivities.skills.slice(0, 3).map(skill => ({
        title: skill.title,
        category: skill.category,
        requestType: skill.requestType
      })),
      safety: pastWeekActivities.safetyUpdates.slice(0, 2).map(update => ({
        title: update.title,
        type: update.type,
        daysAgo: Math.floor((Date.now() - new Date().getTime()) / (24 * 60 * 60 * 1000))
      }))
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
