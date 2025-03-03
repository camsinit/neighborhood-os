
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/**
 * RainbowButton props interface
 * 
 * Extends HTMLButtonElement attributes to allow passing standard button props
 * such as onClick, disabled, etc.
 */
interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean; // Added asChild prop to support Link component
}

/**
 * RainbowButton component
 * 
 * A visually enhanced button with a rainbow gradient effect and glow.
 * Uses CSS variables for colors defined in index.css:
 * --color-1, --color-2, --color-3, --color-4, --color-5
 * 
 * @param children - The content to display inside the button
 * @param className - Additional CSS classes to apply
 * @param props - Standard button attributes like onClick, disabled, etc.
 */
export function RainbowButton({
  children,
  className,
  asChild = false, // Default to false for the asChild prop
  ...props
}: RainbowButtonProps) {
  // Use Slot component if asChild is true, otherwise use button
  const Comp = asChild ? Slot : "button";
  
  return (
    <Comp
      className={cn(
        // Base button styling with rainbow animation
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",

        // Before pseudo-element for the glow effect beneath the button
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",

        // Light mode color scheme
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Dark mode color scheme
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Merge any additional classes passed by the user
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
