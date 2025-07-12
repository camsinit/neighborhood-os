"use client";

import { useState, useRef, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ReplacementLogo } from "@/components/ui/replacement-logo";
import { RotateCcw } from "lucide-react";

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
    url?: string;
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

  // State to track which image should be displayed
  const [activeImage, setActiveImage] = useState(features[0].image);
  
  // Video state management
  const [showReplayButton, setShowReplayButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Video mapping for each section - each has its own unique video file
  const videoMapping = {
    1: "/videos/Events.mp4", // Gatherings/Events
    2: "/videos/Freebies.mp4", // Freebies
    3: "/videos/Skills.mp4", // Skills
    4: "/videos/Updates.mp4", // Updates/Safety
    5: "/videos/Directory.mp4", // Directory
  };

  // Color mapping for each section to match their respective page theme
  const getColorClass = (tabId: number, isActive: boolean) => {
    const baseClasses = "transition-colors duration-200";
    switch (tabId) {
      case 1: return isActive ? `text-blue-600 ${baseClasses}` : `text-muted-foreground hover:text-blue-600 ${baseClasses}`; // Gatherings - blue theme
      case 2: return isActive ? `text-orange-600 ${baseClasses}` : `text-muted-foreground hover:text-orange-600 ${baseClasses}`; // Freebies - orange theme
      case 3: return isActive ? `text-green-600 ${baseClasses}` : `text-muted-foreground hover:text-green-600 ${baseClasses}`; // Skills - green theme
      case 4: return isActive ? `text-red-600 ${baseClasses}` : `text-muted-foreground hover:text-red-600 ${baseClasses}`; // Updates/Safety - red theme
      case 5: return isActive ? `text-purple-600 ${baseClasses}` : `text-muted-foreground hover:text-purple-600 ${baseClasses}`; // Directory - purple theme
      default: return `text-foreground ${baseClasses}`;
    }
  };

  // Preload all assets when component mounts
  useEffect(() => {
    // Preload all videos
    Object.values(videoMapping).forEach(videoUrl => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = videoUrl;
    });

    // Preload directory image
    const img = new Image();
    img.src = "/lovable-uploads/a32964b8-235c-4ed7-82ca-2e3114b0079f.png";

    // Preload all feature logos
    features.forEach(feature => {
      feature.replaces.forEach(replacement => {
        const logoImg = new Image();
        logoImg.src = replacement.logo;
      });
    });
  }, []);
  
  // Get current video URL based on active tab
  const currentVideoUrl = videoMapping[activeTabId as keyof typeof videoMapping] || "/videos/Events.mp4";
  
  // Intersection observer to trigger video play when section is visible
  useEffect(() => {
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;
    
    if (!videoContainer || !video) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reset video and play when section comes into view
            video.currentTime = 0;
            setShowReplayButton(false);
            video.play().catch(console.error);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );
    
    observer.observe(videoContainer);
    
    return () => observer.disconnect();
  }, []);
  
  // Effect to play video when active tab changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Reset and play video when tab changes
    video.currentTime = 0;
    setShowReplayButton(false);
    video.play().catch(console.error);
  }, [activeTabId, currentVideoUrl]);
  
  // Handle video end event
  const handleVideoEnd = () => {
    setShowReplayButton(true);
  };
  
  // Handle replay button click
  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setShowReplayButton(false);
    }
  };
  return <section className="py-[10px]">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left side: Accordion with feature titles and descriptions */}
          <div>
            <Accordion type="single" className="w-full" defaultValue="item-1">
              {features.map(tab => <AccordionItem key={tab.id} value={`item-${tab.id}`}>
                  <AccordionTrigger onClick={() => {
                // Update the active image and tab when clicked
                setActiveImage(tab.image);
                setActiveTabId(tab.id);
              }} className="cursor-pointer py-5 !no-underline transition">
                    <h6 className={`text-xl font-semibold ${getColorClass(tab.id, tab.id === activeTabId)}`}>
                      {tab.title}
                    </h6>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mt-3 text-muted-foreground pb-[10px]">{tab.description}</p>
                    
                    {/* Replaces section with universally formatted logos */}
                    <div className="mt-4 flex items-start gap-4">
                      <span className="font-bold text-foreground">Replaces</span>
                      <div className="flex items-center gap-[25px] flex-wrap flex-1 max-w-full">
                         {tab.replaces.map((replacement, index) => (
                           <ReplacementLogo
                             key={index}
                             logo={replacement.logo}
                             name={replacement.name}
                             alt={replacement.alt}
                             url={replacement.url}
                           />
                         ))}
                      </div>
                    </div>
                    
                    {/* Show video or image on mobile devices below the description */}
                    <div className="mt-4 md:hidden">
                      {activeTabId === 5 ? (
                        // Directory section shows the screenshot image
                        <img 
                          src="/lovable-uploads/a32964b8-235c-4ed7-82ca-2e3114b0079f.png"
                          alt="Neighbors directory showing community members"
                          className="w-full h-auto max-h-80 rounded-md object-contain"
                        />
                      ) : (
                        // All other sections show videos
                        <video 
                          src={currentVideoUrl}
                          className="h-full max-h-80 w-full rounded-md object-cover"
                          muted
                          autoPlay
                          loop
                          preload="metadata"
                        />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
          
          {/* Right side: Feature video or image based on section */}
          <div ref={videoContainerRef} className="relative overflow-hidden rounded-xl mx-auto flex items-center justify-center h-full">
            {activeTabId === 5 ? (
              // Directory section shows the screenshot image
              <img 
                src="/lovable-uploads/a32964b8-235c-4ed7-82ca-2e3114b0079f.png"
                alt="Neighbors directory showing community members"
                className="w-full h-auto max-h-80 rounded-md object-contain"
              />
            ) : (
              // All other sections show videos
              <video 
                ref={videoRef}
                src={currentVideoUrl}
                className="w-full h-auto max-h-80 rounded-md object-contain"
                muted
                onEnded={handleVideoEnd}
                preload="metadata"
              />
            )}
            
            {/* Replay button - shows when video ends (only for video sections) */}
            {showReplayButton && activeTabId !== 5 && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl p-4">
                <Button 
                  onClick={handleReplay}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5" />
                  Replay
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>;
};
export { Feature197 };