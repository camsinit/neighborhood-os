
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
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
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
  // Map maxWidth prop to Tailwind classes
  const maxWidthClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${maxWidthClasses[maxWidth]} max-h-[85vh] overflow-y-auto bg-white p-6 rounded-lg shadow-lg`}
      >
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
