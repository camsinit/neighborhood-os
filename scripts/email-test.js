#!/usr/bin/env node

/**
 * Email Test Wrapper Script
 * 
 * Simple wrapper that provides easy access to email testing functionality
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function showHelp() {
  log(`${colors.bright}${colors.magenta}📧 Email Testing Helper${colors.reset}`);
  log(`${colors.cyan}Quick access to email testing tools${colors.reset}\n`);
  
  log(`${colors.bright}Usage:${colors.reset}`);
  log(`  node scripts/email-test.js [command] [options]\n`);
  
  log(`${colors.bright}Commands:${colors.reset}`);
  log(`${colors.green}  lookup <userId>${colors.reset}     - Find user email and notification status`);
  log(`${colors.green}  preview <userId> [neighborhoodId]${colors.reset} - Generate newsletter preview`);
  log(`${colors.green}  send <userId> [neighborhoodId]${colors.reset}     - Send test newsletter`);
  log(`${colors.green}  both <userId> [neighborhoodId]${colors.reset}     - Preview + send`);
  log(`${colors.green}  help${colors.reset}                - Show this help message\n`);
  
  log(`${colors.bright}Examples:${colors.reset}`);
  log(`${colors.yellow}  # Quick email lookup${colors.reset}`);
  log(`  node scripts/email-test.js lookup a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf\n`);
  
  log(`${colors.yellow}  # Generate preview${colors.reset}`);
  log(`  node scripts/email-test.js preview a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf\n`);
  
  log(`${colors.yellow}  # Send test email${colors.reset}`);
  log(`  node scripts/email-test.js send a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf\n`);
  
  log(`${colors.yellow}  # Both preview and send${colors.reset}`);
  log(`  node scripts/email-test.js both a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf\n`);
  
  log(`${colors.bright}Notes:${colors.reset}`);
  log(`- UserId is required for all commands except help`);
  log(`- NeighborhoodId defaults to test neighborhood if not provided`);
  log(`- Make sure SUPABASE_URL and SUPABASE_ANON_KEY environment variables are set`);
}

function runCommand(command, args) {
  try {
    const scriptPath = path.join(__dirname, command === 'lookup' ? 'find-user-email.js' : 'test-user-email.js');
    let fullCommand = `node "${scriptPath}"`;
    
    if (command !== 'lookup') {
      // For test-user-email.js, we need to map the command to the mode parameter
      const mode = command === 'both' ? 'both' : command;
      fullCommand += ` ${args.join(' ')} ${mode}`;
    } else {
      fullCommand += ` ${args.join(' ')}`;
    }
    
    log(`${colors.blue}Running: ${fullCommand}${colors.reset}\n`);
    execSync(fullCommand, { stdio: 'inherit' });
    
  } catch (error) {
    if (error.status === 1) {
      // Script exited with error, but we already showed the output
      process.exit(1);
    } else {
      log(`${colors.red}Error running command: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help') {
  showHelp();
  process.exit(0);
}

const validCommands = ['lookup', 'preview', 'send', 'both'];

if (!validCommands.includes(command)) {
  log(`${colors.red}❌ Invalid command: ${command}${colors.reset}`);
  log(`${colors.yellow}Valid commands: ${validCommands.join(', ')}${colors.reset}`);
  log(`${colors.cyan}Use 'help' to see usage information${colors.reset}`);
  process.exit(1);
}

const userId = args[1];

if (!userId) {
  log(`${colors.red}❌ User ID is required${colors.reset}`);
  log(`${colors.cyan}Usage: node scripts/email-test.js ${command} <userId> [neighborhoodId]${colors.reset}`);
  process.exit(1);
}

const neighborhoodId = args[2]; // Optional

// Run the appropriate command
runCommand(command, [userId, neighborhoodId].filter(Boolean));
