
import { Activity } from "@/utils/queries/useActivities";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getActivityDescription } from "./utils/activityHelpers";
import { AlertCircle } from "lucide-react";

interface ActivityDetailsSheetProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Component that displays detailed information about an activity in a slide-out sheet
 * Enhanced to handle deleted content gracefully
 */
const ActivityDetailsSheet = ({ activity, open, onOpenChange }: ActivityDetailsSheetProps) => {
  // Check if the activity has been deleted
  const isDeleted = activity?.metadata?.deleted === true;
  
  // Get the appropriate title based on deleted status
  const title = isDeleted
    ? `${activity?.metadata?.original_title || activity?.title} (Deleted)`
    : activity?.title;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className={isDeleted ? "text-gray-500" : ""}>
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {isDeleted ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="h-5 w-5" />
                <p>This content has been removed from the system.</p>
              </div>
              <p className="text-sm text-gray-400">
                The original content is no longer available as it has been deleted. You may still see this activity in your feed for reference.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {activity ? getActivityDescription(activity.activity_type) : "No additional details available."}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActivityDetailsSheet;
