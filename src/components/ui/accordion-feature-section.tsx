"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/**
 * Interface defining the structure of a feature item
 * Each feature has an id, title, image, and description
 */
interface FeatureItem {
  id: number;
  title: string;
  image: string;
  description: string;
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
  description: "Browse through our extensive collection of pre-built UI blocks designed with shadcn/ui. Each block is carefully crafted to be responsive, accessible, and easily customizable. Simply copy and paste the code into your project."
}, {
  id: 2,
  title: "Tailwind CSS & TypeScript",
  image: "/images/block/placeholder-2.svg",
  description: "Built with Tailwind CSS for rapid styling and TypeScript for type safety. Our blocks leverage the full power of Tailwind's utility classes while maintaining clean, type-safe code that integrates seamlessly with your Next.js projects."
}, {
  id: 3,
  title: "Dark Mode & Customization",
  image: "/images/block/placeholder-3.svg",
  description: "Every block supports dark mode out of the box and can be customized to match your brand. Modify colors, spacing, and typography using Tailwind's configuration. The shadcn/ui theming system makes it easy to maintain consistency across your site."
}, {
  id: 4,
  title: "Accessibility First",
  image: "/images/block/placeholder-4.svg",
  description: "All blocks are built with accessibility in mind, following WCAG guidelines. They include proper ARIA labels, keyboard navigation support, and semantic HTML structure. Ensure your website is usable by everyone without extra effort."
}, {
  id: 5,
  title: "Modern Development Stack",
  image: "/images/block/placeholder-5.svg",
  description: "Built for modern web development with React 18, Next.js 14, and the latest shadcn/ui components. Take advantage of React Server Components, TypeScript strict mode, and other cutting-edge features while maintaining excellent performance."
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