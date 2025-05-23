
/**
 * DiagnosticsPanel component
 * 
 * A diagnostic panel shown at the bottom of the sidebar with basic information
 * for debugging purposes, including a test mode for onboarding.
 */
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood';
import { Button } from '@/components/ui/button';
import OnboardingDialog from '@/components/onboarding/OnboardingDialog';
import { useUser } from '@supabase/auth-helpers-react';
// Removed LoggingControls import since it's temporarily disabled

// Define the component props interface
interface DiagnosticsPanelProps {
  user: User | null | undefined;
  currentNeighborhood: Neighborhood | null;
}

/**
 * DiagnosticsPanel displays basic debugging information in the sidebar
 * and provides diagnostic tools like the onboarding test mode
 */
const DiagnosticsPanel = ({ 
  user,
  currentNeighborhood
}: DiagnosticsPanelProps) => {
  // Only show diagnostics in development mode
  if (import.meta.env.PROD) {
    return null;
  }
  
  // State for controlling the test onboarding dialog
  const [showOnboardingTest, setShowOnboardingTest] = useState(false);
  
  return (
    <div className="mt-4 p-2 text-xs text-gray-500 bg-gray-50 rounded border border-gray-100">
      <h6 className="font-medium mb-1">Diagnostics</h6>
      
      {/* User information */}
      <div className="mb-1">
        {user ? (
          <span>👤 {user.email?.split('@')[0] || 'User'}</span>
        ) : (
          <span className="text-amber-700">⚠️ No user</span>
        )}
      </div>
      
      {/* Neighborhood information */}
      <div className="mb-2">
        {currentNeighborhood ? (
          <span>🏘️ {currentNeighborhood.name}</span>
        ) : (
          <span className="text-amber-700">⚠️ No neighborhood</span>
        )}
      </div>
      
      {/* Testing Tools Section */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <h6 className="font-medium mb-1">Testing Tools</h6>
        
        {/* Onboarding Test Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-7 text-xs mb-2" 
          onClick={() => setShowOnboardingTest(true)}
        >
          Test Onboarding Flow
        </Button>
        
        {/* Onboarding Test Dialog */}
        <OnboardingDialog 
          open={showOnboardingTest} 
          onOpenChange={setShowOnboardingTest} 
        />
      </div>
      
      {/* Logging Controls temporarily disabled section */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <h6 className="font-medium mb-1">Logging Controls</h6>
        <p className="text-amber-600 text-[10px]">
          Temporarily disabled - Coming soon in Phase 2
        </p>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
