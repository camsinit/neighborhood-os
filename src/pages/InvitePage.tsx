
import React, { useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import InviteDialogContent from '@/components/invite/InviteDialogContent';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoCircled } from 'lucide-react';

/**
 * InvitePage component
 * 
 * Provides a dedicated page for inviting neighbors to join the neighborhood.
 * It includes clear information about the invite process and permissions.
 */
const InvitePage: React.FC = () => {
  const { currentNeighborhood } = useNeighborhood();
  const navigate = useNavigate();
  const user = useUser();
  
  // Log when the component mounts for debugging
  useEffect(() => {
    console.log("[InvitePage] Page mounted, neighborhood:", currentNeighborhood?.name);
  }, [currentNeighborhood]);

  // Handle dialog close by navigating back
  const handleClose = () => {
    navigate(-1);
  };

  // If no neighborhood is available, show a message
  if (!currentNeighborhood) {
    return (
      <ModuleLayout
        title="Invite Neighbors"
        themeColor="neighbors"
        description="You need to be part of a neighborhood to invite others."
      >
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <Alert className="mb-4">
            <InfoCircled className="h-4 w-4" />
            <AlertTitle>No Neighborhood Found</AlertTitle>
            <AlertDescription>
              You need to be part of a neighborhood before you can invite others.
              Please join a neighborhood first.
            </AlertDescription>
          </Alert>
          <button 
            onClick={() => navigate('/join')} 
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Join a Neighborhood
          </button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Invite Neighbors"
      themeColor="neighbors"
      description={`Invite others to join ${currentNeighborhood.name}`}
    >
      <div className="bg-white rounded-lg border shadow-sm p-6">
        {/* Informational alert about invitations */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoCircled className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Neighborhood Invitation Information</AlertTitle>
          <AlertDescription className="text-blue-600">
            As a member of {currentNeighborhood.name}, you can invite neighbors to join your
            community. Each invitation creates a unique link that expires after use.
            Only invite people you know and trust to be part of your neighborhood.
          </AlertDescription>
        </Alert>
        
        {/* Embed the invite dialog content directly in the page */}
        <InviteDialogContent onClose={handleClose} />
      </div>
    </ModuleLayout>
  );
};

export default InvitePage;
