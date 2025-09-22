#!/usr/bin/env node

/**
 * Newsletter Preview Script
 * 
 * This script automates the newsletter preview workflow.
 * Usage: node scripts/preview-newsletter.js [newsletter-filename]
 * 
 * If no filename is provided, it will find the most recent newsletter file.
 * The script will:
 * 1. Generate the full file:// URL
 * 2. Display it for easy copying
 * 3. Optionally open it in the default browser
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findNewsletterFiles() {
  try {
    // Look in the project root directory (one level up from scripts)
    const projectRoot = path.resolve(__dirname, '..');
    const files = fs.readdirSync(projectRoot)
      .filter(file => file.startsWith('newsletter-preview-final-') && file.endsWith('.html'))
      .map(file => ({
        name: file,
        stats: fs.statSync(path.join(projectRoot, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime); // Sort by modification time, newest first
    
    return files.map(f => f.name);
  } catch (error) {
    console.error('❌ Error reading directory:', error.message);
    return [];
  }
}

function generateFileUrl(filename) {
  // If filename is just a name, resolve it from project root
  const projectRoot = path.resolve(__dirname, '..');
  const absolutePath = path.isAbsolute(filename) ? filename : path.resolve(projectRoot, filename);
  return `file://${absolutePath}`;
}

function main() {
  const args = process.argv.slice(2);
  
  // Separate flags from filename
  const flags = args.filter(arg => arg.startsWith('-'));
  const nonFlagArgs = args.filter(arg => !arg.startsWith('-'));
  let filename = nonFlagArgs[0];
  
  console.log('🗞️  Newsletter Preview Script');
  console.log('==============================\n');
  
  // If no filename provided, find the most recent newsletter
  if (!filename) {
    console.log('📁 No filename provided, searching for newsletter files...\n');
    
    const newsletterFiles = findNewsletterFiles();
    
    if (newsletterFiles.length === 0) {
      console.error('❌ No newsletter files found!');
      console.log('💡 Make sure you\'re in the project root directory and have newsletter files.');
      process.exit(1);
    }
    
    filename = newsletterFiles[0];
    console.log(`📄 Found ${newsletterFiles.length} newsletter file(s):`);
    newsletterFiles.forEach((file, index) => {
      const indicator = index === 0 ? '👉' : '  ';
      console.log(`${indicator} ${file}`);
    });
    console.log(`\n✅ Using most recent: ${filename}\n`);
  }
  
  // Check if file exists
  const projectRoot = path.resolve(__dirname, '..');
  const fullFilePath = path.isAbsolute(filename) ? filename : path.resolve(projectRoot, filename);
  
  if (!fs.existsSync(fullFilePath)) {
    console.error(`❌ File not found: ${filename}`);
    console.log('\n💡 Available newsletter files:');
    const availableFiles = findNewsletterFiles();
    if (availableFiles.length > 0) {
      availableFiles.forEach(file => console.log(`   ${file}`));
    } else {
      console.log('   No newsletter files found');
    }
    process.exit(1);
  }
  
  // Generate the file URL
  const fileUrl = generateFileUrl(filename);
  
  console.log('🌐 Newsletter Preview URL Generated!');
  console.log('===================================\n');
  console.log('📋 Copy this URL to your browser:');
  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log(`│ ${fileUrl}`);
  console.log('└─────────────────────────────────────────────────────────────────┘\n');
  
  // Ask if user wants to open automatically
  if (flags.includes('--open') || flags.includes('-o')) {
    try {
      console.log('🚀 Opening in default browser...');
      
      // Cross-platform open command
      let openCommand;
      switch (process.platform) {
        case 'darwin': // macOS
          openCommand = 'open';
          break;
        case 'win32': // Windows
          openCommand = 'start';
          break;
        default: // Linux and others
          openCommand = 'xdg-open';
      }
      
      execSync(`${openCommand} "${fileUrl}"`, { stdio: 'ignore' });
      console.log('✅ Newsletter opened in browser!\n');
    } catch (error) {
      console.error('❌ Could not open browser automatically:', error.message);
      console.log('💡 Please copy the URL above and paste it manually.\n');
    }
  } else {
    console.log('💡 To automatically open in browser, add --open or -o flag');
    console.log('   Example: node scripts/preview-newsletter.js --open\n');
  }
  
  console.log('🔍 What to check in the newsletter:');
  console.log('• Skills Section: 14 skills with clickable neighbor name links');
  console.log('• Groups Section: Active groups with member counts');
  console.log('• Overall styling and AI-generated content');
  console.log('• Green styling for neighbor name links\n');
  
  console.log('✨ Happy previewing!');
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

main();
