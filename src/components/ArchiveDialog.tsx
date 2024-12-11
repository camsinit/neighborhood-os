import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArchivedItem {
  type: string;
  title: string;
  description: string;
  helper?: string;
  validUntil: string;
  archived: string;
}

interface ArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: string;  // Added this line to fix the TypeScript error
}

const ArchiveDialog = ({ open, onOpenChange, type }: ArchiveDialogProps) => {
  // This would typically come from your backend
  const archivedItems: ArchivedItem[] = [
    {
      type: "Need",
      title: "Moving Help",
      description: "Need help moving furniture",
      helper: "Jane Smith",
      validUntil: "2024-04-15",
      archived: "Fulfilled",
    },
    {
      type: "Offer",
      title: "Garden Tools",
      description: "Offering garden tools for weekend use",
      validUntil: "2024-04-10",
      archived: "Expired",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Archive</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {archivedItems.map((item, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{item.title}</h4>
                  <span className="text-sm text-muted-foreground">
                    Valid until: {item.validUntil}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    item.type === "Need" ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {item.type}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.helper && (
                      <span className="text-muted-foreground">
                        Helped by: {item.helper}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      Status: {item.archived}
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

export default ArchiveDialog;