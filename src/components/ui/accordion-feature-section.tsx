"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  description: "Browse through our extensive collection of pre-built UI blocks designed with shadcn/ui. Each block is carefully crafted to be responsive, accessible, and easily customizable. Simply copy and paste the code into your project.",
  replaces: [
    { name: "Partiful", logo: "/lovable-uploads/2e8ba0c4-f0ef-4f92-b41c-51a63bf67944.png", alt: "Partiful" },
    { name: "Luma", logo: "/lovable-uploads/f6ad984f-cbf9-4056-80e5-cdf5a44f816f.png", alt: "Luma" },
    { name: "Facebook", logo: "/lovable-uploads/150bc5c5-2da6-48a5-bdc0-fda9218a2a34.png", alt: "Facebook" }
  ]
}, {
  id: 2,
  title: "Tailwind CSS & TypeScript",
  image: "/images/block/placeholder-2.svg",
  description: "Built with Tailwind CSS for rapid styling and TypeScript for type safety. Our blocks leverage the full power of Tailwind's utility classes while maintaining clean, type-safe code that integrates seamlessly with your Next.js projects.",
  replaces: [
    { name: "OfferUp", logo: "/lovable-uploads/e1bc1776-d9c6-4c5c-9ea4-fbaf85b73d53.png", alt: "OfferUp" },
    { name: "Craigslist", logo: "/lovable-uploads/6ecb06fc-bfb0-4ac5-93af-0a52e4d1eb6b.png", alt: "Craigslist" },
    { name: "Marketplace", logo: "/lovable-uploads/150bc5c5-2da6-48a5-bdc0-fda9218a2a34.png", alt: "Marketplace" }
  ]
}, {
  id: 3,
  title: "Dark Mode & Customization",
  image: "/images/block/placeholder-3.svg",
  description: "Every block supports dark mode out of the box and can be customized to match your brand. Modify colors, spacing, and typography using Tailwind's configuration. The shadcn/ui theming system makes it easy to maintain consistency across your site.",
  replaces: [
    { name: "TaskRabbit", logo: "/lovable-uploads/2e8ba0c4-f0ef-4f92-b41c-51a63bf67944.png", alt: "TaskRabbit" },
    { name: "Thumbtack", logo: "/lovable-uploads/f6ad984f-cbf9-4056-80e5-cdf5a44f816f.png", alt: "Thumbtack" },
    { name: "Angie", logo: "/lovable-uploads/e1bc1776-d9c6-4c5c-9ea4-fbaf85b73d53.png", alt: "Angie" }
  ]
}, {
  id: 4,
  title: "Accessibility First",
  image: "/images/block/placeholder-4.svg",
  description: "All blocks are built with accessibility in mind, following WCAG guidelines. They include proper ARIA labels, keyboard navigation support, and semantic HTML structure. Ensure your website is usable by everyone without extra effort.",
  replaces: [
    { name: "Nextdoor", logo: "/lovable-uploads/6ecb06fc-bfb0-4ac5-93af-0a52e4d1eb6b.png", alt: "Nextdoor" },
    { name: "Ring", logo: "/lovable-uploads/150bc5c5-2da6-48a5-bdc0-fda9218a2a34.png", alt: "Ring" },
    { name: "Citizen", logo: "/lovable-uploads/f6ad984f-cbf9-4056-80e5-cdf5a44f816f.png", alt: "Citizen" }
  ]
}, {
  id: 5,
  title: "Modern Development Stack",
  image: "/images/block/placeholder-5.svg",
  description: "Built for modern web development with React 18, Next.js 14, and the latest shadcn/ui components. Take advantage of React Server Components, TypeScript strict mode, and other cutting-edge features while maintaining excellent performance.",
  replaces: [
    { name: "WhatsApp", logo: "/lovable-uploads/2e8ba0c4-f0ef-4f92-b41c-51a63bf67944.png", alt: "WhatsApp" },
    { name: "Telegram", logo: "/lovable-uploads/e1bc1776-d9c6-4c5c-9ea4-fbaf85b73d53.png", alt: "Telegram" },
    { name: "Discord", logo: "/lovable-uploads/6ecb06fc-bfb0-4ac5-93af-0a52e4d1eb6b.png", alt: "Discord" }
  ]
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

  // State to track which image should be displayed
  const [activeImage, setActiveImage] = useState(features[0].image);
  return <section className="py-[10px]">
      <div className="container mx-auto">
        <div className="mb-12 flex w-full items-start justify-between gap-12">
          {/* Left side: Accordion with feature titles and descriptions */}
          <div className="w-full md:w-1/2">
            <Accordion type="single" className="w-full" defaultValue="item-1">
              {features.map(tab => <AccordionItem key={tab.id} value={`item-${tab.id}`}>
                  <AccordionTrigger onClick={() => {
                // Update the active image and tab when clicked
                setActiveImage(tab.image);
                setActiveTabId(tab.id);
              }} className="cursor-pointer py-5 !no-underline transition">
                    <h6 className={`text-xl font-semibold ${tab.id === activeTabId ? "text-foreground" : "text-muted-foreground"}`}>
                      {tab.title}
                    </h6>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mt-3 text-muted-foreground">{tab.description}</p>
                    
                    {/* Replaces section with feature-specific logos */}
                    <div className="mt-4 flex items-start gap-4">
                      <span className="font-bold text-foreground">Replaces</span>
                      <div className="flex items-center gap-[50px]">
                        {tab.replaces.map((replacement, index) => (
                          <div key={index} className="flex flex-col items-center gap-1">
                            <img 
                              src={replacement.logo} 
                              alt={replacement.alt} 
                              className="w-[47px] h-[47px] rounded object-cover"
                            />
                            <span className="text-xs text-muted-foreground text-center">{replacement.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Show image on mobile devices below the description */}
                    <div className="mt-4 md:hidden">
                      <img src={tab.image} alt={tab.title} className="h-full max-h-80 w-full rounded-md object-cover" />
                    </div>
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
          
          {/* Right side: Feature image (hidden on mobile) */}
          <div className="relative m-auto hidden w-1/2 overflow-hidden rounded-xl bg-muted md:block">
            <img src={activeImage} alt="Feature preview" className="aspect-[4/3] rounded-md object-cover pl-4" />
          </div>
        </div>
      </div>
    </section>;
};
export { Feature197 };