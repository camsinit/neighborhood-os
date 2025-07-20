import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { BasicInvitationEmail } from './_templates/basic-invitation.tsx'

// Initialize clients
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

interface InvitationRequest {
  recipientEmail: string
  inviterName: string
  neighborhoodName: string
  inviteUrl: string
}

/**
 * Send invitation email to a new neighbor
 * This function renders the basic invitation template and sends it via Resend
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
      } 
    })
  }

  try {
    // Parse the request body to get invitation details
    const requestData = await req.json()
    const { recipientEmail, inviterName, neighborhoodName, inviteUrl }: InvitationRequest = requestData

    // Validate required fields
    if (!recipientEmail || !inviterName || !neighborhoodName || !inviteUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: recipientEmail, inviterName, neighborhoodName, inviteUrl" 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Sending invitation from ${inviterName} to ${recipientEmail} for ${neighborhoodName}`)

    // Render the email template
    const emailHtml = await renderAsync(
      React.createElement(BasicInvitationEmail, {
        inviterName,
        neighborhoodName,
        inviteUrl
      })
    )

    // Send the email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'neighborhoodOS <hello@neighborhoodos.com>',
        to: [recipientEmail],
        subject: `${inviterName} invited you to join ${neighborhoodName}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      console.error('Resend API error:', errorData)
      throw new Error(`Resend API error: ${errorData.message || 'Unknown error'}`)
    }

    const emailData = await emailResponse.json()
    console.log(`Invitation email sent successfully to: ${recipientEmail}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        emailId: emailData.data?.id 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error sending invitation email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to send invitation email',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})