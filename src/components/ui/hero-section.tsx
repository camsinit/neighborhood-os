
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Mockup } from "@/components/ui/mockup";
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
  image
}: HeroProps) {
  // Using properly defined classes - max-w-7xl instead of max-w-container
  return (
    <section className={cn(
      "bg-background text-foreground relative",
      "py-4 sm:py-12 md:py-16 px-4",
      "pb-0"
    )}>
      {/* Background gradient with animation */}
      <div 
        className="absolute inset-0 opacity-10 filter blur-[120px]" 
        style={{
          background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #ec4899, #06b6d4)",
          zIndex: 0
        }} 
      />
      
      {/* Main content container with proper max-width */}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 pt-8 sm:gap-16 pb-24 relative z-10 py-0">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-8">
          {/* Badge with animation */}
          {badge && (
            <Badge variant="outline" className="gap-2 animate-pulse">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRight className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Title with animation */}
          <h1 className={cn(
            "relative z-10 inline-block",
            "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text",
            "text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl",
            "sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight",
            "animate-appear delay-300"
          )}>
            {title}
          </h1>

          {/* Description with animation */}
          <p className={cn(
            "text-md relative z-10 max-w-[550px] font-medium text-muted-foreground sm:text-xl",
            "animate-appear delay-500"
          )}>
            {description}
          </p>

          {/* Action buttons with animation */}
          {actions.length > 0 && (
            <div className={cn(
              "relative z-10 flex justify-center gap-4",
              "animate-appear delay-700"
            )}>
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

          {/* Waitlist form with animation */}
          {waitlistForm && (
            <div className={cn(
              "relative z-10 w-full flex justify-center",
              "animate-appear delay-700"
            )}>
              {waitlistForm}
            </div>
          )}

          {/* Image mockup with animation */}
          <div className={cn(
            "relative pt-8 w-full max-w-3xl mb-16",
            "animate-appear-zoom delay-1000"
          )}>
            <div className="relative px-8 pb-8">
              {/* Background glow effect */}
              <div 
                className="absolute inset-0 rounded-3xl blur-2xl opacity-40" 
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #ec4899, #06b6d4)",
                  transform: "scale(1.05)",
                  zIndex: 0
                }} 
              />
              
              {/* Using the Mockup component with proper styling */}
              <Mockup type="responsive">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  width={1248} 
                  height={765} 
                  className="w-full h-auto object-contain rounded-2xl drop-shadow-xl relative z-10" 
                />
              </Mockup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
