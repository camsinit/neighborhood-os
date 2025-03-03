
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// Define the props interface that extends the HTML button element properties
// and adds an optional asChild prop for composition with other components
interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean; // Allow this component to be used as a child of another component
}

export function RainbowButton({
  children,
  className,
  asChild = false, // Default to false - render as regular button
  ...props
}: RainbowButtonProps) {
  // Determine whether to render a button or a Slot (for composition)
  const Comp = asChild ? Slot : "button";
  
  return (
    <Comp
      className={cn(
        // Base styling for the button
        "group relative inline-flex h-11 min-w-[140px] animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-white transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",

        // Glowing effect below the button
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",

        // Button background - light mode (dark text on gradient background)
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Button background - dark mode (light text on gradient background)
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Any additional classes passed to the component
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
