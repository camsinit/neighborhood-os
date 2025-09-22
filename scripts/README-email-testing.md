# Email Testing Scripts

This directory contains scripts to help automate the workflow for testing individual user emails and newsletters.

## Scripts Overview

### 1. `test-user-email.js` - Complete Email Testing Workflow

This script automates the entire process of testing individual user emails:

**Features:**
- ✅ Look up user by UUID to get display name
- ✅ Find user's email address (multiple methods)
- ✅ Check if user has email notifications enabled
- ✅ Send test newsletter to user
- ✅ Generate newsletter preview
- ✅ Comprehensive feedback and error handling

**Usage:**
```bash
# Basic usage - send test email
node scripts/test-user-email.js [userId] [neighborhoodId] [mode]

# Examples:
node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf
node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9
node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9 preview
node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9 both
```

**Parameters:**
- `userId` (required): UUID of the user to test
- `neighborhoodId` (optional): Neighborhood ID to use for testing (defaults to test neighborhood)
- `mode` (optional): 
  - `send` (default): Send actual test email
  - `preview`: Generate HTML preview only
  - `both`: Generate preview AND send test email

### 2. `find-user-email.js` - Quick Email Lookup

Simple script to quickly find a user's email address and notification status.

**Features:**
- ✅ Look up user profile by UUID
- ✅ Check neighborhood memberships
- ✅ Check email notification status for each neighborhood
- ✅ Show digest subscription status

**Usage:**
```bash
node scripts/find-user-email.js [userId]

# Example:
node scripts/find-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf
```

## Environment Setup

Make sure you have the following environment variables set:

```bash
export SUPABASE_URL="https://nnwzfliblfuldwxpuata.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Or create a `.env` file in the project root:
```bash
SUPABASE_URL=https://nnwzfliblfuldwxpuata.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Workflow Examples

### Example 1: Quick Email Lookup
```bash
# Find out if a user has email notifications enabled
node scripts/find-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf
```

### Example 2: Generate Newsletter Preview
```bash
# Generate HTML preview without sending email
node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9 preview
```

### Example 3: Send Test Email
```bash
# Send actual test email to user
node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9 send
```

### Example 4: Full Testing (Preview + Send)
```bash
# Generate preview AND send test email
node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9 both
```

## Output Files

### Newsletter Previews
When generating previews, HTML files are saved to the project root with names like:
- `newsletter-preview-user-[userId]-[timestamp].html`

Open these files in your browser to see exactly what the newsletter will look like.

## Troubleshooting

### User Not Found
- Verify the user UUID is correct
- Check if the user exists in the database

### Email Not Found
This could mean:
- User has email notifications disabled
- User is not an active member of any neighborhood
- Email address is not accessible with current permissions

### Newsletter Send Failed
- Check Supabase function logs
- Verify the `send-weekly-summary-final` function is deployed
- Check network connectivity

## Related Scripts

- `test-final-newsletter.js` - Test newsletter generation with specific neighborhood data
- `preview-newsletter.js` - Generate newsletter previews
- `debug-newsletter-data.js` - Debug newsletter data issues

## Integration with Newsletter System

These scripts work with the `send-weekly-summary-final` function and the automated cron job system:

- **Cron Job**: Runs every hour to check for neighborhoods ready for Sunday 9:00 AM digest
- **Function**: `send-weekly-summary-final` generates and sends newsletters
- **Testing**: These scripts allow you to test the same system manually

The scripts respect the same email preferences and subscriber settings as the automated system.
