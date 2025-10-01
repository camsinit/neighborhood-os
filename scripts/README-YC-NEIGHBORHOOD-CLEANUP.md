# YC Neighborhood Cleanup Script

This script completely removes all data related to the YC Neighborhood from your database. It's designed to be safe and thorough, handling all related tables and foreign key constraints properly.

## ⚠️ IMPORTANT WARNINGS

- **This script is DESTRUCTIVE and CANNOT be undone!**
- **Always test in a development environment first**
- **Make sure you have a database backup before running**
- **The script will delete ALL data associated with the YC Neighborhood**

## What Gets Deleted

The script removes data from these tables in the correct order:

### Core Neighborhood Data
- `neighborhoods` - The neighborhood record itself
- `neighborhood_members` - All member relationships
- `neighborhood_roles` - All role assignments

### User Data
- `profiles` - User profiles of neighborhood members
- `invitations` - All pending/accepted invitations

### Content Data
- `events` - All events in the neighborhood
- `event_rsvps` - All event RSVPs
- `groups` - All groups in the neighborhood
- `group_members` - All group memberships
- `group_updates` - All group updates and posts
- `group_update_comments` - All comments on group updates
- `group_update_reactions` - All reactions to group updates

### Exchange Data
- `skills_exchange` - All skills offers/requests
- `skill_contributors` - All skill contributor records
- `goods_exchange` - All goods sharing/requests
- `support_requests` - All support/care requests
- `safety_updates` - All safety updates
- `safety_update_comments` - All safety update comments

### System Data
- `activities` - All activity logs
- `notifications` - All notifications
- `shared_items` - All shared content
- `email_queue` - All pending emails

## Prerequisites

1. **Node.js and npm** installed
2. **Environment variables** set up in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Database access** - Make sure you can connect to your Supabase database

## Usage

### 1. Test Run (Recommended First Step)

Always start with a dry run to see what would be deleted:

```bash
node scripts/cleanup-yc-neighborhood.js --dry-run
```

This will:
- Show you all neighborhoods matching "YC Neighborhood"
- Display counts of records that would be deleted
- **Not actually delete anything**

### 2. Actual Cleanup

Once you're satisfied with the dry run results:

```bash
node scripts/cleanup-yc-neighborhood.js
```

The script will:
- Ask for confirmation before proceeding
- Show you exactly what will be deleted
- Require you to type "DELETE YC NEIGHBORHOOD" to confirm
- Perform the cleanup in the correct order

### 3. Force Mode (Skip Confirmation)

If you're running this in an automated environment:

```bash
node scripts/cleanup-yc-neighborhood.js --force
```

⚠️ **Use with extreme caution** - this skips all confirmation prompts!

## Command Line Options

- `--dry-run` - Test mode, shows what would be deleted without actually deleting
- `--force` - Skip confirmation prompts (dangerous!)

## Example Output

```
🏘️  YC Neighborhood Cleanup Script
==================================
🔍 Performing safety checks...
🎯 Found 1 neighborhood(s) matching "YC Neighborhood":
   - YC Neighborhood (ID: abc123-def456-ghi789, Created: 2024-01-15T10:30:00Z)

📊 Gathering data counts for neighborhood abc123-def456-ghi789...

📋 Data Summary:
================
   neighborhood_members: 25 records
   events: 12 records
   groups: 3 records
   skills_exchange: 8 records
   activities: 156 records
   notifications: 89 records

🎯 Total records to be deleted: 293

⚠️  WARNING: This operation will permanently delete all data for the YC Neighborhood!
This includes:
   - All user profiles and memberships
   - All events, groups, and activities
   - All skills, goods, and support requests
   - All notifications and email queue items
   - The neighborhood itself

This action CANNOT be undone!

Type "DELETE YC NEIGHBORHOOD" to confirm:
> DELETE YC NEIGHBORHOOD

🧹 Starting cleanup for neighborhood abc123-def456-ghi789...
   Found 25 users associated with this neighborhood

🗑️  Processing activities...
   ✅ Deleted from activities

🗑️  Processing notifications...
   ✅ Deleted from notifications

[... continues for all tables ...]

📊 Cleanup Summary:
   ✅ Successful operations: 15
   ❌ Failed operations: 0

🎉 Successfully cleaned up "YC Neighborhood"!
```

## Safety Features

1. **Dry Run Mode** - Test what would be deleted without actually deleting
2. **Confirmation Prompts** - Multiple confirmation steps before deletion
3. **Data Counts** - Shows exactly how many records will be affected
4. **Error Handling** - Continues processing even if some operations fail
5. **Foreign Key Order** - Deletes in the correct order to avoid constraint violations

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file exists and contains the required variables
- Check that the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### "No neighborhoods found matching"
- The script looks for neighborhoods with names containing "YC Neighborhood"
- Check if the neighborhood name is exactly as expected
- You can modify the `YC_NEIGHBORHOOD_NAME` constant in the script if needed

### "Error connecting to database"
- Verify your Supabase URL and key are correct
- Check your internet connection
- Ensure your Supabase project is active

### Foreign Key Constraint Errors
- The script is designed to handle this automatically
- If you still get errors, there might be additional relationships not accounted for
- Check the error message and consider manual cleanup for those specific records

## Customization

You can modify the script for different neighborhoods by changing:

```javascript
const YC_NEIGHBORHOOD_NAME = 'YC Neighborhood'; // Change this line
```

Or for more specific matching, you could modify the search query in the `safetyCheck()` function.

## Recovery

**There is no built-in recovery mechanism.** If you need to recover data:

1. Restore from your database backup
2. Contact your database administrator
3. Check if you have any data exports or logs

## Best Practices

1. **Always backup first** - Create a full database backup before running
2. **Test in development** - Run on a copy of your production data first
3. **Use dry-run mode** - Always start with `--dry-run` to verify what will be deleted
4. **Document the process** - Keep records of what was cleaned up and when
5. **Monitor the results** - Check the cleanup summary for any errors

## Support

If you encounter issues:

1. Check the error messages carefully
2. Verify your environment setup
3. Test with dry-run mode first
4. Check the database logs for additional details

Remember: **When in doubt, don't run the script!** It's always better to be cautious with destructive operations.





