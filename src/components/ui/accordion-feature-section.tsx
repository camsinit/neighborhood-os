"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ReplacementLogo } from "@/components/ui/replacement-logo";

/**
 * Interface defining the structure of a feature item
 * Each feature has an id, title, image, description, and replaces array
 */
interface FeatureItem {
  id: number;
  title: string;
  image: string;
  description: string;
  replaces: {
    name: string;
    logo: string;
    alt: string;
  }[];
}

/**
 * Props for the Feature197 component
 */
interface Feature197Props {
  features: FeatureItem[];
}

/**
 * Default features data - can be overridden by passing custom features
 */
const defaultFeatures: FeatureItem[] = [{
  id: 1,
  title: "Ready-to-Use UI Blocks",
  image: "/images/block/placeholder-1.svg",
  description: "Most neighborhood gatherings are low-key, low-effort, and just need a simple place for RSVP's and reminders. That's exactly what our no-frills Calendar page is designed to do.",
  replaces: [{
    name: "partiful.com",
    logo: "https://img.logo.dev/partiful.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Partiful"
  }, {
    name: "lumalabs.ai",
    logo: "https://img.logo.dev/lumalabs.ai?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Luma"
  }, {
    name: "facebook.com",
    logo: "https://img.logo.dev/facebook.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Facebook"
  }]
}, {
  id: 2,
  title: "Tailwind CSS & TypeScript",
  image: "/images/block/placeholder-2.svg",
  description: "Built with Tailwind CSS for rapid styling and TypeScript for type safety. Our blocks leverage the full power of Tailwind's utility classes while maintaining clean, type-safe code that integrates seamlessly with your Next.js projects.",
  replaces: [{
    name: "offerup.com",
    logo: "https://img.logo.dev/offerup.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "OfferUp"
  }, {
    name: "craigslist.org",
    logo: "https://img.logo.dev/craigslist.org?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Craigslist"
  }, {
    name: "facebook.com/marketplace",
    logo: "https://img.logo.dev/facebook.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Marketplace"
  }]
}, {
  id: 3,
  title: "Dark Mode & Customization",
  image: "/images/block/placeholder-3.svg",
  description: "Every block supports dark mode out of the box and can be customized to match your brand. Modify colors, spacing, and typography using Tailwind's configuration. The shadcn/ui theming system makes it easy to maintain consistency across your site.",
  replaces: [{
    name: "taskrabbit.com",
    logo: "https://img.logo.dev/taskrabbit.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "TaskRabbit"
  }, {
    name: "thumbtack.com",
    logo: "https://img.logo.dev/thumbtack.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Thumbtack"
  }, {
    name: "angi.com",
    logo: "https://img.logo.dev/angi.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Angie"
  }]
}, {
  id: 4,
  title: "Accessibility First",
  image: "/images/block/placeholder-4.svg",
  description: "All blocks are built with accessibility in mind, following WCAG guidelines. They include proper ARIA labels, keyboard navigation support, and semantic HTML structure. Ensure your website is usable by everyone without extra effort.",
  replaces: [{
    name: "nextdoor.com",
    logo: "https://img.logo.dev/nextdoor.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Nextdoor"
  }, {
    name: "ring.com",
    logo: "https://img.logo.dev/ring.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Ring"
  }, {
    name: "citizen.com",
    logo: "https://img.logo.dev/citizen.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Citizen"
  }]
}, {
  id: 5,
  title: "Modern Development Stack",
  image: "/images/block/placeholder-5.svg",
  description: "Built for modern web development with React 18, Next.js 14, and the latest shadcn/ui components. Take advantage of React Server Components, TypeScript strict mode, and other cutting-edge features while maintaining excellent performance.",
  replaces: [{
    name: "whatsapp.com",
    logo: "https://img.logo.dev/whatsapp.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "WhatsApp"
  }, {
    name: "telegram.org",
    logo: "https://img.logo.dev/telegram.org?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Telegram"
  }, {
    name: "discord.com",
    logo: "https://img.logo.dev/discord.com?token=pk_SdwwezRcTT6rDwqgpowtPg",
    alt: "Discord"
  }]
}];

/**
 * Feature197 - An accordion-based feature section component
 * 
 * This component displays features in an interactive accordion layout
 * with images that change based on the selected feature. Perfect for
 * showcasing multiple features in an engaging, space-efficient way.
 */
const Feature197 = ({
  features = defaultFeatures
}: Feature197Props) => {
  // State to track which accordion item is currently active
  const [activeTabId, setActiveTabId] = useState<number | null>(1);
  
  // Color mapping for each section to match their respective page theme
  const getColorClass = (tabId: number, isActive: boolean) => {
    const baseClasses = "transition-colors duration-200";
    switch (tabId) {
      case 1:
        return isActive ? `text-blue-600 ${baseClasses}` : `text-muted-foreground hover:text-blue-600 ${baseClasses}`;
      case 2:
        return isActive ? `text-orange-600 ${baseClasses}` : `text-muted-foreground hover:text-orange-600 ${baseClasses}`;
      case 3:
        return isActive ? `text-green-600 ${baseClasses}` : `text-muted-foreground hover:text-green-600 ${baseClasses}`;
      case 4:
        return isActive ? `text-red-600 ${baseClasses}` : `text-muted-foreground hover:text-red-600 ${baseClasses}`;
      case 5:
        return isActive ? `text-purple-600 ${baseClasses}` : `text-muted-foreground hover:text-purple-600 ${baseClasses}`;
      default:
        return `text-foreground ${baseClasses}`;
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-8">
        {/* Centered accordion taking up more space */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" className="w-full space-y-6" defaultValue="item-1">
            {features.map(tab => (
              <AccordionItem key={tab.id} value={`item-${tab.id}`} className="border rounded-lg p-6">
                <AccordionTrigger 
                  onClick={() => setActiveTabId(tab.id)} 
                  className="cursor-pointer py-6 !no-underline transition hover:no-underline"
                >
                  <h3 className={`text-2xl font-bold text-left ${getColorClass(tab.id, tab.id === activeTabId)}`}>
                    {tab.title}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="pt-6">
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {tab.description}
                  </p>
                  
                  {/* Replaces section with universally formatted logos */}
                  <div className="flex items-start gap-6">
                    <span className="font-bold text-foreground text-lg min-w-fit">Replaces</span>
                    <div className="flex items-center gap-8 flex-wrap flex-1">
                      {tab.replaces.map((replacement, index) => (
                        <ReplacementLogo 
                          key={index} 
                          logo={replacement.logo} 
                          name={replacement.name} 
                          alt={replacement.alt} 
                        />
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export { Feature197 };
