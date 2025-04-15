
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * UniversalDialog component
 * 
 * Updated to increase default width by 100px
 */
interface UniversalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const UniversalDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: UniversalDialogProps) => {
  // Updated width classes to be 100px wider
  const maxWidthClass = {
    xs: "max-w-xs+100",
    sm: "max-w-sm+100",
    md: "max-w-md+100",
    lg: "max-w-lg+100",
    xl: "max-w-xl+100",
    "2xl": "max-w-2xl+100",
    "full": "max-w-full",
  }[maxWidth];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Add additional wrapper to ensure max width is respected */}
      <DialogContent className={`${maxWidthClass} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        <div className="mt-2">{children}</div>
        
        {footer && <DialogFooter className="mt-6">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default UniversalDialog;
