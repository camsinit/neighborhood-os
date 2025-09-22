#!/usr/bin/env node

/**
 * Direct Newsletter Test Script
 * 
 * This script sends a test newsletter directly to a specific email address
 * using the send-weekly-summary-final function with the testEmail parameter
 */

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

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function sendTestNewsletter(neighborhoodId, testEmail) {
  log(`\n${colors.cyan}📧 Sending test newsletter to: ${testEmail}${colors.reset}`);
  logInfo(`Using neighborhood: ${neighborhoodId}`);
  
  try {
    const payload = {
      neighborhoodId: neighborhoodId,
      testEmail: testEmail,
      previewOnly: false // Actually send the email
    };
    
    logInfo('Calling send-weekly-summary-final function...');
    
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
      throw new Error(result.error || result.message || `HTTP ${response.status}`);
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

async function main() {
  const args = process.argv.slice(2);
  const neighborhoodId = args[0] || '1d0871ba-a651-4c22-9fe6-7dfb915b5cc9';
  const testEmail = args[1] || 'cam@neighborhoodOS.com';
  
  log(`${colors.bright}${colors.magenta}🚀 Direct Newsletter Test${colors.reset}`);
  log(`${colors.cyan}Neighborhood ID: ${neighborhoodId}${colors.reset}`);
  log(`${colors.cyan}Test Email: ${testEmail}${colors.reset}`);
  
  try {
    await sendTestNewsletter(neighborhoodId, testEmail);
    
    log(`\n${colors.bright}${colors.green}✅ Test completed successfully!${colors.reset}`);
    log(`Newsletter sent to: ${testEmail}`);
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
