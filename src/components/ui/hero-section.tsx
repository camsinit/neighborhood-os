
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";
import React from "react";

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
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        // Reduced top padding to bring content closer to the header
        "py-4 sm:py-12 md:py-16 px-4", // Reduced from py-12/24/32 to py-4/12/16
        // Remove the overflow-hidden class to allow shadows to extend outside the container
        "pb-0"
      )}
    >
      {/* Added extra padding to ensure there's space for the shadow */}
      <div className="mx-auto flex max-w-container flex-col gap-8 pt-8 sm:gap-16 pb-24"> {/* Reduced gap from 12/24 to 8/16 and pt from 16 to 8 */}
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
            Image with Glow - Featured image in a stylized mockup frame 
            Added padding and margin to give more space for the shadow
            Removed any max-height constraints that might clip the shadow
          */}
          <div className="relative pt-8 w-full max-w-5xl mb-16"> {/* Reduced pt from 12 to 8 */}
            {/* Updated container to allow shadow to extend beyond boundaries */}
            <div className="relative px-8 pb-8">
              <MockupFrame className="opacity-100" size="large">
                <Mockup type="responsive">
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={1248}
                    height={765}
                    // Enhanced image styling to ensure proper scaling
                    className="w-full h-auto object-contain"
                  />
                </Mockup>
              </MockupFrame>
              {/* Increased opacity for more visible glow effect */}
              <Glow variant="top" className="opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
