
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Mockup } from "@/components/ui/mockup"; // Keep Mockup, remove MockupFrame
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react"; // Added useEffect and useRef for animations

/**
 * Interface defining the structure of a call-to-action button
 */
interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "link";
}

/**
 * Props for the HeroSection component
 */
interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string; // The main headline
  description: string; // Subheading or description text
  actions: HeroAction[]; // Array of call-to-action buttons
  waitlistForm?: React.ReactNode; // Optional waitlist form component
  image: {
    src: string; // Image source URL
    alt: string; // Image alt text for accessibility
  };
}

/**
 * HeroSection - A full-width hero component for landing pages
 * 
 * This component creates an attractive hero section with title, description,
 * call-to-action buttons or waitlist form, and a featured image with visual effects.
 */
export function HeroSection({
  badge,
  title,
  description,
  actions,
  waitlistForm,
  image,
}: HeroProps) {
  // References to the animated gradient elements
  const gradient1Ref = useRef<HTMLDivElement>(null);
  const gradient2Ref = useRef<HTMLDivElement>(null);

  // Effect to animate the gradients with mouse movement
  useEffect(() => {
    // Function to move gradients based on mouse position
    const moveGradients = (e: MouseEvent) => {
      // Get window dimensions for relative positioning
      const { innerWidth, innerHeight } = window;
      
      // Calculate position as percentage of window (inverted for parallax effect)
      const moveX1 = (innerWidth - e.clientX * 1.5) / 100;
      const moveY1 = (innerHeight - e.clientY * 1.5) / 100;
      
      // Second gradient moves in opposite direction for dynamic effect
      const moveX2 = (e.clientX * 1.5) / 100;
      const moveY2 = (e.clientY * 1.5) / 100;

      // Apply transforms to the gradient elements if they exist
      if (gradient1Ref.current) {
        gradient1Ref.current.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
      }
      
      if (gradient2Ref.current) {
        gradient2Ref.current.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
      }
    };

    // Add mouse move event listener
    window.addEventListener('mousemove', moveGradients);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('mousemove', moveGradients);
    };
  }, []);

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        // Reduced top padding to bring content closer to the header
        "py-4 sm:py-12 md:py-16 px-4", // Reduced from py-12/24/32 to py-4/12/16
        // Remove the overflow-hidden class to allow shadows to extend outside the container
        "pb-0",
        "relative" // Added relative positioning for absolute positioned gradients
      )}
    >
      {/* First animated gradient blob - positioned on the left */}
      <div 
        ref={gradient1Ref}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 filter blur-[80px] transition-transform duration-300"
        style={{
          background: "linear-gradient(45deg, #3b82f6, #8b5cf6, #d946ef)",
          transform: "translate(0, 0)"
        }}
      />
      
      {/* Second animated gradient blob - positioned on the right */}
      <div 
        ref={gradient2Ref}
        className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full opacity-20 filter blur-[80px] transition-transform duration-300"
        style={{
          background: "linear-gradient(45deg, #f59e0b, #ef4444, #ec4899)",
          transform: "translate(0, 0)"
        }}
      />
      
      {/* Added extra padding to ensure there's space for the shadow */}
      <div className="mx-auto flex max-w-container flex-col gap-8 pt-8 sm:gap-16 pb-24 relative z-10"> {/* Added z-10 to keep content above gradient blobs */}
        <div className="flex flex-col items-center gap-4 text-center sm:gap-8"> {/* Reduced gap from 6/12 to 4/8 */}
          {/* Badge - Optional promotional badge or tag */}
          {badge && (
            <Badge variant="outline" className="gap-2 animate-pulse">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRight className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Title - Main headline with gradient text effect */}
          <h1 className="relative z-10 inline-block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
            {title}
          </h1>

          {/* Description - Supporting text that explains the value proposition */}
          <p className="text-md relative z-10 max-w-[550px] font-medium text-muted-foreground sm:text-xl">
            {description}
          </p>

          {/* Actions - Call-to-action buttons */}
          {actions.length > 0 && (
            <div className="relative z-10 flex justify-center gap-4">
              {actions.map((action, index) => (
                <Button key={index} variant={action.variant || "default"} size="lg" asChild>
                  <a href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </a>
                </Button>
              ))}
            </div>
          )}

          {/* Waitlist Form - Alternative to action buttons */}
          {waitlistForm && (
            <div className="relative z-10 flex justify-center w-full max-w-md">
              {waitlistForm}
            </div>
          )}

          {/* 
            Image with Rainbow Gradient - Featured image with rounded corners and drop shadow
            The MockupFrame is removed but we keep the Mockup wrapper
            Added rounded corners and drop shadow to make the image pop
          */}
          <div className="relative pt-8 w-full max-w-5xl mb-16"> {/* Reduced pt from 12 to 8 */}
            {/* Updated container to allow shadow to extend beyond boundaries */}
            <div className="relative px-8 pb-8">
              {/* Rainbow gradient effect behind the image */}
              <div className="absolute inset-0 rounded-3xl blur-xl opacity-60"
                style={{
                  background: "linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6)",
                  transform: "scale(1.05)", // Slightly larger than the image
                  zIndex: 0
                }}
              />
              
              {/* Mockup Component that contains the image */}
              <Mockup type="responsive">
                {/* Added rounded-2xl for curved corners and drop-shadow-xl for the pop effect */}
                <img
                  src={image.src}
                  alt={image.alt}
                  width={1248}
                  height={765}
                  className="w-full h-auto object-contain rounded-2xl drop-shadow-xl relative z-10" // Added z-10 to stay above gradient
                />
              </Mockup>
              
              {/* Remove the original glow effect since we're using the rainbow gradient */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
