
import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * A component that creates a device or browser mockup container
 * Used to showcase screenshots or UI examples within a frame
 */
const mockupVariants = cva(
  // Enhanced shadow properties with larger blur radius and spread
  // Removed overflow-hidden to prevent shadow clipping
  "flex relative z-10 border border-border/5 border-t-border/15",
  {
    variants: {
      type: {
        mobile: "rounded-[48px] max-w-[350px]", // Mobile phone style mockup
        responsive: "rounded-md", // Generic browser/desktop style mockup
      },
    },
    defaultVariants: {
      type: "responsive",
    },
  },
);

export interface MockupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mockupVariants> {}

/**
 * The Mockup component creates a container that resembles a device or browser window
 */
const Mockup = React.forwardRef<HTMLDivElement, MockupProps>(
  ({ className, type, ...props }, ref) => (
    <div
      ref={ref}
      // Added custom shadow classes for a softer, more spread out shadow
      className={cn(
        mockupVariants({ type, className }),
        "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]"
      )}
      {...props}
    />
  ),
);
Mockup.displayName = "Mockup";

/**
 * The outer frame that contains the mockup, providing background and padding
 */
const frameVariants = cva(
  // Removed overflow-hidden to allow shadow to extend naturally
  "bg-accent/5 flex relative z-10 rounded-2xl",
  {
    variants: {
      size: {
        small: "p-2", // Less padding for a smaller frame
        large: "p-4", // More padding for a larger frame
      },
    },
    defaultVariants: {
      size: "small",
    },
  },
);

export interface MockupFrameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof frameVariants> {}

const MockupFrame = React.forwardRef<HTMLDivElement, MockupFrameProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      // Added custom shadow class for the frame
      className={cn(
        frameVariants({ size, className }),
        "shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]"
      )}
      {...props}
    />
  ),
);
MockupFrame.displayName = "MockupFrame";

export { Mockup, MockupFrame };
