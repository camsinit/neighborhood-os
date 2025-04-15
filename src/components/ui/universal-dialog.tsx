
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
 * This is a standardized dialog component that ensures consistent styling and dimensions
 * for all pop-overs throughout the application. It wraps the shadcn Dialog component
 * with additional constraints and styling.
 * 
 * @param open - Boolean to control dialog visibility
 * @param onOpenChange - Function to handle dialog state changes
 * @param title - Dialog title (optional)
 * @param description - Dialog description (optional)
 * @param children - Dialog content
 * @param footer - Dialog footer content (optional)
 * @param maxWidth - Maximum width for the dialog (default: "md")
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
  // Map the maxWidth prop to a Tailwind class
  const maxWidthClass = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
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
