
import { Activity } from "@/utils/queries/useActivities";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getActivityDescription } from "./utils/activityHelpers";

interface ActivityDetailsSheetProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ActivityDetailsSheet = ({ activity, open, onOpenChange }: ActivityDetailsSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {activity?.title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            {activity ? getActivityDescription(activity.metadata) : "No additional details available."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActivityDetailsSheet;
