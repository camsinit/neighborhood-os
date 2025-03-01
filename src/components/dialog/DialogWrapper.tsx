
import UniversalDialog from "@/components/ui/universal-dialog";
import { ReactNode } from "react";

/**
 * DialogWrapper component
 * 
 * A standardized wrapper for dialogs throughout the application.
 * Uses the UniversalDialog component to ensure consistent styling and dimensions.
 * 
 * @param open - Boolean to control dialog visibility
 * @param onOpenChange - Function to handle dialog state changes
 * @param title - Dialog title
 * @param description - Dialog description (optional)
 * @param children - Dialog content
 * @param maxWidth - Maximum width for the dialog (default: "md")
 */
interface DialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const DialogWrapper = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children,
  maxWidth = "md" 
}: DialogWrapperProps) => {
  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      {children}
    </UniversalDialog>
  );
};

export default DialogWrapper;
