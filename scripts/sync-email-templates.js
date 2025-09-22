
#!/usr/bin/env node

/**
 * Email Template Sync Script for neighborhoodOS
 * 
 * This script maintains synchronization between the source email templates
 * in `/emails/` and the production templates in `supabase/functions/*//_templates/`.
 * 
 * The `/emails/` directory serves as the single source of truth for all templates.
 * This script transforms the imports to be Deno-compatible and copies them to
 * the appropriate edge function directories.
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output to make it easier to read
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

/**
 * Configuration mapping source templates to their destination functions
 * This tells the script which templates go to which edge functions
 */
const TEMPLATE_MAPPINGS = {
  'basic-invitation.tsx': ['send-invitation'],
  'welcome-email.tsx': ['send-welcome-email'],
  'invitation-accepted.tsx': ['send-invitation-accepted'],
  'waitlist-welcome.tsx': ['send-waitlist-welcome'],
  'weekly-summary.tsx': ['send-weekly-summary', 'send-weekly-summary-final'],
  // Onboarding series templates (7 emails)
  'onboarding-community.tsx': ['send-onboarding-email'],
  'onboarding-events.tsx': ['send-onboarding-email'],
  'onboarding-skills.tsx': ['send-onboarding-email'],
  'onboarding-care.tsx': ['send-onboarding-email'],
  'onboarding-goods.tsx': ['send-onboarding-email'],
  'onboarding-directory.tsx': ['send-onboarding-email'],
  'onboarding-conclusion.tsx': ['send-onboarding-email']
};

/**
 * Transform imports from standard React/Node.js format to Deno-compatible format
 * This is the key transformation that makes templates work in Supabase Edge Functions
 */
function transformImportsForDeno(content) {
  // Transform React Email components import
  content = content.replace(
    /import\s+{([^}]+)}\s+from\s+['"]@react-email\/components['"]/g,
    "import {\n$1\n} from 'npm:@react-email/components@0.0.22'"
  );
  
  // Transform React import
  content = content.replace(
    /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/g,
    "import * as React from 'npm:react@18.3.1'"
  );
  
  // Transform default React import
  content = content.replace(
    /import\s+React\s+from\s+['"]react['"]/g,
    "import * as React from 'npm:react@18.3.1'"
  );
  
  return content;
}

/**
 * Ensure a directory exists, creating it if necessary
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${colors.blue}Created directory: ${dirPath}${colors.reset}`);
  }
}

/**
 * Copy and transform a single template file
 */
function syncTemplate(templateName, sourcePath, destinationPath) {
  try {
    // Read the source template
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // Transform imports for Deno compatibility
    const transformedContent = transformImportsForDeno(content);
    
    // Ensure destination directory exists
    ensureDirectoryExists(path.dirname(destinationPath));
    
    // Write the transformed template
    fs.writeFileSync(destinationPath, transformedContent, 'utf8');
    
    console.log(`  ${colors.green}✓${colors.reset} ${templateName} → ${destinationPath}`);
    return true;
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} Failed to sync ${templateName}: ${error.message}`);
    return false;
  }
}

/**
 * Validate that all required source templates exist
 */
function validateSourceTemplates() {
  const sourceDir = path.join(__dirname, '..', 'emails');
  const missingTemplates = [];
  
  console.log(`${colors.bright}Validating source templates...${colors.reset}`);
  
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`${colors.red}Error: Source directory '/emails' does not exist!${colors.reset}`);
    return false;
  }
  
  // Check each template mapping
  for (const templateName of Object.keys(TEMPLATE_MAPPINGS)) {
    const sourcePath = path.join(sourceDir, templateName);
    if (!fs.existsSync(sourcePath)) {
      missingTemplates.push(templateName);
    }
  }
  
  if (missingTemplates.length > 0) {
    console.error(`${colors.red}Missing source templates:${colors.reset}`);
    missingTemplates.forEach(template => {
      console.error(`  ${colors.red}✗${colors.reset} ${template}`);
    });
    return false;
  }
  
  console.log(`${colors.green}All source templates found!${colors.reset}`);
  return true;
}

/**
 * Main sync function that processes all template mappings
 */
function syncAllTemplates() {
  console.log(`${colors.bright}🔄 Starting email template synchronization...${colors.reset}\n`);
  
  // Validate source templates first
  if (!validateSourceTemplates()) {
    process.exit(1);
  }
  
  const sourceDir = path.join(__dirname, '..', 'emails');
  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  
  let successCount = 0;
  let totalOperations = 0;
  
  // Process each template mapping
  for (const [templateName, targetFunctions] of Object.entries(TEMPLATE_MAPPINGS)) {
    console.log(`${colors.bright}Syncing ${templateName}:${colors.reset}`);
    
    const sourcePath = path.join(sourceDir, templateName);
    
    // Copy to each target function
    for (const functionName of targetFunctions) {
      const destinationPath = path.join(functionsDir, functionName, '_templates', templateName);
      
      if (syncTemplate(templateName, sourcePath, destinationPath)) {
        successCount++;
      }
      totalOperations++;
    }
    
    console.log(''); // Add spacing between templates
  }
  
  // Summary
  console.log(`${colors.bright}📊 Synchronization Summary:${colors.reset}`);
  console.log(`  Total operations: ${totalOperations}`);
  console.log(`  Successful: ${colors.green}${successCount}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${totalOperations - successCount}${colors.reset}`);
  
  if (successCount === totalOperations) {
    console.log(`${colors.green}${colors.bright}✅ All templates synchronized successfully!${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}${colors.bright}❌ Some templates failed to sync. Please check the errors above.${colors.reset}`);
    return false;
  }
}

/**
 * Watch mode for development - monitors changes and auto-syncs
 */
function watchMode() {
  console.log(`${colors.bright}👀 Starting watch mode for email templates...${colors.reset}`);
  console.log(`${colors.yellow}Watching /emails directory for changes...${colors.reset}\n`);
  
  const sourceDir = path.join(__dirname, '..', 'emails');
  
  // Initial sync
  syncAllTemplates();
  
  // Watch for changes
  fs.watch(sourceDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.tsx')) {
      console.log(`${colors.yellow}📝 Change detected: ${filename}${colors.reset}`);
      
      // Small delay to ensure file write is complete
      setTimeout(() => {
        syncAllTemplates();
      }, 100);
    }
  });
  
  console.log(`${colors.blue}Press Ctrl+C to stop watching...${colors.reset}`);
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--watch') || args.includes('-w')) {
    watchMode();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}Email Template Sync Script${colors.reset}

${colors.bright}Usage:${colors.reset}
  node scripts/sync-email-templates.js          Sync templates once
  node scripts/sync-email-templates.js --watch  Watch for changes and auto-sync
  node scripts/sync-email-templates.js --help   Show this help

${colors.bright}Description:${colors.reset}
  Synchronizes email templates from /emails/ (source of truth) to the
  appropriate _templates directories in Supabase Edge Functions.
  
  Templates are transformed to use Deno-compatible imports automatically.
    `);
  } else {
    // Default: run sync once
    const success = syncAllTemplates();
    process.exit(success ? 0 : 1);
  }
}

// Handle graceful shutdown in watch mode
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}👋 Template sync stopped. Have a great day!${colors.reset}`);
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { syncAllTemplates, transformImportsForDeno };
