
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Log the value to help debug
  console.log("[DEBUG] Progress component value:", value);
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      {/* 
        The most important part - this indicator needs to have the right width
        based on the value. Make sure the transform style is correctly applied.
       */}
      <ProgressPrimitive.Indicator
        className="h-full bg-primary transition-all duration-300"
        style={{ 
          // Set explicit width based on the value prop instead of using transform
          width: `${value || 0}%`,
        }}
        aria-label={`Progress: ${Math.round(value || 0)}%`}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
