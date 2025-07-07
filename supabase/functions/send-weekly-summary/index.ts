import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { WeeklySummaryEmail } from './_templates/weekly-summary.tsx'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WeeklySummaryRequest {
  neighborhoodId: string;
  testEmail?: string; // Optional: for testing purposes
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { neighborhoodId, testEmail }: WeeklySummaryRequest = await req.json();
    
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

    // Get neighborhood members for email sending
    const { data: members } = await supabase
      .from('neighborhood_members')
      .select(`
        user_id,
        profiles!inner(
          display_name,
          email:id
        )
      `)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active');

    // Get auth users to get actual email addresses
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const memberEmails = members?.map(member => {
      const user = users?.find(u => u.id === member.user_id);
      return {
        email: user?.email,
        name: member.profiles?.display_name || 'Neighbor'
      };
    }).filter(m => m.email) || [];

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

    // Determine recipients (test email or all members)
    const recipients = testEmail ? [{ email: testEmail, name: 'Test User' }] : memberEmails;

    // Send emails
    const emailPromises = recipients.map(async (recipient) => {
      if (!recipient.email) return null;

      const html = await renderAsync(
        React.createElement(WeeklySummaryEmail, {
          neighborhoodName: neighborhood.name,
          memberName: recipient.name,
          weekOf,
          baseUrl: `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}`,
          stats,
          highlights,
        })
      );

      return resend.emails.send({
        from: `${neighborhood.name} <weekly@resend.dev>`,
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