
// Import necessary components from Radix UI
import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

import { cn } from "@/lib/utils"

// Create the base Collapsible component
const Collapsible = CollapsiblePrimitive.Root

// Create the Collapsible trigger component
const CollapsibleTrigger = CollapsiblePrimitive.Trigger

// Create the Collapsible content component with forwarded ref
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      className
    )}
    {...props}
  >
    <div className="p-0">{children}</div>
  </CollapsiblePrimitive.Content>
))
CollapsibleContent.displayName = "CollapsibleContent"

// Export the components
export { Collapsible, CollapsibleTrigger, CollapsibleContent }
