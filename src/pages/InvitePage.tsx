
import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import InviteDialog from '@/components/InviteDialog';

/**
 * InvitePage component
 * 
 * This page displays the invite interface directly in the page layout
 * rather than in a dialog/popover
 */
const InvitePage: React.FC = () => {
  // We'll use this state to control the embedded invite component
  const [isOpen, setIsOpen] = useState(true);

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
          * The dialog's open state is always true since it's now embedded in the page 
          */}
        <InviteDialog 
          open={isOpen} 
          onOpenChange={setIsOpen} 
        />
      </div>
    </ModuleLayout>
  );
};

export default InvitePage;
