
import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import InviteDialog from '@/components/InviteDialog';
import { useNavigate } from 'react-router-dom'; // Import for navigation

/**
 * InvitePage component
 * 
 * This page displays the invite interface directly in the page layout
 * rather than in a dialog/popover.
 * 
 * It handles the invitation form in-page and provides navigation back to previous pages.
 */
const InvitePage: React.FC = () => {
  // We'll use this state to control the embedded invite component
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate(); // For navigation back when closed
  
  // Handle dialog close by navigating back
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Navigate back when dialog is closed
      navigate(-1);
    }
  };

  // Log when the component mounts for debugging
  useEffect(() => {
    console.log("[InvitePage] Page mounted");
  }, []);

  return (
    <ModuleLayout
      title="Invite Neighbors" 
      themeColor="neighbors" // Using 'neighbors' theme since this is related to neighborhood members
    >
      <div className="bg-white rounded-lg border shadow-sm">
        {/* 
          * We're reusing the existing InviteDialog component but embedding it directly in the page
          * When dialog is "closed" we navigate back instead of just hiding it
          */}
        <InviteDialog 
          open={isOpen} 
          onOpenChange={handleOpenChange} 
        />
      </div>
    </ModuleLayout>
  );
};

export default InvitePage;
