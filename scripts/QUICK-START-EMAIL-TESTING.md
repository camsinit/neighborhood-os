# Quick Start: Email Testing

## 🚀 One-Command Testing

The easiest way to test user emails is with the wrapper script:

```bash
# Quick email lookup
node scripts/email-test.js lookup a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf

# Generate newsletter preview
node scripts/email-test.js preview a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf

# Send test email
node scripts/email-test.js send a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf

# Both preview and send
node scripts/email-test.js both a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf
```

## 📋 What Each Command Does

### `lookup`
- Finds user by UUID
- Shows display name
- Checks neighborhood memberships
- Shows email notification status

### `preview`
- Generates HTML newsletter preview
- Saves to `newsletter-preview-user-[userId]-[timestamp].html`
- No emails sent

### `send`
- Sends actual test newsletter
- Uses user's email if found, otherwise placeholder
- Shows delivery status

### `both`
- Generates preview AND sends test email
- Best for comprehensive testing

## 🔧 Setup

Make sure you have environment variables set:

```bash
export SUPABASE_URL="https://nnwzfliblfuldwxpuata.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Typical Workflow

1. **Find a user to test:**
   ```bash
   node scripts/email-test.js lookup a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf
   ```

2. **Generate preview first:**
   ```bash
   node scripts/email-test.js preview a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf
   ```

3. **Send test email:**
   ```bash
   node scripts/email-test.js send a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf
   ```

## 🎯 What This Replaces

This automated workflow replaces the manual process of:

1. ❌ Manually looking up user profile
2. ❌ Trying multiple methods to find email
3. ❌ Checking notification preferences
4. ❌ Calling newsletter function with test parameters
5. ❌ Managing environment variables in each command

**Now it's just one command! 🎉**

## 📁 Output Files

- **Previews**: `newsletter-preview-user-[userId]-[timestamp].html`
- **Logs**: All output is colorized and informative

## 🔍 Troubleshooting

### User Not Found
- Verify UUID is correct
- Check if user exists in database

### Email Not Found
- User may not have email notifications enabled
- User may not be an active neighborhood member
- Check neighborhood membership status

### Send Failed
- Check Supabase function logs
- Verify `send-weekly-summary-final` function is deployed
- Check network connectivity

## 🚀 Advanced Usage

For more control, use the individual scripts directly:

```bash
# Detailed workflow
node scripts/test-user-email.js [userId] [neighborhoodId] [mode]

# Quick lookup only
node scripts/find-user-email.js [userId]
```

See `README-email-testing.md` for complete documentation.
