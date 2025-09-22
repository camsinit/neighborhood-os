#!/usr/bin/env node

/**
 * Git Commit & Push Automation Script
 * 
 * This script automates the common git workflow:
 * 1. Shows git status
 * 2. Allows you to stage files (or stage all)
 * 3. Prompts for commit message
 * 4. Commits the changes
 * 5. Pushes to the current branch
 * 
 * Usage: node scripts/git-commit-push.js [options]
 * Options:
 *   --all, -a     Stage all modified files
 *   --message, -m "commit message"  Skip interactive commit message prompt
 *   --push, -p    Auto-push after commit (default: asks)
 *   --help, -h    Show this help
 */

import { execSync, spawn } from 'child_process';
import readline from 'readline';

// Colors for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

function getCurrentBranch() {
  const result = execCommand('git branch --show-current', { silent: true });
  return result.success ? result.output.trim() : 'unknown';
}

function getGitStatus() {
  const result = execCommand('git status --porcelain', { silent: true });
  return result.success ? result.output.trim() : '';
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function showHelp() {
  console.log(colorize('🚀 Git Commit & Push Automation Script', 'cyan'));
  console.log('=====================================\n');
  console.log('Usage: node scripts/git-commit-push.js [options]\n');
  console.log('Options:');
  console.log('  --all, -a                    Stage all modified files');
  console.log('  --message, -m "message"      Skip interactive commit message prompt');
  console.log('  --push, -p                   Auto-push after commit');
  console.log('  --help, -h                   Show this help\n');
  console.log('Examples:');
  console.log('  node scripts/git-commit-push.js');
  console.log('  node scripts/git-commit-push.js --all --push');
  console.log('  node scripts/git-commit-push.js -m "Fix bug in newsletter script"');
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const flags = {
    all: args.includes('--all') || args.includes('-a'),
    push: args.includes('--push') || args.includes('-p'),
    help: args.includes('--help') || args.includes('-h'),
    message: null
  };

  // Extract message if provided
  const messageIndex = args.findIndex(arg => arg === '--message' || arg === '-m');
  if (messageIndex !== -1 && args[messageIndex + 1]) {
    flags.message = args[messageIndex + 1];
  }

  if (flags.help) {
    showHelp();
    return;
  }

  console.log(colorize('🚀 Git Commit & Push Automation', 'cyan'));
  console.log('=================================\n');

  // Check if we're in a git repository
  const gitCheck = execCommand('git status', { silent: true });
  if (!gitCheck.success) {
    console.error(colorize('❌ Error: Not in a git repository!', 'red'));
    process.exit(1);
  }

  // Show current branch
  const currentBranch = getCurrentBranch();
  console.log(colorize(`📍 Current branch: ${currentBranch}`, 'blue'));

  // Show git status
  console.log(colorize('\n📊 Git Status:', 'yellow'));
  console.log('================');
  const statusResult = execCommand('git status');
  if (!statusResult.success) {
    console.error(colorize('❌ Failed to get git status', 'red'));
    process.exit(1);
  }

  // Check if there are any changes
  const statusOutput = getGitStatus();
  if (!statusOutput) {
    console.log(colorize('\n✅ No changes to commit!', 'green'));
    return;
  }

  // Stage files
  console.log(colorize('\n📝 Staging Files:', 'yellow'));
  console.log('==================');
  
  if (flags.all) {
    console.log('Staging all modified files...');
    const addResult = execCommand('git add .');
    if (!addResult.success) {
      console.error(colorize('❌ Failed to stage files', 'red'));
      process.exit(1);
    }
    console.log(colorize('✅ All files staged!', 'green'));
  } else {
    const stageChoice = await askQuestion(colorize('Stage all files? (y/n/specific): ', 'cyan'));
    
    if (stageChoice.toLowerCase() === 'y' || stageChoice.toLowerCase() === 'yes') {
      const addResult = execCommand('git add .');
      if (!addResult.success) {
        console.error(colorize('❌ Failed to stage files', 'red'));
        process.exit(1);
      }
      console.log(colorize('✅ All files staged!', 'green'));
    } else if (stageChoice.toLowerCase() === 'n' || stageChoice.toLowerCase() === 'no') {
      console.log(colorize('⏭️  Skipping file staging. Make sure to stage files manually!', 'yellow'));
    } else {
      const specificFiles = await askQuestion(colorize('Enter file paths (space-separated): ', 'cyan'));
      const addResult = execCommand(`git add ${specificFiles}`);
      if (!addResult.success) {
        console.error(colorize('❌ Failed to stage specified files', 'red'));
        process.exit(1);
      }
      console.log(colorize('✅ Specified files staged!', 'green'));
    }
  }

  // Get commit message
  let commitMessage = flags.message;
  if (!commitMessage) {
    console.log(colorize('\n💬 Commit Message:', 'yellow'));
    console.log('===================');
    commitMessage = await askQuestion(colorize('Enter commit message: ', 'cyan'));
    
    if (!commitMessage) {
      console.error(colorize('❌ Commit message cannot be empty!', 'red'));
      process.exit(1);
    }
  }

  // Commit changes
  console.log(colorize('\n📦 Committing Changes:', 'yellow'));
  console.log('=======================');
  const commitResult = execCommand(`git commit -m "${commitMessage}"`);
  if (!commitResult.success) {
    console.error(colorize('❌ Failed to commit changes', 'red'));
    console.error(commitResult.error);
    process.exit(1);
  }
  console.log(colorize('✅ Changes committed successfully!', 'green'));

  // Push changes
  const shouldPush = flags.push || (await askQuestion(colorize(`\n🚀 Push to origin/${currentBranch}? (y/n): `, 'cyan'))).toLowerCase().startsWith('y');
  
  if (shouldPush) {
    console.log(colorize('\n🚀 Pushing to Remote:', 'yellow'));
    console.log('=====================');
    const pushResult = execCommand(`git push origin ${currentBranch}`);
    if (!pushResult.success) {
      console.error(colorize('❌ Failed to push changes', 'red'));
      console.error(pushResult.error);
      process.exit(1);
    }
    console.log(colorize('✅ Changes pushed successfully!', 'green'));
  } else {
    console.log(colorize('\n⏭️  Skipping push. Changes are committed locally.', 'yellow'));
    console.log(colorize(`💡 To push later: git push origin ${currentBranch}`, 'blue'));
  }

  console.log(colorize('\n🎉 Git workflow completed!', 'green'));
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error(colorize(`\n❌ Unexpected error: ${error.message}`, 'red'));
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(colorize('\n\n👋 Git workflow cancelled.', 'yellow'));
  process.exit(0);
});

main().catch(error => {
  console.error(colorize(`❌ Error: ${error.message}`, 'red'));
  process.exit(1);
});
