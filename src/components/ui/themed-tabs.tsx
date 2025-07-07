import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { moduleThemeColors } from "@/theme/moduleTheme"

const ThemedTabs = TabsPrimitive.Root

interface ThemedTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  themeColor: keyof typeof moduleThemeColors;
}

/**
 * ThemedTabsList - A themed version of TabsList that applies module-specific colors
 * 
 * @param themeColor - The module theme color to apply (e.g., 'skills', 'calendar')
 * @param className - Additional CSS classes
 * @param props - Standard TabsList props
 */
const ThemedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  ThemedTabsListProps
>(({ className, themeColor, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
ThemedTabsList.displayName = TabsPrimitive.List.displayName

interface ThemedTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  themeColor: keyof typeof moduleThemeColors;
}

/**
 * ThemedTabsTrigger - A themed version of TabsTrigger with active state styling
 * 
 * @param themeColor - The module theme color to apply for active state
 * @param className - Additional CSS classes
 * @param props - Standard TabsTrigger props
 */
const ThemedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  ThemedTabsTriggerProps
>(({ className, themeColor, ...props }, ref) => {
  const themeConfig = moduleThemeColors[themeColor];
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm",
        className
      )}
      style={{
        '--active-bg': themeConfig.primary,
      } as React.CSSProperties}
      data-theme-color={themeColor}
      {...props}
    />
  )
})
ThemedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Add CSS-in-JS style injection for the active state
const styleElement = document.createElement('style');
styleElement.textContent = `
  [data-theme-color="calendar"][data-state="active"] { background-color: ${moduleThemeColors.calendar.primary} !important; }
  [data-theme-color="skills"][data-state="active"] { background-color: ${moduleThemeColors.skills.primary} !important; }
  [data-theme-color="goods"][data-state="active"] { background-color: ${moduleThemeColors.goods.primary} !important; }
  [data-theme-color="safety"][data-state="active"] { background-color: ${moduleThemeColors.safety.primary} !important; }
  [data-theme-color="neighbors"][data-state="active"] { background-color: ${moduleThemeColors.neighbors.primary} !important; }
`;
if (!document.querySelector('[data-themed-tabs-styles]')) {
  styleElement.setAttribute('data-themed-tabs-styles', 'true');
  document.head.appendChild(styleElement);
}

const ThemedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
ThemedTabsContent.displayName = TabsPrimitive.Content.displayName

export { ThemedTabs, ThemedTabsList, ThemedTabsTrigger, ThemedTabsContent }