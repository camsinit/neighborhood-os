import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Pointer, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Interface defining the content structure for each tab
 */
interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

/**
 * Interface defining the structure of each tab
 */
interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

/**
 * Props for the Feature108 component
 */
interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

/**
 * Feature108 Component
 * 
 * A tabbed feature section that showcases different aspects of the neighborhood platform.
 * Each tab displays content with an image, badge, title, description and call-to-action button.
 */
const Feature108 = ({
  badge = "neighborhoodOS",
  heading = "Build Stronger Communities Together",
  description = "Connect with neighbors, share resources, and create lasting relationships in your neighborhood.",
  tabs = [{
    value: "tab-1",
    icon: <Zap className="h-auto w-4 shrink-0" />,
    label: "Quick Actions",
    content: {
      badge: "Instant Connection",
      title: "Get help when you need it most.",
      description: "From borrowing tools to organizing events, our Quick Actions make it easy to connect with neighbors and get things done together.",
      buttonText: "Explore Features",
      imageSrc: "/lovable-uploads/ce6d7ca5-f300-40dd-95ff-fd2e261a3165.png",
      imageAlt: "Neighborhood dashboard showing Quick Actions interface"
    }
  }, {
    value: "tab-2",
    icon: <Pointer className="h-auto w-4 shrink-0" />,
    label: "Skills Exchange",
    content: {
      badge: "Community Skills",
      title: "Share what you know, learn something new.",
      description: "Connect with neighbors who have the skills you need, or offer your expertise to help others. Building community through knowledge sharing.",
      buttonText: "View Skills",
      imageSrc: "/lovable-uploads/ce6d7ca5-f300-40dd-95ff-fd2e261a3165.png",
      imageAlt: "Skills exchange interface showing neighbor skills and offers"
    }
  }, {
    value: "tab-3",
    icon: <Layout className="h-auto w-4 shrink-0" />,
    label: "Neighborhood Hub",
    content: {
      badge: "Community Center",
      title: "Your digital neighborhood headquarters.",
      description: "Events, safety updates, goods exchange, and community discussions all in one place. Stay connected and engaged with what matters most.",
      buttonText: "Join Community",
      imageSrc: "/lovable-uploads/ce6d7ca5-f300-40dd-95ff-fd2e261a3165.png",
      imageAlt: "Complete neighborhood dashboard showing all community features"
    }
  }]
}: Feature108Props) => {
  return <section className="py-0">
      <div className="container mx-auto">
        {/* Header section with badge, title, and description */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline">{badge}</Badge>
          <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl">
            {heading}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        {/* Tabs navigation and content */}
        <Tabs defaultValue={tabs[0].value} className="mt-8">
          {/* Tab navigation buttons */}
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10">
            {tabs.map(tab => <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary">
                {tab.icon} {tab.label}
              </TabsTrigger>)}
          </TabsList>
          
          {/* Tab content container */}
          <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl bg-muted/70 p-6 lg:p-16">
            {tabs.map(tab => <TabsContent key={tab.value} value={tab.value} className="grid place-items-center gap-20 lg:grid-cols-2 lg:gap-10">
                {/* Text content section */}
                <div className="flex flex-col gap-5">
                  <Badge variant="outline" className="w-fit bg-background">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-3xl font-semibold lg:text-5xl">
                    {tab.content.title}
                  </h3>
                  <p className="text-muted-foreground lg:text-lg">
                    {tab.content.description}
                  </p>
                  <Button className="mt-2.5 w-fit gap-2" size="lg">
                    {tab.content.buttonText}
                  </Button>
                </div>
                
                {/* Image section */}
                <img src={tab.content.imageSrc} alt={tab.content.imageAlt} className="rounded-xl" />
              </TabsContent>)}
          </div>
        </Tabs>
      </div>
    </section>;
};
export { Feature108 };