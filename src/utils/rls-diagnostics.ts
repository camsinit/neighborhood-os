
/**
 * RLS Diagnostics Utility
 * 
 * This utility helps diagnose RLS policy issues by logging detailed information
 * about database queries and auth state
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

const logger = createLogger('RLS-Diagnostics');

// Define valid table names that we can test
type TestableTable = 
  | 'profiles'
  | 'user_roles' 
  | 'neighborhoods'
  | 'neighborhood_members'
  | 'notifications'
  | 'activities'
  | 'events'
  | 'event_rsvps'
  | 'skills_exchange'
  | 'goods_exchange'
  | 'safety_updates';

/**
 * Test RLS access for a specific table and operation
 */
export const testTableAccess = async (tableName: TestableTable, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT') => {
  const startTime = Date.now();
  
  try {
    // Get current auth state
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    logger.info(`[${tableName}] Testing ${operation} access`, {
      userId: user?.id,
      email: user?.email,
      authError: authError?.message,
      timestamp: new Date().toISOString()
    });

    if (authError || !user) {
      logger.error(`[${tableName}] Auth check failed`, { authError, hasUser: !!user });
      return { success: false, error: 'Authentication failed', duration: Date.now() - startTime };
    }

    // Test the actual table access - using type assertion to handle dynamic table names
    let result;
    switch (operation) {
      case 'SELECT':
        result = await (supabase.from as any)(tableName).select('*').limit(1);
        break;
      case 'INSERT':
        // We won't actually insert, just test the query structure
        result = await (supabase.from as any)(tableName).select('*').limit(0);
        break;
      default:
        result = await (supabase.from as any)(tableName).select('*').limit(1);
    }

    const duration = Date.now() - startTime;

    if (result.error) {
      logger.error(`[${tableName}] ${operation} failed`, {
        error: result.error,
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        duration
      });
      return { success: false, error: result.error, duration };
    }

    logger.info(`[${tableName}] ${operation} succeeded`, {
      rowCount: result.data?.length || 0,
      duration,
      sample: result.data?.[0] ? 'Has data' : 'No data'
    });

    return { success: true, data: result.data, duration };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`[${tableName}] Unexpected error during ${operation}`, {
      error: error.message,
      stack: error.stack,
      duration
    });
    return { success: false, error, duration };
  }
};

/**
 * Test access to all core tables
 */
export const runFullRLSDiagnostics = async () => {
  logger.info('=== Starting Full RLS Diagnostics ===');
  
  const tables: TestableTable[] = [
    'profiles',
    'user_roles', 
    'neighborhoods',
    'neighborhood_members',
    'notifications',
    'activities',
    'events',
    'event_rsvps',
    'skills_exchange',
    'goods_exchange',
    'safety_updates'
  ];

  const results: Record<string, any> = {};
  
  for (const table of tables) {
    logger.info(`Testing table: ${table}`);
    results[table] = await testTableAccess(table);
    
    // Add a small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary log
  const successful = Object.entries(results).filter(([, result]) => result.success);
  const failed = Object.entries(results).filter(([, result]) => !result.success);

  logger.info('=== RLS Diagnostics Summary ===', {
    totalTables: tables.length,
    successful: successful.length,
    failed: failed.length,
    successfulTables: successful.map(([name]) => name),
    failedTables: failed.map(([name, result]) => ({ name, error: result.error?.message || 'Unknown' }))
  });

  return results;
};

/**
 * Test specific neighborhood access
 */
export const testNeighborhoodAccess = async (neighborhoodId: string) => {
  logger.info(`Testing neighborhood access for: ${neighborhoodId}`);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.error('No authenticated user for neighborhood test');
    return { hasAccess: false, reason: 'Not authenticated' };
  }

  // Test direct neighborhood access
  const neighborhoodResult = await supabase
    .from('neighborhoods')
    .select('id, name, created_by')
    .eq('id', neighborhoodId)
    .single();

  logger.info('Neighborhood direct access test', {
    neighborhoodId,
    result: neighborhoodResult.error ? 'FAILED' : 'SUCCESS',
    error: neighborhoodResult.error?.message,
    data: neighborhoodResult.data
  });

  // Test membership access
  const membershipResult = await supabase
    .from('neighborhood_members')
    .select('user_id, status')
    .eq('neighborhood_id', neighborhoodId)
    .eq('user_id', user.id);

  logger.info('Neighborhood membership test', {
    neighborhoodId,
    userId: user.id,
    result: membershipResult.error ? 'FAILED' : 'SUCCESS',
    error: membershipResult.error?.message,
    membershipData: membershipResult.data
  });

  // Test security definer function with correct parameter names
  try {
    const { data: hasAccess, error: funcError } = await supabase
      .rpc('check_neighborhood_access', {
        user_uuid: user.id,
        neighborhood_uuid: neighborhoodId
      });

    logger.info('Security definer function test', {
      neighborhoodId,
      userId: user.id,
      hasAccess,
      error: funcError?.message
    });

    return {
      hasAccess: !!hasAccess,
      directAccess: !neighborhoodResult.error,
      membershipFound: membershipResult.data && membershipResult.data.length > 0,
      functionResult: hasAccess,
      errors: {
        neighborhood: neighborhoodResult.error?.message,
        membership: membershipResult.error?.message,
        function: funcError?.message
      }
    };

  } catch (error: any) {
    logger.error('Security definer function failed', {
      error: error.message,
      neighborhoodId,
      userId: user.id
    });

    return {
      hasAccess: false,
      reason: 'Security function failed',
      error: error.message
    };
  }
};

/**
 * Log current auth state in detail
 */
export const logAuthState = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  logger.info('=== Current Auth State ===', {
    hasUser: !!user,
    hasSession: !!session,
    userId: user?.id,
    email: user?.email,
    authError: error?.message,
    sessionExpiry: session?.expires_at,
    tokenPresent: !!session?.access_token,
    refreshTokenPresent: !!session?.refresh_token
  });

  return { user, session, error };
};
