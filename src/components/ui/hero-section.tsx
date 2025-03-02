
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";

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
  image: {
    src: string; // Image source URL
    alt: string; // Image alt text for accessibility
  };
}

/**
 * HeroSection - A full-width hero component for landing pages
 * 
 * This component creates an attractive hero section with title, description,
 * call-to-action buttons, and a featured image with visual effects.
 */
export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
}: HeroProps) {
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex max-w-container flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
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
          <div className="relative z-10 flex justify-center gap-4">
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
          </div>

          {/* Image with Glow - Featured image in a stylized mockup frame */}
          <div className="relative pt-12">
            <MockupFrame className="opacity-100" size="small">
              <Mockup type="responsive">
                <img
                  src={image.src}
                  alt={image.alt}
                  width={1248}
                  height={765}
                  className="w-full h-auto max-w-[800px]"
                />
              </Mockup>
            </MockupFrame>
            <Glow variant="top" className="opacity-70" />
          </div>
        </div>
      </div>
    </section>
  );
}
