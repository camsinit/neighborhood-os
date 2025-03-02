
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmptyState from "@/components/ui/empty-state";
import { Users, UserPlus } from "lucide-react";

/**
 * NoNeighborhoodState Component
 * 
 * This component is shown when the user is not part of any neighborhood.
 * It provides guidance on what to do next.
 */
export const NoNeighborhoodState = () => {
  return (
    <div className="p-6">
      <Alert className="mb-4">
        <Users className="h-5 w-5 mr-2" />
        <AlertDescription>
          You're not part of any neighborhood yet. Join or create a neighborhood to see residents.
        </AlertDescription>
      </Alert>
      <EmptyState
        icon={UserPlus}
        title="Join a Neighborhood"
        description="You need to join or create a neighborhood to connect with neighbors."
        actionLabel="Create Neighborhood"
        onAction={() => console.log("Create neighborhood clicked")}
      />
    </div>
  );
};
