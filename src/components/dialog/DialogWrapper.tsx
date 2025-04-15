import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

/**
 * DialogWrapper - A reusable dialog component that provides consistent styling and behavior
 * 
 * This component wraps the shadcn Dialog components to provide:
 * - Consistent header styling
 * - Optional description text
 * - Configurable max width
 * - Standard open/close behavior
 */
const DialogWrapper = ({
  children,
  title,
  description = "This dialog contains interactive content.",
  open,
  onOpenChange,
  maxWidth = "md",
}: DialogWrapperProps) => {
  // Map the maxWidth prop to a Tailwind class
  const maxWidthClass = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-xl",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "full": "max-w-full",
  }[maxWidth];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Add additional wrapper to ensure max width is respected */}
      <DialogContent className={`${maxWidthClass} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {/* We're removing the DialogDescription component here */}
        </DialogHeader>
        <div className="mt-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;
