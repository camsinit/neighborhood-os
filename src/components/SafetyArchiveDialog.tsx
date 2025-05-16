

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArchivedSafetyUpdate {
  type: string;
  title: string;
  description: string;
  author: string;
  archivedDate: string;
  status: string;
}

interface SafetyArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SafetyArchiveDialog = ({ open, onOpenChange }: SafetyArchiveDialogProps) => {
  // This would typically come from your backend
  const archivedUpdates: ArchivedSafetyUpdate[] = [
    {
      type: "Alerts",
      title: "Power Outage Warning",
      description: "Scheduled power outage for maintenance work in the downtown area.",
      author: "City Utilities",
      archivedDate: "2024-03-15",
      status: "Resolved",
    },
    {
      type: "Maintenance",
      title: "Road Construction",
      description: "Main Street repairs and resurfacing project.",
      author: "Public Works",
      archivedDate: "2024-03-10",
      status: "Completed",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Safety Updates Archive</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {archivedUpdates.map((update, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{update.title}</h4>
                  <span className="text-sm text-muted-foreground">
                    Archived: {update.archivedDate}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    update.type === "Alerts" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {update.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Posted by: {update.author}
                    </span>
                    <span className="text-muted-foreground">
                      Status: {update.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SafetyArchiveDialog;

