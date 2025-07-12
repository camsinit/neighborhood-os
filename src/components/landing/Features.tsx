import React from "react";
import { Feature197 } from "@/components/ui/accordion-feature-section";

/**
 * Features component adapted to use accordion feature section
 * 
 * This component displays the key features of the neighborhoodOS platform
 * using an interactive accordion layout. Each feature includes an image,
 * title, and detailed description explaining the benefits.
 */
const Features = () => {
  // Feature data adapted from the original "What's Included" content
  // Using placeholder images that can be replaced later
  const neighborhoodFeatures = [{
    id: 1,
    title: "Gatherings",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    description: "Most neighborhood gatherings are low-key, low-effort, and just need a simple place for people to RSVP to and get reminders from. That's exactly what our no-frills Calendar page is designed to do.",
    replaces: [
      { name: "Partiful", logo: "https://img.logo.dev/partiful.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Partiful" },
      { name: "Luma", logo: "https://img.logo.dev/lu.ma?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Luma" },
      { name: "Facebook Events", logo: "https://img.logo.dev/facebook.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Facebook Events" }
    ]
  }, {
    id: 2,
    title: "Freebies",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "What feels better than giving old things a new home? Knowing the people who you give it to. Turn old things into new connections with your neighbors, easy peasy.",
    replaces: [
      { name: "OfferUp", logo: "https://img.logo.dev/offerup.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "OfferUp" },
      { name: "Craigslist", logo: "https://img.logo.dev/craigslist.org?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Craigslist" },
      { name: "Facebook Marketplace", logo: "https://img.logo.dev/facebook.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Facebook Marketplace" }
    ]
  }, {
    id: 3,
    title: "Skills",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    description: "Why pay a stranger to do something for you when you have a neighbor down the street who's happy to do it for free? Sure, it's nice to save money, but mostly it just feels good to help a neighbor out.",
    replaces: [
      { name: "TaskRabbit", logo: "https://img.logo.dev/taskrabbit.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "TaskRabbit" },
      { name: "Thumbtack", logo: "https://img.logo.dev/thumbtack.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Thumbtack" },
      { name: "Angie", logo: "https://img.logo.dev/angi.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Angie" }
    ]
  }, {
    id: 4,
    title: "Updates",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
    description: "No more chaotic email threads, group chat threads, or annoying neighbors complaining about dog shit on their lawn. This is the place for simple updates from neighbors for everyday info you'd want to know.",
    replaces: [
      { name: "Nextdoor", logo: "https://img.logo.dev/nextdoor.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Nextdoor" },
      { name: "WhatsApp", logo: "https://img.logo.dev/whatsapp.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "WhatsApp" },
      { name: "Citizen", logo: "https://img.logo.dev/citizen.com?token=pk_SdwwezRcTT6rDwqgpowtPg", alt: "Citizen" }
    ]
  }, {
    id: 5,
    title: "Directory",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    description: "Google Groups are archaic and spreadsheets are hard to maintain. Our neighbor directory makes it easy to know who's nearby and how to reach out to find them",
    replaces: [
      { name: "Microsoft Excel", logo: "/lovable-uploads/4d516086-746b-4d61-925c-c7b806fcca7d.png", alt: "Microsoft Excel" },
      { name: "Google Groups", logo: "/lovable-uploads/ee2365a1-2611-4718-a51f-d81221c59747.png", alt: "Google Groups" },
      { name: "Google Sheets", logo: "/lovable-uploads/996c0ed3-9cf1-4421-93dd-6daeb88b064d.png", alt: "Google Sheets" }
    ]
  }];
  return <section className="bg-background">
      {/* Header section with title and description */}
      <div className="max-w-4xl mx-auto text-center pt-0 px-8 md:px-16 lg:px-24 py-0">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">What's a neighborhood operating system?</h2>
        <p className="text-muted-foreground text-lg mb-8">An all-in-one system to coordinate the care behind every connected neighborhood.</p>
      </div>
      
      {/* Accordion feature section */}
      <Feature197 features={neighborhoodFeatures} />
    </section>;
};
export default Features;