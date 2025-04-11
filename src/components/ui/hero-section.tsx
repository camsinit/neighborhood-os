
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Mockup } from "@/components/ui/mockup"; // Keep Mockup, remove MockupFrame
import { cn } from "@/lib/utils";
import React from "react"; // Removed useEffect and useRef since we're removing the animations

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
  image
}: HeroProps) {
  // Removed the gradient refs and useEffect for mouse movement

  return <section className={cn("bg-background text-foreground",
  // Reduced top padding to bring content closer to the header
  "py-4 sm:py-12 md:py-16 px-4",
  // Reduced from py-12/24/32 to py-4/12/16
  // Remove the overflow-hidden class to allow shadows to extend outside the container
  "pb-0", "relative" // Keep relative positioning for the background gradient
  )}>
      {/* 
        Adding a more diffused, evenly spread rainbow gradient background 
        that covers the entire section with reduced opacity
       */}
      <div className="absolute inset-0 opacity-10 filter blur-[120px]" // Increased blur and reduced opacity
    style={{
      background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #ec4899, #06b6d4)",
      zIndex: 0
    }} />
      
      {/* Added extra padding to ensure there's space for the shadow */}
      <div className="mx-auto flex max-w-container flex-col gap-8 pt-8 sm:gap-16 pb-24 relative z-10 py-0"> {/* Kept z-10 to ensure content stays above gradient */}
        <div className="flex flex-col items-center gap-4 text-center sm:gap-8"> {/* Reduced gap from 6/12 to 4/8 */}
          {/* Badge - Optional promotional badge or tag */}
          {badge && <Badge variant="outline" className="gap-2 animate-pulse">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRight className="h-3 w-3" />
              </a>
            </Badge>}

          {/* Title - Main headline with gradient text effect */}
          <h1 className="relative z-10 inline-block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
            neighborhoodOS
          </h1>

          {/* Description - Supporting text that explains the value proposition */}
          <p className="text-md relative z-10 max-w-[550px] font-medium text-muted-foreground sm:text-xl">The open-source Nextdoor replacement to create a more caring neighborhood</p>

          {/* Actions - Call-to-action buttons */}
          {actions.length > 0 && <div className="relative z-10 flex justify-center gap-4">
              {actions.map((action, index) => <Button key={index} variant={action.variant || "default"} size="lg" asChild>
                  <a href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </a>
                </Button>)}
            </div>}

          {/* Waitlist Form - Alternative to action buttons */}
          {/* Modified to not restrict width and let the component control its own width */}
          {waitlistForm && <div className="relative z-10 w-full flex justify-center">
              {waitlistForm}
            </div>}

          {/* 
            Image with Rainbow Gradient - Featured image with rounded corners and drop shadow
            The MockupFrame is removed but we keep the Mockup wrapper
            Added rounded corners and drop shadow to make the image pop
           */}
          <div className="relative pt-8 w-full max-w-3xl mb-16"> {/* Changed max-w-5xl to max-w-3xl for 75% smaller width */}
            {/* Updated container to allow shadow to extend beyond boundaries */}
            <div className="relative px-8 pb-8">
              {/* Rainbow gradient effect behind the image - made more diffused */}
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40" // Increased blur and reduced opacity
            style={{
              background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #ec4899, #06b6d4)",
              transform: "scale(1.05)",
              // Slightly larger than the image
              zIndex: 0
            }} />
              
              {/* Mockup Component that contains the image */}
              <Mockup type="responsive">
                {/* Added rounded-2xl for curved corners and drop-shadow-xl for the pop effect */}
                {/* Added max-w-[75%] and mx-auto to make the image 75% of its container size and center it */}
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  width={1248} 
                  height={765} 
                  className="w-[75%] h-auto mx-auto object-contain rounded-2xl drop-shadow-xl relative z-10" 
                  // Changed from w-full to w-[75%] and added mx-auto to center the smaller image
                />
              </Mockup>
            </div>
          </div>
        </div>
      </div>
    </section>;
}
