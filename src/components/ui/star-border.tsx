
import { cn } from "@/lib/utils";
import React from "react";
import { IconProps } from "lucide-react";

/**
 * Interface for the StarBorderIcon component props
 */
type StarBorderIconProps = IconProps & {
  className?: string;
};

/**
 * StarBorderIcon - A star-shaped icon for the border animation
 * 
 * This component renders a star SVG that will be used in the animated border
 */
const StarBorderIcon = ({ className, ...props }: StarBorderIconProps) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      {...props}
    >
      <path
        d="M5.40636 0.909819C5.66349 0.380132 6.33651 0.380131 6.59364 0.909819L7.88163 3.56439C7.98255 3.77045 8.17646 3.91343 8.40233 3.94713L11.3646 4.37659C11.9611 4.45599 12.1954 5.19201 11.7704 5.60311L9.66801 7.64445C9.504 7.80328 9.42941 8.02705 9.46956 8.24718L9.9742 11.1937C10.0663 11.7875 9.44082 12.2432 8.90838 11.958L6.24646 10.5439C6.04785 10.4372 5.81535 10.4372 5.61675 10.5439L2.95482 11.958C2.42238 12.2432 1.79688 11.7875 1.889 11.1937L2.39365 8.24718C2.43379 8.02705 2.3592 7.80328 2.19519 7.64445L0.0928115 5.60311C-0.332165 5.19201 -0.0978454 4.45599 0.498707 4.37659L3.46096 3.94713C3.68683 3.91343 3.88075 3.77045 3.98167 3.56439L5.26965 0.909819L5.40636 0.909819Z"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * Interface for the StarBorder component props
 */
interface StarBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  children: React.ReactNode;
}

/**
 * StarBorder Component
 * 
 * A component that wraps its children with an animated border of stars.
 * The stars move along the top and bottom edges, creating a dynamic border effect.
 * This is a purely decorative component that adds visual interest to UI elements.
 */
export const StarBorder = React.forwardRef<HTMLDivElement, StarBorderProps>(
  ({ as: Component = "div", className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "relative rounded-xl border border-primary/20 bg-white p-6",
          className
        )}
        {...props}
      >
        {/* Top border stars */}
        <div className="absolute -top-[6px] left-0 h-3 w-full overflow-hidden">
          <div className="flex items-center justify-between">
            {/* This creates a row of stars that moves from right to left */}
            <div className="flex animate-star-movement-top items-center gap-1 duration-[2000ms]">
              {/* Generate 12 stars for the top border */}
              {Array.from({ length: 12 }).map((_, i) => (
                <StarBorderIcon
                  key={`top-1-${i}`}
                  className={cn(
                    "text-primary",
                    i % 3 === 0 && "animate-pulse delay-100",
                    i % 3 === 1 && "animate-pulse delay-300",
                    i % 3 === 2 && "animate-pulse delay-700"
                  )}
                />
              ))}
            </div>
            
            {/* This creates a duplicate row for continuous animation */}
            <div className="flex animate-star-movement-top items-center gap-1 duration-[2500ms]">
              {/* Generate 12 more stars with slightly different animation timing */}
              {Array.from({ length: 12 }).map((_, i) => (
                <StarBorderIcon
                  key={`top-2-${i}`}
                  className={cn(
                    "text-primary",
                    i % 3 === 0 && "animate-pulse delay-300",
                    i % 3 === 1 && "animate-pulse delay-700",
                    i % 3 === 2 && "animate-pulse delay-1000"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom border stars */}
        <div className="absolute -bottom-[6px] left-0 h-3 w-full overflow-hidden">
          <div className="flex items-center justify-between">
            {/* Bottom row of stars moving from left to right */}
            <div className="flex animate-star-movement-bottom items-center gap-1 duration-[2000ms]">
              {/* Generate 12 stars for the bottom border */}
              {Array.from({ length: 12 }).map((_, i) => (
                <StarBorderIcon
                  key={`bottom-1-${i}`}
                  className={cn(
                    "text-primary",
                    i % 3 === 0 && "animate-pulse delay-100",
                    i % 3 === 1 && "animate-pulse delay-300",
                    i % 3 === 2 && "animate-pulse delay-700"
                  )}
                />
              ))}
            </div>
            
            {/* Duplicate bottom row for continuous animation */}
            <div className="flex animate-star-movement-bottom items-center gap-1 duration-[2500ms]">
              {/* Generate 12 more stars with slightly different animation timing */}
              {Array.from({ length: 12 }).map((_, i) => (
                <StarBorderIcon
                  key={`bottom-2-${i}`}
                  className={cn(
                    "text-primary",
                    i % 3 === 0 && "animate-pulse delay-300",
                    i % 3 === 1 && "animate-pulse delay-700",
                    i % 3 === 2 && "animate-pulse delay-1000"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* The actual content inside the star border */}
        {children}
      </Component>
    );
  }
);

StarBorder.displayName = "StarBorder";
