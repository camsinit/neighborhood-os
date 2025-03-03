
import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

/**
 * StarBorder component properties
 * 
 * This interface defines the props for creating a decorated border with
 * animated star-like particles moving along the edges
 */
interface StarBorderProps<T extends ElementType> {
  as?: T                // The HTML element to render (button by default)
  color?: string        // The color of the stars/particles
  speed?: string        // Animation duration/speed
  className?: string    // Additional CSS classes
  children: React.ReactNode  // Content within the border
}

/**
 * StarBorder component
 * 
 * Creates a decorative border with animated particles that move along
 * the top and bottom edges, creating a playful, engaging UI element
 */
export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  // Determine which HTML element to render (defaults to button)
  const Component = as || "button"
  
  // Use provided color or fall back to the foreground color from CSS variables
  const defaultColor = color || "hsl(var(--foreground))"
  
  // Rainbow gradient colors representing the 5 dashboard sections
  const rainbowGradient = "linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6)"

  return (
    <Component 
      className={cn(
        "relative inline-block py-[1px] overflow-hidden rounded-[30px]", // More oval shape with 30px border radius
        className
      )} 
      {...props}
    >
      {/* Bottom stars/particles animation */}
      <div
        className={cn(
          "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
          "opacity-20 dark:opacity-70" 
        )}
        style={{
          // Using rainbow gradient instead of single color
          background: `radial-gradient(circle, ${rainbowGradient}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      
      {/* Top stars/particles animation */}
      <div
        className={cn(
          "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
          "opacity-20 dark:opacity-70"
        )}
        style={{
          // Using rainbow gradient instead of single color
          background: `radial-gradient(circle, ${rainbowGradient}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      
      {/* Main content container */}
      <div className={cn(
        "relative z-1 border text-foreground text-center text-base py-4 px-6 rounded-[30px]", // More oval shape with 30px border radius
        "bg-gradient-to-b from-background/90 to-muted/90 border-border/40",
        "dark:from-background dark:to-muted dark:border-border"
      )}>
        {children}
      </div>
    </Component>
  )
}
