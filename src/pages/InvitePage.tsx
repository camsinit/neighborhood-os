
import React, { useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import InviteDialogContent from '@/components/invite/InviteDialogContent';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';
import { useNavigate } from 'react-router-dom';

/**
 * InvitePage component
 * 
 * Provides a page-based interface for inviting neighbors by directly
 * embedding the InviteDialogContent component
 */
const InvitePage: React.FC = () => {
  const { currentNeighborhood } = useNeighborhood();
  const navigate = useNavigate();
  
  // Log when the component mounts for debugging
  useEffect(() => {
    console.log("[InvitePage] Page mounted");
  }, []);

  // Handle dialog close by navigating back
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <ModuleLayout
      title="Invite Neighbors"
      themeColor="neighbors"
      description={currentNeighborhood ? `Invite others to join ${currentNeighborhood.name}` : undefined}
    >
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <InviteDialogContent onClose={handleClose} />
      </div>
    </ModuleLayout>
  );
};

export default InvitePage;
