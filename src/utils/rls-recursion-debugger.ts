
/**
 * RLS Recursion Debugger
 * 
 * This utility helps identify the exact source of infinite recursion in RLS policies
 * by testing individual policies and functions in isolation
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

const logger = createLogger('RLS-Recursion-Debugger');

/**
 * Test individual RLS functions to see which ones cause recursion
 */
export const testRLSFunctions = async () => {
  logger.info('=== Starting RLS Function Tests ===');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    logger.error('No authenticated user found');
    return;
  }

  const functionsToTest = [
    'is_super_admin',
    'check_user_role',
    'user_is_core_contributor_with_access',
    'check_neighborhood_access',
    'get_user_accessible_neighborhoods',
    'simple_membership_check'
  ];

  for (const functionName of functionsToTest) {
    try {
      logger.info(`Testing function: ${functionName}`);
      
      const { data, error } = await supabase.rpc(functionName as any, { 
        user_uuid: user.id,
        ...(functionName === 'check_neighborhood_access' && { 
          neighborhood_uuid: 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d' 
        }),
        ...(functionName === 'check_user_role' && { 
          required_role: 'user' 
        })
      });
      
      if (error) {
        logger.error(`Function ${functionName} failed:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      } else {
        logger.info(`Function ${functionName} succeeded:`, data);
      }
    } catch (err: any) {
      logger.error(`Function ${functionName} threw exception:`, err.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

/**
 * Test basic table access without any complex queries
 */
export const testBasicTableAccess = async () => {
  logger.info('=== Starting Basic Table Access Tests ===');
  
  const basicTables = [
    'profiles',
    'user_roles',
    'neighborhoods', 
    'neighborhood_members'
  ];

  for (const tableName of basicTables) {
    try {
      logger.info(`Testing basic SELECT on: ${tableName}`);
      
      // Try the most basic possible query
      const { data, error } = await (supabase.from as any)(tableName)
        .select('id')
        .limit(1);
      
      if (error) {
        logger.error(`Table ${tableName} failed:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If it's an infinite recursion error, this is our trigger
        if (error.message?.includes('infinite recursion')) {
          logger.error(`🚨 RECURSION TRIGGER FOUND: Table ${tableName} has a policy causing infinite recursion`);
        }
      } else {
        logger.info(`Table ${tableName} succeeded, returned ${data?.length || 0} rows`);
      }
    } catch (err: any) {
      logger.error(`Table ${tableName} threw exception:`, err.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

/**
 * Test specific policies by trying operations that would trigger them
 */
export const testSpecificPolicies = async () => {
  logger.info('=== Starting Specific Policy Tests ===');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Test 1: Try to query user_roles for the current user (this often causes recursion)
  try {
    logger.info('Testing user_roles query for current user...');
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    if (error) {
      logger.error('user_roles query failed:', error);
      if (error.message?.includes('infinite recursion')) {
        logger.error('🚨 RECURSION TRIGGER: user_roles table policy is recursive');
      }
    } else {
      logger.info('user_roles query succeeded:', data);
    }
  } catch (err: any) {
    logger.error('user_roles query threw exception:', err.message);
  }

  // Test 2: Try to query profiles for the current user
  try {
    logger.info('Testing profiles query for current user...');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', user.id)
      .single();
    
    if (error) {
      logger.error('profiles query failed:', error);
      if (error.message?.includes('infinite recursion')) {
        logger.error('🚨 RECURSION TRIGGER: profiles table policy is recursive');
      }
    } else {
      logger.info('profiles query succeeded:', data);
    }
  } catch (err: any) {
    logger.error('profiles query threw exception:', err.message);
  }

  // Test 3: Try a neighborhood query
  try {
    logger.info('Testing neighborhoods query...');
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .limit(1);
    
    if (error) {
      logger.error('neighborhoods query failed:', error);
      if (error.message?.includes('infinite recursion')) {
        logger.error('🚨 RECURSION TRIGGER: neighborhoods table policy is recursive');
      }
    } else {
      logger.info('neighborhoods query succeeded:', data);
    }
  } catch (err: any) {
    logger.error('neighborhoods query threw exception:', err.message);
  }
};

/**
 * Run all debugger tests in sequence
 */
export const runFullRecursionDebug = async () => {
  logger.info('🔍 Starting Full RLS Recursion Debug Session');
  
  try {
    // First test basic table access
    await testBasicTableAccess();
    
    // Then test specific policies
    await testSpecificPolicies();
    
    // Finally test RLS functions
    await testRLSFunctions();
    
    logger.info('✅ RLS Recursion Debug Session Complete - Check logs above for 🚨 RECURSION TRIGGER messages');
  } catch (err: any) {
    logger.error('Debug session failed:', err.message);
  }
};
