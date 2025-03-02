
import React from "react";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

/**
 * This component creates a glowing visual effect that can be positioned in different areas
 * It adds a subtle animated gradient background to enhance UI elements
 */
const glowVariants = cva("absolute w-full", {
  variants: {
    variant: {
      top: "top-0", // Position the glow at the top
      above: "-top-[128px]", // Position above the container
      bottom: "bottom-0", // Position at the bottom
      below: "-bottom-[128px]", // Position below the container
      center: "top-[50%]", // Position in the center
    },
  },
  defaultVariants: {
    variant: "top",
  },
});

const Glow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof glowVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(glowVariants({ variant }), className)}
    {...props}
  >
    {/* First glow element - creates a larger, more subtle effect */}
    <div
      className={cn(
        "absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--primary)/.5)_10%,_hsla(var(--primary)/0)_60%)] sm:h-[512px]",
        variant === "center" && "-translate-y-1/2",
      )}
    />
    {/* Second glow element - creates a smaller, more focused effect */}
    <div
      className={cn(
        "absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--primary)/.3)_10%,_hsla(var(--primary-foreground)/0)_60%)] sm:h-[256px]",
        variant === "center" && "-translate-y-1/2",
      )}
    />
  </div>
));
Glow.displayName = "Glow";

export { Glow };
