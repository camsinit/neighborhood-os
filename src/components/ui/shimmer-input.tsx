
import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  rainbowEffect?: boolean;
}

const ShimmerInput = React.forwardRef<HTMLInputElement, ShimmerInputProps>(
  (
    {
      shimmerColor = "#f0f0f0",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "30px",
      background = "#ffffff",
      className,
      rainbowEffect = false,
      ...props
    },
    ref,
  ) => {
    // Create rainbow gradient for the shimmer effect
    const rainbowGradient = "conic-gradient(from_calc(270deg-(var(--spread)*0.5)), #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)";
    const regularGradient = `conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))`;

    return (
      <div
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 overflow-hidden [background:var(--bg)] [border-radius:var(--radius)]",
          "border border-input shadow-sm",
          className,
        )}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[1px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before - with rainbow effect */}
            <div 
              className={cn(
                "animate-spin-around absolute -inset-full w-auto rotate-0 [translate:0_0]",
                rainbowEffect && "animate-rainbow-shimmer"
              )}
              style={{
                background: rainbowEffect ? rainbowGradient : regularGradient
              }}
            />
          </div>
        </div>

        {/* input field */}
        <input
          ref={ref}
          className={cn(
            "relative z-10 w-full bg-transparent px-3 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[border-radius:var(--radius)]"
          )}
          {...props}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </div>
    );
  },
);

ShimmerInput.displayName = "ShimmerInput";

export { ShimmerInput };
