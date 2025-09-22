#!/usr/bin/env node

/**
 * User Email Testing Script
 * 
 * This script automates the workflow for testing individual user emails:
 * 1. Look up user by UUID to get display name
 * 2. Find user's email address (if accessible)
 * 3. Check if user has email notifications enabled
 * 4. Send test newsletter to user
 * 5. Provide comprehensive feedback
 */

import { writeFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nnwzfliblfuldwxpuata.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud3pmbGlibGZ1bGR3eHB1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTYwNTgsImV4cCI6MjA1NDk5MjA1OH0.jEa99YSuIt36oOyaAvIZ5pGCDk9vSa3tBfi43Uqm8OU';

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}📋 Step ${step}: ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function fetchUserProfile(userId) {
  logStep(1, `Looking up user profile for UUID: ${userId}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=display_name`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('User not found');
    }
    
    const user = data[0];
    logSuccess(`Found user: "${user.display_name}"`);
    return { display_name: user.display_name };
    
  } catch (error) {
    logError(`Failed to fetch user profile: ${error.message}`);
    throw error;
  }
}

async function findUserEmail(userId) {
  logStep(2, 'Attempting to find user email address');
  
  // Try multiple methods to find the email
  
  // Method 1: Try auth.users table (might not be accessible with anon key)
  try {
    logInfo('Trying auth.users table...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/auth/users?id=eq.${userId}&select=email`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data && data.length > 0 && data[0].email) {
      logSuccess(`Found email via auth.users: ${data[0].email}`);
      return data[0].email;
    }
  } catch (error) {
    logWarning(`auth.users table not accessible: ${error.message}`);
  }
  
  // Method 2: Check if user is in any neighborhood and has digest enabled
  logInfo('Checking neighborhood email subscriptions...');
  try {
    // First, find which neighborhoods the user belongs to
    const neighborhoodsResponse = await fetch(`${SUPABASE_URL}/rest/v1/neighborhood_members?user_id=eq.${userId}&select=neighborhood_id`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const neighborhoods = await neighborhoodsResponse.json();
    
    if (neighborhoods && neighborhoods.length > 0) {
      for (const membership of neighborhoods) {
        logInfo(`Checking neighborhood ${membership.neighborhood_id}...`);
        
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
          logSuccess(`Found user in digest list: ${userInDigest.email}`);
          return userInDigest.email;
        }
      }
    }
    
    logWarning('User not found in any neighborhood digest lists (email notifications may be disabled)');
    return null;
    
  } catch (error) {
    logWarning(`Failed to check neighborhood subscriptions: ${error.message}`);
  }
  
  return null;
}

async function sendTestNewsletter(userId, userEmail, neighborhoodId) {
  logStep(3, 'Sending test newsletter');
  
  if (!userEmail) {
    logWarning('No email address found, using placeholder email for testing');
    userEmail = 'test@example.com';
  }
  
  logInfo(`Sending newsletter to: ${userEmail}`);
  logInfo(`Using neighborhood: ${neighborhoodId}`);
  
  try {
    const payload = {
      neighborhoodId: neighborhoodId,
      testEmail: userEmail,
      previewOnly: false // Actually send the email
    };
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-weekly-summary-final`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    logSuccess(`Newsletter sent successfully!`);
    logInfo(`Sent: ${result.sent || 0} emails`);
    logInfo(`Failed: ${result.failed || 0} emails`);
    
    if (result.stats) {
      logInfo(`Stats: ${JSON.stringify(result.stats, null, 2)}`);
    }
    
    return result;
    
  } catch (error) {
    logError(`Failed to send newsletter: ${error.message}`);
    throw error;
  }
}

async function generatePreview(userId, neighborhoodId) {
  logStep(4, 'Generating newsletter preview');
  
  try {
    const payload = {
      neighborhoodId: neighborhoodId,
      previewOnly: true // Generate preview only
    };
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-weekly-summary-final`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    if (result.html) {
      const previewPath = `./newsletter-preview-user-${userId}-${Date.now()}.html`;
      writeFileSync(previewPath, result.html);
      logSuccess(`Preview saved to: ${previewPath}`);
      logInfo('Open this file in your browser to see the newsletter preview');
    }
    
    return result;
    
  } catch (error) {
    logError(`Failed to generate preview: ${error.message}`);
    throw error;
  }
}

async function testUserEmail() {
  const args = process.argv.slice(2);
  const userId = args[0];
  const neighborhoodId = args[1];
  const mode = args[2] || 'send'; // 'send' or 'preview' or 'both'
  
  if (!userId) {
    logError('Please provide a user UUID');
    log('\nUsage: node scripts/test-user-email.js [userId] [neighborhoodId] [mode]');
    log('  userId: UUID of the user to test');
    log('  neighborhoodId: (optional) Neighborhood ID to use for testing');
    log('  mode: (optional) "send", "preview", or "both" (default: "send")');
    log('\nExamples:');
    log('  node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf');
    log('  node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9 preview');
    log('  node scripts/test-user-email.js a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf 1d0871ba-a651-4c22-9fe6-7dfb915b5cc9 both');
    process.exit(1);
  }
  
  // Default neighborhood ID if not provided
  const defaultNeighborhoodId = neighborhoodId || '1d0871ba-a651-4c22-9fe6-7dfb915b5cc9';
  
  log(`${colors.bright}${colors.magenta}🚀 User Email Testing Workflow${colors.reset}`);
  log(`${colors.cyan}User UUID: ${userId}${colors.reset}`);
  log(`${colors.cyan}Neighborhood ID: ${defaultNeighborhoodId}${colors.reset}`);
  log(`${colors.cyan}Mode: ${mode}${colors.reset}`);
  
  try {
    // Step 1: Get user profile
    const userProfile = await fetchUserProfile(userId);
    
    // Step 2: Find user email
    const userEmail = await findUserEmail(userId);
    
    // Step 3: Generate preview if requested
    if (mode === 'preview' || mode === 'both') {
      await generatePreview(userId, defaultNeighborhoodId);
    }
    
    // Step 4: Send test email if requested
    if (mode === 'send' || mode === 'both') {
      await sendTestNewsletter(userId, userEmail, defaultNeighborhoodId);
    }
    
    // Summary
    log(`\n${colors.bright}${colors.green}✅ Workflow completed successfully!${colors.reset}`);
    log(`User: ${userProfile.display_name}`);
    log(`Email: ${userEmail || 'Not found (used placeholder)'}`);
    log(`Mode: ${mode}`);
    
    if (!userEmail) {
      logWarning('User email not found. This could mean:');
      log('  - User has email notifications disabled');
      log('  - User is not an active member of any neighborhood');
      log('  - Email address is not accessible with current permissions');
    }
    
  } catch (error) {
    logError(`Workflow failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
testUserEmail();
