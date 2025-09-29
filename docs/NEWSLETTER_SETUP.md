# Newsletter System Setup Guide

## 📧 Weekly Newsletter Overview

The NeighborhoodOS weekly newsletter system sends automated digest emails every **Sunday at 9 AM** in each neighborhood's local timezone.

## ⚙️ Components

### 1. **Database Function**
- `get_neighborhoods_ready_for_digest()` - Identifies neighborhoods ready for their 9 AM Sunday digest
- Checks timezone settings and last send timestamp
- Prevents duplicate sends within 6 days

### 2. **Edge Functions**
- `schedule-weekly-digests` - Orchestrates the scheduling process
- `send-weekly-summary-final` - Generates and sends the actual newsletter

### 3. **Automated Trigger** (GitHub Actions)
- Runs every hour on Sundays
- Catches the 9 AM window for different timezones
- Located at `.github/workflows/weekly-newsletter.yml`

## 🔧 Setup Instructions

### Step 1: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to GitHub repo → Settings → Secrets → Actions
2. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL (e.g., `https://nnwzfliblfuldwxpuata.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (found in Supabase dashboard)

### Step 2: Set Neighborhood Timezones

Each neighborhood needs a timezone setting for the scheduler to work:

```sql
-- Update neighborhood timezone (example)
UPDATE neighborhoods
SET timezone = 'America/Los_Angeles'
WHERE id = 'your-neighborhood-id';
```

Common timezone values:
- `America/Los_Angeles` (Pacific)
- `America/Denver` (Mountain)
- `America/Chicago` (Central)
- `America/New_York` (Eastern)

### Step 3: Enable the GitHub Action

The workflow is already configured and will:
- Run automatically every hour on Sundays
- Can be manually triggered from the Actions tab

## 🚀 Manual Newsletter Sending

### Send Newsletter Now
```bash
# Send to specific neighborhood
node scripts/send-newsletter-now.js [neighborhood-id] send

# Preview without sending
node scripts/send-newsletter-now.js [neighborhood-id] preview
```

### Test Newsletter System
```bash
# Test with preview
node scripts/test-final-newsletter.js [neighborhood-id]
```

## 🔍 Troubleshooting

### Newsletter Not Sending?

1. **Check Timezone**
   - Ensure neighborhood has a valid timezone set
   - Verify it's Sunday 9 AM in that timezone

2. **Check Last Send Time**
   - Newsletter won't send if already sent in past 6 days
   - Check `last_weekly_digest_sent` in neighborhoods table

3. **Check GitHub Actions**
   - Go to Actions tab in GitHub
   - Check if workflow is running on schedule
   - Look for any error messages

4. **Check Supabase Logs**
   ```bash
   npx supabase functions logs schedule-weekly-digests
   npx supabase functions logs send-weekly-summary-final
   ```

### Manual Trigger from GitHub

1. Go to Actions tab
2. Select "Weekly Newsletter Scheduler"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## 📊 Monitoring

### Check Newsletter Status
```bash
# Check which neighborhoods are ready
node scripts/check-neighborhood-timezone.js [neighborhood-id]
```

### View Recent Sends
Check the `email_queue` table in Supabase for recent newsletter sends.

## 🛡️ Security Notes

- The newsletter system respects user email preferences
- Only active neighborhood members receive newsletters
- The `email_queue` table is secured (service role only)
- Newsletter includes unsubscribe links

## 📅 Schedule

- **When**: Every Sunday at 9:00 AM local time
- **Frequency**: Weekly
- **Content**:
  - New neighborhood members
  - Upcoming events
  - Available skills/requests
  - Group activities

## 🎯 Key Points

1. **Timezone Required**: Neighborhoods without timezone settings won't receive newsletters
2. **GitHub Actions**: Must be enabled and secrets configured
3. **User Preferences**: Respects individual email notification settings
4. **No Duplicates**: System prevents sending multiple newsletters in same week

## 📝 Testing Checklist

- [ ] GitHub secrets configured
- [ ] Neighborhood timezone set
- [ ] GitHub Action enabled
- [ ] Test manual trigger works
- [ ] Verify emails are received

For additional help, check the scripts in `/scripts/` directory or the edge function logs in Supabase dashboard.