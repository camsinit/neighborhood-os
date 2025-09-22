#!/usr/bin/env node

/**
 * Quick User Email Lookup Script
 * 
 * Simple script to quickly find a user's email address and notification status
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nnwzfliblfuldwxpuata.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud3pmbGlibGZ1bGR3eHB1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTYwNTgsImV4cCI6MjA1NDk5MjA1OH0.jEa99YSuIt36oOyaAvIZ5pGCDk9vSa3tBfi43Uqm8OU';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function findUserEmail(userId) {
  console.log(`${colors.cyan}🔍 Looking up user: ${userId}${colors.reset}\n`);
  
  // Get user profile
  try {
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=display_name`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const profileData = await profileResponse.json();
    
    if (!profileData || profileData.length === 0) {
      console.log(`${colors.red}❌ User not found${colors.reset}`);
      return;
    }
    
    const user = profileData[0];
    console.log(`${colors.green}✅ User found: "${user.display_name}"${colors.reset}`);
    
  } catch (error) {
    console.log(`${colors.red}❌ Error fetching profile: ${error.message}${colors.reset}`);
    return;
  }
  
  // Check neighborhood memberships
  try {
    const membershipsResponse = await fetch(`${SUPABASE_URL}/rest/v1/neighborhood_members?user_id=eq.${userId}&select=neighborhood_id,status`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const memberships = await membershipsResponse.json();
    
    if (!memberships || memberships.length === 0) {
      console.log(`${colors.yellow}⚠️  User is not a member of any neighborhood${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}📋 Neighborhood memberships:${colors.reset}`);
    for (const membership of memberships) {
      console.log(`  - ${membership.neighborhood_id} (${membership.status})`);
      
      // Check if user has digest enabled for this neighborhood
      try {
        const digestResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_neighborhood_emails_for_digest`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ target_neighborhood_id: membership.neighborhood_id })
        });
        
        const digestEmails = await digestResponse.json();
        const userInDigest = digestEmails.find(email => email.user_id === userId);
        
        if (userInDigest) {
          console.log(`${colors.green}    ✅ Email: ${userInDigest.email} (digest enabled)${colors.reset}`);
        } else {
          console.log(`${colors.yellow}    ⚠️  Digest notifications disabled${colors.reset}`);
        }
        
      } catch (error) {
        console.log(`${colors.red}    ❌ Error checking digest status: ${error.message}${colors.reset}`);
      }
    }
    
  } catch (error) {
    console.log(`${colors.red}❌ Error checking memberships: ${error.message}${colors.reset}`);
  }
}

// Get user ID from command line
const userId = process.argv[2];

if (!userId) {
  console.log(`${colors.red}❌ Please provide a user UUID${colors.reset}`);
  console.log(`\nUsage: node scripts/find-user-email.js [userId]`);
  console.log(`\nExample: node scripts/find-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf`);
  process.exit(1);
}

findUserEmail(userId);
