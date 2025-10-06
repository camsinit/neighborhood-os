import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

/**
 * MobileDesktopNotice
 *
 * Simple interstitial shown on mobile screens that encourages
 * users to revisit on desktop. Mirrors the MagicPath style
 * but uses our single "Return to homepage" action.
 */
export default function MobileDesktopNotice({ className }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "min-h-[70vh] w-full flex items-center justify-center px-4",
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
        "from-muted/60 via-background to-background",
        className
      )}
    >
      <Card className="w-full max-w-md rounded-3xl border-border/50 shadow-2xl bg-card/80 backdrop-blur">
        <CardContent className="pt-8 pb-8">
          {/* Logo circle */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center ring-1 ring-primary/20">
              <img
                src="/lovable-uploads/694d84e4-fb27-4204-bf99-e54cd1ecbfe9.png"
                alt="neighborhoodOS logo"
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>

          {/* Heading + description */}
          <div className="text-center mt-6 space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              neighborhoodOS is best experienced on desktop
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Revisit on desktop to explore neighborhoodOS. We’re optimizing for
              mobile surfaces soon. Thanks for your patience!
            </p>
          </div>

          {/* Primary action */}
          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate("/")} className="rounded-full px-6">
              Return to homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
