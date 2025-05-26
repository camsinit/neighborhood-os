
/**
 * RLS Diagnostics Panel
 * 
 * A debug panel that shows RLS policy status and runs diagnostics
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Play, RefreshCw, Bug } from 'lucide-react';
import { runFullRLSDiagnostics, testNeighborhoodAccess, logAuthState } from '@/utils/rls-diagnostics';
import { runFullRecursionDebug } from '@/utils/rls-recursion-debugger';
import { useNeighborhood } from '@/contexts/neighborhood';

export const RLSDiagnosticsPanel = () => {
  const [diagnosticsResults, setDiagnosticsResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [neighborhoodAccess, setNeighborhoodAccess] = useState<any>(null);
  const { currentNeighborhood } = useNeighborhood();

  const runDiagnostics = async () => {
    setIsRunning(true);
    console.log('🔍 Starting RLS Diagnostics...');
    
    try {
      // Log auth state first
      await logAuthState();
      
      // Run full table diagnostics
      const results = await runFullRLSDiagnostics();
      setDiagnosticsResults(results);
      
      // Test neighborhood access if we have one
      if (currentNeighborhood?.id) {
        const neighborhoodResult = await testNeighborhoodAccess(currentNeighborhood.id);
        setNeighborhoodAccess(neighborhoodResult);
      }
      
      console.log('✅ RLS Diagnostics Complete');
    } catch (error) {
      console.error('❌ RLS Diagnostics Failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runRecursionDebug = async () => {
    setIsDebugging(true);
    console.log('🐛 Starting Recursion Debug...');
    
    try {
      await runFullRecursionDebug();
      console.log('✅ Recursion Debug Complete - Check console for detailed results');
    } catch (error) {
      console.error('❌ Recursion Debug Failed:', error);
    } finally {
      setIsDebugging(false);
    }
  };

  const getStatusBadge = (result: any) => {
    if (!result) return <Badge variant="secondary">Not tested</Badge>;
    
    if (result.success) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    } else {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          RLS Diagnostics Panel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test Row Level Security policies and diagnose access issues
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </Button>
          
          <Button 
            onClick={runRecursionDebug} 
            disabled={isDebugging}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isDebugging ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Bug className="w-4 h-4" />
            )}
            {isDebugging ? 'Debugging...' : 'Debug Recursion'}
          </Button>
        </div>

        {/* Auth State */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Current Context</h4>
          <div className="text-sm space-y-1">
            <div>Neighborhood: {currentNeighborhood?.name || 'None'}</div>
            <div>Neighborhood ID: {currentNeighborhood?.id || 'None'}</div>
          </div>
        </div>

        {/* Neighborhood Access Results */}
        {neighborhoodAccess && (
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium mb-2">Neighborhood Access Test</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Has Access:</span>
                <Badge variant={neighborhoodAccess.hasAccess ? "default" : "destructive"}>
                  {neighborhoodAccess.hasAccess ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Direct Access:</span>
                <Badge variant={neighborhoodAccess.directAccess ? "default" : "destructive"}>
                  {neighborhoodAccess.directAccess ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Membership Found:</span>
                <Badge variant={neighborhoodAccess.membershipFound ? "default" : "destructive"}>
                  {neighborhoodAccess.membershipFound ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Function Result:</span>
                <Badge variant={neighborhoodAccess.functionResult ? "default" : "destructive"}>
                  {neighborhoodAccess.functionResult ? 'Yes' : 'No'}
                </Badge>
              </div>
              {neighborhoodAccess.errors && (
                <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                  <strong>Errors:</strong>
                  <pre className="mt-1">{JSON.stringify(neighborhoodAccess.errors, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Access Results */}
        {diagnosticsResults && (
          <div className="space-y-2">
            <h4 className="font-medium">Table Access Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(diagnosticsResults).map(([tableName, result]: [string, any]) => (
                <div key={tableName} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">{tableName}</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result)}
                    <span className="text-xs text-muted-foreground">
                      {result?.duration}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Details */}
        {diagnosticsResults && (
          <div className="space-y-2">
            <h4 className="font-medium">Error Details</h4>
            <div className="space-y-2">
              {Object.entries(diagnosticsResults)
                .filter(([, result]: [string, any]) => !result.success)
                .map(([tableName, result]: [string, any]) => (
                  <div key={tableName} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="font-medium text-red-800">{tableName}</div>
                    <div className="text-sm text-red-600 mt-1">
                      <div><strong>Message:</strong> {result.error?.message}</div>
                      {result.error?.code && <div><strong>Code:</strong> {result.error.code}</div>}
                      {result.error?.hint && <div><strong>Hint:</strong> {result.error.hint}</div>}
                      {result.error?.details && <div><strong>Details:</strong> {result.error.details}</div>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Click "Debug Recursion" and then check your browser console for detailed logs. 
            Look for messages starting with "🚨 RECURSION TRIGGER" to identify the exact cause of infinite recursion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
