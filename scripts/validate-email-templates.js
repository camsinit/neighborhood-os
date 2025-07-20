
#!/usr/bin/env node

/**
 * Email Template Validation Script
 * 
 * This script validates that email templates are properly synchronized
 * and that all required templates exist for each edge function.
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Import mappings from sync script
const { TEMPLATE_MAPPINGS } = require('./sync-email-templates.js');

/**
 * Check if source templates exist and are valid
 */
function validateSourceTemplates() {
  console.log(`${colors.bright}🔍 Validating source templates...${colors.reset}`);
  
  const sourceDir = path.join(__dirname, '..', 'emails');
  const issues = [];
  
  if (!fs.existsSync(sourceDir)) {
    issues.push(`Source directory '/emails' does not exist`);
    return issues;
  }
  
  // Check each mapped template
  Object.keys(TEMPLATE_MAPPINGS).forEach(templateName => {
    const sourcePath = path.join(sourceDir, templateName);
    
    if (!fs.existsSync(sourcePath)) {
      issues.push(`Missing source template: ${templateName}`);
    } else {
      // Basic syntax validation
      try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        
        // Check for required exports
        if (!content.includes('export')) {
          issues.push(`${templateName}: Missing export statement`);
        }
        
        // Check for React Email imports
        if (!content.includes('@react-email/components')) {
          issues.push(`${templateName}: Missing React Email imports`);
        }
        
        console.log(`  ${colors.green}✓${colors.reset} ${templateName}`);
      } catch (error) {
        issues.push(`${templateName}: Read error - ${error.message}`);
      }
    }
  });
  
  return issues;
}

/**
 * Check if production templates are in sync
 */
function validateProductionTemplates() {
  console.log(`${colors.bright}🔄 Validating production templates...${colors.reset}`);
  
  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  const issues = [];
  
  if (!fs.existsSync(functionsDir)) {
    issues.push(`Functions directory 'supabase/functions' does not exist`);
    return issues;
  }
  
  // Check each mapping
  Object.entries(TEMPLATE_MAPPINGS).forEach(([templateName, targetFunctions]) => {
    targetFunctions.forEach(functionName => {
      const templatePath = path.join(functionsDir, functionName, '_templates', templateName);
      
      if (!fs.existsSync(templatePath)) {
        issues.push(`Missing production template: ${functionName}/_templates/${templateName}`);
      } else {
        // Check if it has Deno imports
        try {
          const content = fs.readFileSync(templatePath, 'utf8');
          
          if (!content.includes('npm:@react-email/components')) {
            issues.push(`${functionName}/_templates/${templateName}: Missing Deno imports (needs sync)`);
          }
          
          console.log(`  ${colors.green}✓${colors.reset} ${functionName}/_templates/${templateName}`);
        } catch (error) {
          issues.push(`${functionName}/_templates/${templateName}: Read error - ${error.message}`);
        }
      }
    });
  });
  
  return issues;
}

/**
 * Check for orphaned templates
 */
function validateOrphanedTemplates() {
  console.log(`${colors.bright}🧹 Checking for orphaned templates...${colors.reset}`);
  
  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  const issues = [];
  
  if (!fs.existsSync(functionsDir)) {
    return issues;
  }
  
  // Get all function directories
  const functionDirs = fs.readdirSync(functionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  functionDirs.forEach(functionName => {
    const templatesDir = path.join(functionsDir, functionName, '_templates');
    
    if (fs.existsSync(templatesDir)) {
      const templates = fs.readdirSync(templatesDir)
        .filter(file => file.endsWith('.tsx'));
      
      templates.forEach(templateName => {
        // Check if this template is in our mappings
        const isValidTemplate = TEMPLATE_MAPPINGS[templateName] && 
          TEMPLATE_MAPPINGS[templateName].includes(functionName);
        
        if (!isValidTemplate) {
          issues.push(`Orphaned template: ${functionName}/_templates/${templateName} (not in sync mappings)`);
        }
      });
    }
  });
  
  return issues;
}

/**
 * Main validation function
 */
function validateAll() {
  console.log(`${colors.bright}📧 Email Template Validation${colors.reset}\n`);
  
  const allIssues = [
    ...validateSourceTemplates(),
    ...validateProductionTemplates(),
    ...validateOrphanedTemplates()
  ];
  
  console.log(`\n${colors.bright}📊 Validation Summary:${colors.reset}`);
  
  if (allIssues.length === 0) {
    console.log(`${colors.green}${colors.bright}✅ All email templates are valid and in sync!${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}${colors.bright}❌ Found ${allIssues.length} issue(s):${colors.reset}\n`);
    
    allIssues.forEach(issue => {
      console.log(`  ${colors.red}✗${colors.reset} ${issue}`);
    });
    
    console.log(`\n${colors.yellow}💡 To fix sync issues, run: npm run sync:templates${colors.reset}`);
    return false;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}Email Template Validation Script${colors.reset}

${colors.bright}Usage:${colors.reset}
  node scripts/validate-email-templates.js    Run all validations
  node scripts/validate-email-templates.js --help    Show this help

${colors.bright}Description:${colors.reset}
  Validates that email templates are properly synchronized between
  /emails/ (source) and supabase/functions/*//_templates/ (production).
  
  Checks for:
  - Missing source templates
  - Missing production templates  
  - Incorrect Deno imports
  - Orphaned templates
    `);
  } else {
    const success = validateAll();
    process.exit(success ? 0 : 1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { validateAll };
