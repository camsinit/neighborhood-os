/**
 * SuperAdminNeighborhoodCreation component
 * 
 * Simplified interface for super admin neighborhood creation via waitlist management.
 * All neighborhood creation now happens through the waitlist panel.
 */
import React from 'react';
import { WaitlistManagementPanel } from './WaitlistManagementPanel';

/**
 * Main component that provides super admin neighborhood creation functionality
 * Renders the waitlist management panel where neighborhoods are created from waitlist responses
 */
export const SuperAdminNeighborhoodCreation: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Waitlist Management - Primary method for neighborhood creation */}
      <WaitlistManagementPanel />
    </div>
  );
};