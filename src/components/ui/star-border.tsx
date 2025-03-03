
import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

/**
 * Interface defining props for the StarBorder component
 * This defines a generic component that can render as different HTML elements
 */
interface StarBorderProps<T extends ElementType> {
  as?: T                    // The HTML element type to render (button, div, etc.)
  color?: string            // Optional custom color for the star border effect
  speed?: string            // Animation speed for the star movement
  className?: string        // Additional CSS classes
  children: React.ReactNode // Content inside the component
}

/**
 * StarBorder - A component that wraps content with an animated star pattern border
 * 
 * This creates a stylish container with moving star-like dots around the border
 * that gives content a magical, interactive appearance.
 */
export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  // Use the provided element type or default to button
  const Component = as || "button"
  // Use provided color or default to the theme's foreground color
  const defaultColor = color || "hsl(var(--foreground))"

  // Helper function to determine if the color is a gradient
  const isGradient = (color: string) => color.includes('gradient');

  return (
    <Component 
      className={cn(
        "relative inline-block py-[1px] overflow-hidden rounded-[20px]",
        className
      )} 
      {...props}
    >
      {/* Bottom border animation with star pattern */}
      <div
        className={cn(
          "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
          "opacity-20 dark:opacity-70" 
        )}
        style={{
          // Use background image for gradients, radial-gradient for solid colors
          background: isGradient(defaultColor) 
            ? defaultColor 
            : `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          backgroundSize: isGradient(defaultColor) ? "10px 10px" : "auto",
          animationDuration: speed,
        }}
      />
      {/* Top border animation with star pattern */}
      <div
        className={cn(
          "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
          "opacity-20 dark:opacity-70"
        )}
        style={{
          // Use background image for gradients, radial-gradient for solid colors
          background: isGradient(defaultColor) 
            ? defaultColor 
            : `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          backgroundSize: isGradient(defaultColor) ? "10px 10px" : "auto",
          animationDuration: speed,
        }}
      />
      {/* Main content container with glass-like styling and more rounded corners */}
      <div className={cn(
        "relative z-1 border text-foreground text-center text-base py-4 px-6 rounded-[30px]", // More rounded corners for oval shape
        "bg-gradient-to-b from-background/90 to-muted/90 border-border/40",
        "dark:from-background dark:to-muted dark:border-border"
      )}>
        {children}
      </div>
    </Component>
  )
}
