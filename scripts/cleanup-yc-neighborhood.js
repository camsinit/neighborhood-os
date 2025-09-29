#!/usr/bin/env node

/**
 * YC Neighborhood Cleanup Script
 * 
 * This script removes all data related to the YC Neighborhood from the database.
 * It handles all related tables and foreign key constraints properly.
 * 
 * IMPORTANT: This script is destructive and cannot be undone!
 * Always run this in a development environment first.
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
      process.env[key.trim()] = value.trim();
    }
  });
}

// Configuration
const YC_NEIGHBORHOOD_NAME = 'YC Neighborhood'; // Change this to match your exact neighborhood name
const DRY_RUN = process.argv.includes('--dry-run'); // Add --dry-run flag to test without deleting
const FORCE = process.argv.includes('--force'); // Add --force flag to skip confirmation

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Safety check function
 */
async function safetyCheck() {
  console.log('🔍 Performing safety checks...');
  
  // Check if we're connected to the database
  const { data, error } = await supabase.from('neighborhoods').select('count').limit(1);
  if (error) {
    console.error('❌ Error connecting to database:', error.message);
    process.exit(1);
  }
  
  // Find the YC Neighborhood
  const { data: neighborhoods, error: neighborhoodError } = await supabase
    .from('neighborhoods')
    .select('id, name, created_at, created_by')
    .ilike('name', `%${YC_NEIGHBORHOOD_NAME}%`);
  
  if (neighborhoodError) {
    console.error('❌ Error finding neighborhood:', neighborhoodError.message);
    process.exit(1);
  }
  
  if (!neighborhoods || neighborhoods.length === 0) {
    console.log(`✅ No neighborhoods found matching "${YC_NEIGHBORHOOD_NAME}"`);
    console.log('Nothing to clean up!');
    process.exit(0);
  }
  
  console.log(`🎯 Found ${neighborhoods.length} neighborhood(s) matching "${YC_NEIGHBORHOOD_NAME}":`);
  neighborhoods.forEach(n => {
    console.log(`   - ${n.name} (ID: ${n.id}, Created: ${n.created_at})`);
  });
  
  return neighborhoods;
}

/**
 * Get data counts for the neighborhood
 */
async function getDataCounts(neighborhoodId) {
  console.log(`\n📊 Gathering data counts for neighborhood ${neighborhoodId}...`);
  
  const tables = [
    'neighborhood_members',
    'neighborhood_roles', 
    'invitations',
    'events',
    'event_rsvps',
    'groups',
    'group_members',
    'group_updates',
    'group_update_comments',
    'group_update_reactions',
    'skills_exchange',
    'skill_contributors',
    'goods_exchange',
    'safety_updates',
    'safety_update_comments',
    'support_requests',
    'activities',
    'notifications',
    'shared_items',
    'email_queue'
  ];
  
  const counts = {};
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('neighborhood_id', neighborhoodId);
      
      if (error && !error.message.includes('column "neighborhood_id" does not exist')) {
        // Some tables might not have neighborhood_id column
        counts[table] = { count: 0, error: error.message };
      } else {
        counts[table] = { count: count || 0, error: null };
      }
    } catch (err) {
      counts[table] = { count: 0, error: err.message };
    }
  }
  
  // Special handling for tables that don't have neighborhood_id
  try {
    // Get user IDs from neighborhood members
    const { data: members } = await supabase
      .from('neighborhood_members')
      .select('user_id')
      .eq('neighborhood_id', neighborhoodId);
    
    const userIds = members?.map(m => m.user_id) || [];
    
    if (userIds.length > 0) {
      // Count profiles that belong to this neighborhood
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('id', userIds);
      
      counts['profiles'] = { count: profilesCount || 0, error: null };
    } else {
      counts['profiles'] = { count: 0, error: null };
    }
  } catch (err) {
    counts['profiles'] = { count: 0, error: err.message };
  }
  
  return counts;
}

/**
 * Display data summary
 */
function displayDataSummary(counts) {
  console.log('\n📋 Data Summary:');
  console.log('================');
  
  let totalRecords = 0;
  const tableOrder = [
    'neighborhood_members',
    'neighborhood_roles',
    'profiles',
    'invitations',
    'events',
    'event_rsvps',
    'groups',
    'group_members',
    'group_updates',
    'group_update_comments',
    'group_update_reactions',
    'skills_exchange',
    'skill_contributors',
    'goods_exchange',
    'safety_updates',
    'safety_update_comments',
    'support_requests',
    'activities',
    'notifications',
    'shared_items',
    'email_queue'
  ];
  
  tableOrder.forEach(table => {
    const data = counts[table];
    if (data && data.count > 0) {
      console.log(`   ${table}: ${data.count} records`);
      totalRecords += data.count;
    }
  });
  
  console.log(`\n🎯 Total records to be deleted: ${totalRecords}`);
  
  if (totalRecords === 0) {
    console.log('✅ No data found for this neighborhood. Nothing to clean up!');
    return false;
  }
  
  return true;
}

/**
 * Delete data from a specific table
 */
async function deleteFromTable(tableName, neighborhoodId, userIds = []) {
  try {
    let query = supabase.from(tableName);
    
    // Handle different table structures
    if (tableName === 'profiles' && userIds.length > 0) {
      query = query.in('id', userIds);
    } else if (tableName === 'support_requests' && userIds.length > 0) {
      query = query.in('user_id', userIds);
    } else {
      query = query.eq('neighborhood_id', neighborhoodId);
    }
    
    if (DRY_RUN) {
      const { count } = await query.select('*', { count: 'exact', head: true });
      console.log(`   [DRY RUN] Would delete ${count || 0} records from ${tableName}`);
      return { success: true, count: count || 0 };
    } else {
      const { error } = await query.delete();
      if (error) {
        console.log(`   ❌ Error deleting from ${tableName}: ${error.message}`);
        return { success: false, error: error.message };
      } else {
        console.log(`   ✅ Deleted from ${tableName}`);
        return { success: true };
      }
    }
  } catch (err) {
    console.log(`   ❌ Exception deleting from ${tableName}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Main cleanup function
 */
async function cleanupNeighborhood(neighborhoodId) {
  console.log(`\n🧹 Starting cleanup for neighborhood ${neighborhoodId}...`);
  
  // Get user IDs first
  const { data: members } = await supabase
    .from('neighborhood_members')
    .select('user_id')
    .eq('neighborhood_id', neighborhoodId);
  
  const userIds = members?.map(m => m.user_id) || [];
  console.log(`   Found ${userIds.length} users associated with this neighborhood`);
  
  // Define deletion order (respecting foreign key constraints)
  const deletionOrder = [
    // Activities and notifications first (they reference many things)
    'activities',
    'notifications',
    
    // Group-related data
    'group_update_reactions',
    'group_update_comments', 
    'group_updates',
    'group_members',
    'groups',
    
    // Event-related data
    'event_rsvps',
    'events',
    
    // Skills and goods
    'skill_contributors',
    'skills_exchange',
    'goods_exchange',
    
    // Safety updates
    'safety_update_comments',
    'safety_updates',
    
    // Support requests
    'support_requests',
    
    // Shared items and email queue
    'shared_items',
    'email_queue',
    
    // Invitations
    'invitations',
    
    // Neighborhood relationships
    'neighborhood_roles',
    'neighborhood_members',
    
    // Finally, the neighborhood itself
    'neighborhoods'
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const table of deletionOrder) {
    console.log(`\n🗑️  Processing ${table}...`);
    
    if (table === 'neighborhoods') {
      // Special handling for the neighborhoods table
      if (DRY_RUN) {
        console.log(`   [DRY RUN] Would delete neighborhood record`);
      } else {
        const { error } = await supabase
          .from('neighborhoods')
          .delete()
          .eq('id', neighborhoodId);
        
        if (error) {
          console.log(`   ❌ Error deleting neighborhood: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Deleted neighborhood record`);
          successCount++;
        }
      }
    } else {
      const result = await deleteFromTable(table, neighborhoodId, userIds);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
  }
  
  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   ✅ Successful operations: ${successCount}`);
  console.log(`   ❌ Failed operations: ${errorCount}`);
  
  return { successCount, errorCount };
}

/**
 * Confirmation prompt
 */
async function confirmDeletion(neighborhoods, counts) {
  if (FORCE) {
    console.log('🚨 --force flag detected, skipping confirmation');
    return true;
  }
  
  console.log('\n⚠️  WARNING: This operation will permanently delete all data for the YC Neighborhood!');
  console.log('This includes:');
  console.log('   - All user profiles and memberships');
  console.log('   - All events, groups, and activities');
  console.log('   - All skills, goods, and support requests');
  console.log('   - All notifications and email queue items');
  console.log('   - The neighborhood itself');
  console.log('\nThis action CANNOT be undone!');
  
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE: No actual deletions will be performed');
    return true;
  }
  
  console.log('\nType "DELETE YC NEIGHBORHOOD" to confirm:');
  
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('> ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE YC NEIGHBORHOOD');
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🏘️  YC Neighborhood Cleanup Script');
  console.log('==================================');
  
  if (DRY_RUN) {
    console.log('🔍 Running in DRY RUN mode - no data will be deleted');
  }
  
  try {
    // Safety checks
    const neighborhoods = await safetyCheck();
    
    // Process each matching neighborhood
    for (const neighborhood of neighborhoods) {
      console.log(`\n🎯 Processing neighborhood: ${neighborhood.name}`);
      
      // Get data counts
      const counts = await getDataCounts(neighborhood.id);
      
      // Display summary
      const hasData = displayDataSummary(counts);
      
      if (!hasData) {
        console.log(`✅ No data found for "${neighborhood.name}". Skipping.`);
        continue;
      }
      
      // Get confirmation
      const confirmed = await confirmDeletion([neighborhood], counts);
      
      if (!confirmed) {
        console.log('❌ Operation cancelled by user');
        process.exit(0);
      }
      
      // Perform cleanup
      const result = await cleanupNeighborhood(neighborhood.id);
      
      if (result.errorCount === 0) {
        console.log(`\n🎉 Successfully cleaned up "${neighborhood.name}"!`);
      } else {
        console.log(`\n⚠️  Cleanup completed with ${result.errorCount} errors`);
      }
    }
    
    console.log('\n✅ All cleanup operations completed!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
main();
