# Supabase Edge Functions

This directory contains serverless Edge Functions that run on Supabase's Deno runtime. These functions handle backend logic like sending emails, processing webhooks, and scheduled tasks.

## What are Edge Functions?

**Edge Functions** are serverless functions that run on Supabase's global infrastructure:
- **Language:** TypeScript/JavaScript (Deno runtime)
- **Trigger:** HTTP requests, webhooks, or cron schedules
- **Purpose:** Backend logic, API integrations, scheduled tasks
- **Benefits:** Auto-scaling, low latency, no server management

## Function List

### Email Functions

#### `send-welcome-email/`
**Purpose:** Sends welcome email to newly registered users

**Triggered by:** User signup (called from frontend or database trigger)

**Template:** `_templates/welcome-email.tsx`

**Flow:**
1. User completes signup
2. Function called with user ID and neighborhood ID
3. Fetches user and neighborhood data from database
4. Renders React Email template to HTML
5. Sends via Resend API
6. Logs result to `email_logs` table

#### `send-invitation/`
**Purpose:** Sends neighborhood invitation email

**Triggered by:** User invites someone to neighborhood

**Template:** `_templates/basic-invitation.tsx`

**Flow:**
1. Admin/member invites someone (provides email address)
2. Function creates invitation record in database
3. Renders invitation email with unique link
4. Sends email
5. Logs delivery

**Special:** Invitation link includes unique token for security

#### `send-invitation-accepted/`
**Purpose:** Notifies inviter when invitation is accepted

**Triggered by:** Invitee accepts invitation

**Template:** `_templates/invitation-accepted.tsx`

**Flow:**
1. New member accepts invitation
2. Function notifies original inviter
3. Email says "John accepted your invitation!"

#### `send-onboarding-email/`
**Purpose:** Sends onboarding email series to new members

**Triggered by:** Scheduled after user joins (via `queue-onboarding-series`)

**Templates:**
- `onboarding-1-community.tsx` - Introduction to community features
- `onboarding-2-events.tsx` - How to use events
- `onboarding-3-skills.tsx` - Skills directory guide
- `onboarding-6-directory.tsx` - Neighbor directory
- `onboarding-7-modules.tsx` - Overview of all modules

**Flow:**
1. User joins neighborhood
2. Onboarding series queued (staggered over several days)
3. Each email sent at scheduled time
4. Helps new members discover features gradually

#### `send-weekly-summary-final/`
**Purpose:** Generates and sends weekly digest emails

**Triggered by:** `schedule-weekly-digests` cron job (Sundays at 9 AM local time)

**Template:** `_templates/weekly-summary.tsx`

**Utilities:**
- `_utils/urlGenerator.ts` - Generate neighborhood-aware URLs with UTM tracking
- `_utils/imageProxy.ts` - Proxy external images for email compatibility

**Flow:**
1. Cron job determines which neighborhoods need digests
2. For each neighborhood:
   - Fetch past week's events, skills, members, updates
   - Get all members with digest enabled
   - Render email with personalized content
   - Send to each member
   - Log all deliveries

**Complex:** Handles timezone conversions, content aggregation, and batch sending

### Queue Processing

#### `process-email-queue/`
**Purpose:** Processes pending emails from the `email_queue` table

**Triggered by:** Can be called manually or on a schedule

**Flow:**
1. Query `email_queue` for pending emails
2. For each email:
   - Fetch template
   - Render with data
   - Send via Resend
   - Update queue status
   - Log result

**Why it exists:** Decouples email creation from sending (reliability, rate limiting)

#### `queue-onboarding-series/`
**Purpose:** Schedules onboarding email series for new members

**Triggered by:** User joins neighborhood

**Flow:**
1. User joins
2. Function creates multiple `email_queue` entries
3. Each entry scheduled for future delivery (Day 1, Day 3, Day 7, etc.)
4. `process-email-queue` sends them at scheduled times

### Scheduled Functions (Cron Jobs)

#### `schedule-weekly-digests/`
**Purpose:** Determines which neighborhoods need weekly digests and triggers sending

**Schedule:** Runs every hour (configured in Supabase dashboard)

**Flow:**
1. Get current UTC time
2. For each neighborhood:
   - Get neighborhood timezone
   - Check if it's Sunday 9:00 AM in that timezone
   - If yes, call `send-weekly-summary-final`
3. Mark digest as sent (to avoid duplicates)

**Why hourly?** Neighborhoods have different timezones, so we check every hour to catch the right time for each.

### Webhook Handlers

#### `resend-webhook/`
**Purpose:** Receives delivery status updates from Resend API

**Triggered by:** Resend webhook (email delivered, bounced, opened, clicked)

**Flow:**
1. Resend sends webhook POST request
2. Function validates webhook signature
3. Updates `email_logs` table with delivery status
4. Can trigger follow-up actions (e.g., retry on bounce)

**Events tracked:**
- `delivered` - Email successfully delivered
- `bounced` - Email bounced (invalid address)
- `opened` - Recipient opened email
- `clicked` - Recipient clicked link in email

#### `slack/`
**Purpose:** Slack app integration (if configured)

**Triggered by:** Slack events

**Status:** Optional integration for notifications

### AI & Chat

#### `anthropic-chat/`
**Purpose:** AI chat functionality using Anthropic Claude API

**Triggered by:** User interacts with AI assistant in app

**Flow:**
1. User sends message
2. Function calls Anthropic API
3. Returns AI response
4. Chat history maintained

**Config:** API key in `config.toml`

### Other Functions

#### `join-waitlist/`
**Purpose:** Handles waitlist signups

**Triggered by:** User submits waitlist form on landing page

**Templates:**
- `waitlist-welcome.tsx` - Welcome to waitlist email
- `survey-confirmation.tsx` - Survey completion confirmation

#### `save-waitlist-survey/`
**Purpose:** Saves waitlist survey responses

**Triggered by:** User completes waitlist survey

#### `proxy-images/`
**Purpose:** Proxies external images for email compatibility

**Why?** Some email clients block external images. Proxying through our domain improves deliverability.

**See:** `README.md` in that folder for details

#### `notify-neighbor-changes/`
**Purpose:** Sends notifications about neighbor profile changes

**Triggered by:** Database triggers on profile updates

#### `test-email/`
**Purpose:** Test email rendering and sending (development only)

**Usage:** Call manually to test email templates

## Shared Code

### `_shared/`
Contains code shared across multiple functions:

- `cors.ts` - CORS headers for HTTP responses

**Pattern:** Import shared code like this:
```typescript
import { corsHeaders } from '../_shared/cors.ts';
```

## Function Structure

Standard function structure:

```
function-name/
├── index.ts              # Main function entry point
├── config.toml           # Function configuration (optional)
├── _templates/           # Email templates (if email function)
│   └── template.tsx
└── _utils/              # Function-specific utilities
    └── helper.ts
```

### `index.ts` Entry Point

Every function has an `index.ts` with this pattern:

```typescript
// Setup
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Main handler
serve(async (req) => {
  try {
    // Parse request
    const { userId, neighborhoodId } = await req.json();
    
    // Create Supabase client (with service role key)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Do work
    const result = await doSomething(userId, neighborhoodId);
    
    // Return response
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

### `config.toml`

Optional configuration file:

```toml
[function.send-welcome-email]
# Can trigger on database events
[function.send-welcome-email.events]
enabled_triggers = ['insert']
table = 'neighborhood_members'
```

## Email Template System

Email templates are React components using `@react-email/components`:

```tsx
import { Html, Body, Container, Heading, Text, Button } from '@react-email/components';

export interface WelcomeEmailProps {
  recipientName: string;
  neighborhoodName: string;
  homeUrl: string;
}

export const WelcomeEmail = ({
  recipientName,
  neighborhoodName,
  homeUrl
}: WelcomeEmailProps) => (
  <Html>
    <Body>
      <Container>
        <Heading>Welcome to {neighborhoodName}!</Heading>
        <Text>Hi {recipientName},</Text>
        <Text>We're excited to have you join our community.</Text>
        <Button href={homeUrl}>Get Started</Button>
      </Container>
    </Body>
  </Html>
);
```

**See [docs/unified-email-system.md](../../docs/unified-email-system.md) for template conventions.**

## Environment Variables

Functions access environment variables via `Deno.env.get()`:

```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
```

**Set in:** Supabase dashboard → Settings → Edge Functions → Environment Variables

**Required variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS)
- `SUPABASE_ANON_KEY` - Anonymous key
- `RESEND_API_KEY` - Resend email API key

## Local Development

### Prerequisites
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Docker running (for local Supabase)

### Running Locally

```bash
# Start local Supabase
supabase start

# Serve specific function
supabase functions serve function-name --env-file .env

# Example: Test welcome email function
supabase functions serve send-welcome-email --env-file .env
```

### Testing Locally

```bash
# Call function with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"123","neighborhoodId":"456"}'
```

**Or use the test scripts in `/scripts`:**

```bash
# Test email sending
node scripts/test-email-sending.js

# Preview newsletter
node scripts/preview-newsletter.js
```

See [scripts/README-email-testing.md](../../scripts/README-email-testing.md) for details.

## Deployment

### Deploy Single Function

```bash
supabase functions deploy function-name
```

### Deploy All Functions

```bash
supabase functions deploy
```

### Check Logs

```bash
# In Supabase dashboard:
# Edge Functions → Select function → Logs

# Or via CLI:
supabase functions logs function-name
```

## Debugging Edge Functions

### Console Logging

```typescript
console.log('Debug info:', { userId, neighborhoodId });
console.error('Error occurred:', error);
```

Logs appear in:
- Supabase dashboard (Edge Functions → Logs)
- Terminal when running locally

### Common Issues

**1. Function times out**
- Check for slow database queries
- Ensure external API calls have timeouts
- Consider batch processing for large operations

**2. "Invalid JWT" errors**
- Check that service role key is set correctly
- Verify token in Authorization header

**3. CORS errors**
- Include CORS headers in response
- Use `_shared/cors.ts` helper

**4. Email not sending**
- Check Resend API key is set
- Verify email addresses are valid
- Check `email_logs` table for error messages
- Ensure template renders without errors

## Best Practices

1. **Always validate input** - Don't trust client data
2. **Use service role key carefully** - It bypasses RLS
3. **Log errors** - Use console.error for debugging
4. **Handle timeouts** - Functions have execution time limits
5. **Return proper status codes** - 200 for success, 400 for bad request, 500 for errors
6. **Use transactions** - For multi-step database operations
7. **Rate limit** - Implement rate limiting for public endpoints
8. **Test locally first** - Use `supabase functions serve`

## Rate Limiting

Resend API has rate limits:
- Free tier: 100 emails/day
- Paid tiers: Higher limits

**Handle in code:**
```typescript
// Batch emails with delays
for (const email of emails) {
  await sendEmail(email);
  await delay(100); // 100ms delay between sends
}
```

## Security

- **Service Role Key** - Full database access, use only in Edge Functions
- **Validate webhooks** - Check signatures (e.g., Resend webhook signature)
- **Sanitize input** - Prevent SQL injection, XSS
- **Use HTTPS** - All production requests are HTTPS
- **Environment variables** - Never hardcode secrets

## Monitoring

Track function health via:
- Supabase dashboard metrics
- `email_logs` table for email delivery
- Custom logging to database tables
- External monitoring (optional)

## Related Documentation

- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md#email-system-architecture) - Email system design
- [unified-email-system.md](../../docs/unified-email-system.md) - Email template conventions
- [scripts/README-email-testing.md](../../scripts/README-email-testing.md) - Testing email functions
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions) - Official documentation

