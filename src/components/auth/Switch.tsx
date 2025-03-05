
import { ReactNode, useState, useEffect } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from "@/lib/utils";

/**
 * Switch Component
 * 
 * A toggle switch component that follows the WAI-ARIA design pattern.
 * This component is used in forms to toggle boolean values.
 */
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const Switch = ({
  checked,
  onCheckedChange,
  children,
  disabled = false,
  className,
  ...props
}: SwitchProps) => {
  // Local state to manage the checked state
  const [isChecked, setIsChecked] = useState(checked);
  
  // Update local state when the checked prop changes
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  
  // Handle change and call the onCheckedChange prop
  const handleCheckedChange = (newChecked: boolean) => {
    setIsChecked(newChecked);
    onCheckedChange(newChecked);
  };
  
  return (
    <div className="flex items-center">
      <SwitchPrimitive.Root
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary" : "bg-input",
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </SwitchPrimitive.Root>
      {children && <span className="ml-2">{children}</span>}
    </div>
  );
};

export default Switch;
