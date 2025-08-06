import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { WeeklySummaryEmail } from './_templates/weekly-summary.tsx'
import { corsHeaders, handleCorsPreflightRequest, successResponse, errorResponse } from '../_shared/cors.ts'

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
 * This function takes neighborhood activity data and creates engaging, personalized content
 */
async function generateAIContent(neighborhoodName: string, stats: any, highlights: any) {
  // If no Claude API key is available, return default content
  if (!CLAUDE_API_KEY) {
    console.log('No Claude API key found, using default content');
    return {
      welcomeMessage: `Hello from ${neighborhoodName}!`,
      weeklyInsight: "This week has been full of neighborhood activity and connection.",
      communitySpotlight: "Our community continues to grow and support each other.",
      callToAction: "Stay engaged and keep building those neighbor connections!"
    };
  }

  try {
    // Create a comprehensive prompt for Claude to generate engaging content
    const prompt = `You are writing a weekly neighborhood newsletter for "${neighborhoodName}". 

Weekly Statistics:
- New neighbors: ${stats.newMembers}
- Upcoming events: ${stats.upcomingEvents}
- Active skill requests: ${stats.activeSkillRequests}
- Available items: ${stats.availableItems}
- Safety updates: ${stats.safetyUpdates}

Recent Highlights:
- Events: ${highlights.events.map(e => `"${e.title}" on ${e.date}`).join(', ') || 'None'}
- Available items: ${highlights.items.map(i => `"${i.title}" in ${i.category}`).join(', ') || 'None'}
- Skills: ${highlights.skills.map(s => `"${s.title}" (${s.requestType})`).join(', ') || 'None'}
- Safety: ${highlights.safety.map(s => `"${s.title}" (${s.type})`).join(', ') || 'None'}

Please generate 4 short, engaging sections for the newsletter:
1. welcomeMessage: A warm, personalized greeting (2-3 sentences)
2. weeklyInsight: A thoughtful observation about the week's activity (2-3 sentences)
3. communitySpotlight: Highlight something positive about community engagement (2-3 sentences)
4. callToAction: An encouraging message to stay involved (1-2 sentences)

Keep the tone friendly, community-focused, and encouraging. Make it feel personal and relevant to neighborhood life.

Return as JSON with these 4 keys.`;

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
      // Return default content if parsing fails
      return {
        welcomeMessage: `Hello from ${neighborhoodName}!`,
        weeklyInsight: "This week has been full of neighborhood activity and connection.",
        communitySpotlight: "Our community continues to grow and support each other.",
        callToAction: "Stay engaged and keep building those neighbor connections!"
      };
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    // Return default content if AI generation fails
    return {
      welcomeMessage: `Hello from ${neighborhoodName}!`,
      weeklyInsight: "This week has been full of neighborhood activity and connection.",
      communitySpotlight: "Our community continues to grow and support each other.",
      callToAction: "Stay engaged and keep building those neighbor connections!"
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

    // Gather weekly statistics
    const [eventsData, goodsData, skillsData, safetyData, newMembersData] = await Promise.all([
      // Upcoming events (next week)
      supabase
        .from('events')
        .select('title, time, event_rsvps(count)')
        .eq('neighborhood_id', neighborhoodId)
        .gte('time', new Date().toISOString())
        .lte('time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_archived', false)
        .order('time'),

      // Recent goods
      supabase
        .from('goods_exchange')
        .select('title, category, created_at, request_type')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent skills
      supabase
        .from('skills_exchange')
        .select('title, skill_category, request_type, created_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent safety updates
      supabase
        .from('safety_updates')
        .select('title, type, created_at')
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_archived', false)
        .gte('created_at', weekAgoISO)
        .order('created_at', { ascending: false })
        .limit(3),

      // New members this week
      supabase
        .from('neighborhood_members')
        .select('user_id')
        .eq('neighborhood_id', neighborhoodId)
        .gte('joined_at', weekAgoISO)
    ]);

    // Format data for email template
    const stats = {
      newMembers: newMembersData.data?.length || 0,
      upcomingEvents: eventsData.data?.length || 0,
      activeSkillRequests: skillsData.data?.filter(s => s.request_type === 'request')?.length || 0,
      availableItems: goodsData.data?.filter(g => g.request_type === 'offer')?.length || 0,
      safetyUpdates: safetyData.data?.length || 0,
    };

    const highlights = {
      events: eventsData.data?.slice(0, 3).map(event => ({
        title: event.title,
        date: new Date(event.time).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }),
        attendees: Array.isArray(event.event_rsvps) ? event.event_rsvps.length : 0
      })) || [],
      
      items: goodsData.data?.filter(g => g.request_type === 'offer').slice(0, 3).map(item => ({
        title: item.title,
        category: item.category,
        daysAgo: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (24 * 60 * 60 * 1000))
      })) || [],
      
      skills: skillsData.data?.slice(0, 3).map(skill => ({
        title: skill.title,
        category: skill.skill_category,
        requestType: skill.request_type
      })) || [],
      
      safety: safetyData.data?.slice(0, 2).map(update => ({
        title: update.title,
        type: update.type,
        daysAgo: Math.floor((Date.now() - new Date(update.created_at).getTime()) / (24 * 60 * 60 * 1000))
      })) || []
    };

    // Format week date range
    const weekStart = new Date(weekAgo);
    const weekEnd = new Date();
    const weekOf = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Generate AI-powered content for the newsletter
    console.log('Generating AI-powered content...');
    const aiContent = await generateAIContent(neighborhood.name, stats, highlights);
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
