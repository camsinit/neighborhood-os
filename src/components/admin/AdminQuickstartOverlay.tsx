import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle2, Settings, Users, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useIsNeighborhoodAdmin } from '@/hooks/useIsNeighborhoodAdmin';
import { Link, useNavigate } from 'react-router-dom';

/**
 * AdminQuickstartOverlay
 * 
 * A small, dismissible overlay that appears right after an admin accepts their invite.
 * We use a localStorage flag set during the join flow to trigger it once.
 * 
 * Why an overlay? Admins (instigators) often need a tiny nudge on the first visit:
 * - Invite a few neighbors
 * - Share a first update/event
 * - Review basic settings
 * 
 * This component reads a one-time flag from localStorage and only shows
 * when the current user is indeed an admin of the current neighborhood.
 */
const AdminQuickstartOverlay: React.FC = () => {
  // Read the current neighborhood context so we can deep link buttons
  const { currentNeighborhood } = useNeighborhood();
  const navigate = useNavigate();

  // Verify the user is an admin for the currently selected neighborhood
  const { isAdmin } = useIsNeighborhoodAdmin();

  // Local UI state controlling visibility
  const [open, setOpen] = useState(false);

  // Resolve the neighborhoodId that should show the overlay (stored at join time)
  const storedNeighborhoodId = useMemo(
    () => localStorage.getItem('adminQuickstartNeighborhoodId') || null,
    []
  );

  useEffect(() => {
    // 1) Only show if the localStorage flag is set
    const shouldShow = localStorage.getItem('showAdminQuickstart') === 'true';

    // 2) Only show in the intended neighborhood to avoid confusion if the admin switches context
    const isRightNeighborhood = !!currentNeighborhood && !!storedNeighborhoodId
      ? currentNeighborhood.id === storedNeighborhoodId
      : true; // If no stored neighborhood, default to showing once

    // 3) Only show to admins (defensive check even though we set the flag only on admin invites)
    if (shouldShow && isAdmin && isRightNeighborhood) {
      setOpen(true);
    }
  }, [currentNeighborhood, isAdmin, storedNeighborhoodId]);

  // Handler to dismiss forever (or until next admin invite)
  const handleDismiss = () => {
    setOpen(false);
    // Clear the one-time flag so it doesn't reappear on next page load
    localStorage.removeItem('showAdminQuickstart');
    localStorage.removeItem('adminQuickstartNeighborhoodId');
  };

  // If not open, render nothing to keep DOM clean
  if (!open) return null;

  // Safe guards for deep links
  const neighborhoodId = currentNeighborhood?.id;

  return (
    // Fixed overlay box in bottom-right; accessible and minimal
    <div
      className="fixed bottom-4 right-4 z-[60] w-[360px] rounded-lg border bg-background shadow-lg"
      role="dialog"
      aria-labelledby="admin-quickstart-title"
    >
      <div className="p-4">
        {/* Header row with title and dismiss button */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="admin-quickstart-title" className="text-base font-semibold">Admin Quickstart</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              A few suggested steps to get your neighborhood rolling.
            </p>
          </div>
          <button
            aria-label="Dismiss admin quickstart"
            className="p-1 rounded-md hover:bg-muted"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Checklist-style suggestions with icons to clarify each action */}
        <ul className="mt-4 space-y-3">
          <li className="flex items-start gap-3">
            <Users className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium">Invite your first neighbors</p>
              <p className="text-xs text-muted-foreground">Send a few invites to kickstart the conversation.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium">Post your first update or event</p>
              <p className="text-xs text-muted-foreground">Break the ice with a welcome post or a simple meetup.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Settings className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium">Review basic neighborhood settings</p>
              <p className="text-xs text-muted-foreground">Confirm name, image, and time zone look right.</p>
            </div>
          </li>
        </ul>

        {/* Action buttons. We use navigate to ensure consistent router behavior. */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              // Prefer a clear admin entry point if available
              if (neighborhoodId) {
                navigate(`/n/${neighborhoodId}/admin`);
              } else {
                handleDismiss();
              }
            }}
          >
            Open Admin Tools
          </Button>
          <Button variant="outline" onClick={handleDismiss}>Dismiss</Button>
        </div>

        {/* A subtle confirmation to indicate it's only shown once */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Shown once after you accept your admin invite.</span>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickstartOverlay;
