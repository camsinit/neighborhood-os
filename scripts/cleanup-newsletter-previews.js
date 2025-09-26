#!/usr/bin/env node

/**
 * Newsletter Preview Cleanup Script
 *
 * Keeps only the most recent newsletter preview file and removes older ones.
 * This prevents the repo from being cluttered with multiple preview files.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧹 Newsletter Preview Cleanup');
console.log('============================');

try {
  // Get all newsletter preview files
  const files = fs.readdirSync('.')
    .filter(file => file.startsWith('newsletter-preview-') && file.endsWith('.html'))
    .map(file => {
      const stat = fs.statSync(file);
      return {
        name: file,
        mtime: stat.mtime,
        size: stat.size
      };
    })
    .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

  console.log(`📁 Found ${files.length} newsletter preview files`);

  if (files.length <= 1) {
    console.log('✅ Only one or no preview files found - nothing to clean up');
    process.exit(0);
  }

  // Keep the most recent file, delete the rest
  const mostRecent = files[0];
  const filesToDelete = files.slice(1);

  console.log(`\n📌 Keeping most recent: ${mostRecent.name}`);
  console.log(`   Created: ${mostRecent.mtime.toLocaleString()}`);
  console.log(`   Size: ${(mostRecent.size / 1024).toFixed(1)}KB`);

  console.log(`\n🗑️  Deleting ${filesToDelete.length} older files:`);

  let totalSizeFreed = 0;

  filesToDelete.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
    totalSizeFreed += file.size;

    try {
      fs.unlinkSync(file.name);
    } catch (error) {
      console.error(`   ❌ Failed to delete ${file.name}:`, error.message);
    }
  });

  console.log(`\n✅ Cleanup complete!`);
  console.log(`💾 Freed up ${(totalSizeFreed / 1024).toFixed(1)}KB of disk space`);

  // Also remove any from git staging if they were accidentally added
  try {
    execSync('git reset HEAD newsletter-preview-*.html', { stdio: 'ignore' });
    console.log('🔄 Removed newsletter previews from git staging area');
  } catch (error) {
    // Ignore git errors - might not be in a git repo or files not staged
  }

} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
}