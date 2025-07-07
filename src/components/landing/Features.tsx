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
      { name: "Partiful", logo: "/lovable-uploads/2e8ba0c4-f0ef-4f92-b41c-51a63bf67944.png", alt: "Partiful" },
      { name: "Luma", logo: "/lovable-uploads/f6ad984f-cbf9-4056-80e5-cdf5a44f816f.png", alt: "Luma" },
      { name: "Facebook", logo: "/lovable-uploads/150bc5c5-2da6-48a5-bdc0-fda9218a2a34.png", alt: "Facebook" }
    ]
  }, {
    id: 2,
    title: "Freebies",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "What feels better than giving old things a new home? Knowing the people who you give it to. Turn old things into new connections with your neighbors, easy peasy.",
    replaces: [
      { name: "OfferUp", logo: "/lovable-uploads/e1bc1776-d9c6-4c5c-9ea4-fbaf85b73d53.png", alt: "OfferUp" },
      { name: "Craigslist", logo: "/lovable-uploads/6ecb06fc-bfb0-4ac5-93af-0a52e4d1eb6b.png", alt: "Craigslist" },
      { name: "Marketplace", logo: "/lovable-uploads/150bc5c5-2da6-48a5-bdc0-fda9218a2a34.png", alt: "Marketplace" }
    ]
  }, {
    id: 3,
    title: "Skills",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    description: "Why pay a stranger to do something for you when you have a neighbor down the street who's happy to do it for free? Sure, it's nice to save money, but mostly it just feels good to help a neighbor out.",
    replaces: [
      { name: "TaskRabbit", logo: "/lovable-uploads/a603952b-1083-46b7-95c4-636882545a12.png", alt: "TaskRabbit" },
      { name: "Thumbtack", logo: "/lovable-uploads/0e2eb142-f109-449a-b67e-11c3e5de7b90.png", alt: "Thumbtack" },
      { name: "Handy", logo: "/lovable-uploads/98ec4102-48f0-43c9-ac44-87746ff200f8.png", alt: "Handy" }
    ]
  }, {
    id: 4,
    title: "Freebies",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
    description: "Reduce waste by sharing items like ladders or cake pans that aren't used daily. See what's available nearby and contribute to a more sustainable neighborhood.",
    replaces: [
      { name: "Nextdoor", logo: "/lovable-uploads/6ecb06fc-bfb0-4ac5-93af-0a52e4d1eb6b.png", alt: "Nextdoor" },
      { name: "Ring", logo: "/lovable-uploads/150bc5c5-2da6-48a5-bdc0-fda9218a2a34.png", alt: "Ring" },
      { name: "Citizen", logo: "/lovable-uploads/f6ad984f-cbf9-4056-80e5-cdf5a44f816f.png", alt: "Citizen" }
    ]
  }, {
    id: 5,
    title: "Neighbors Directory",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    description: "Build stronger connections by seeing who lives nearby, their interests, and skills they're willing to share. Transform your neighborhood from strangers to friends.",
    replaces: [
      { name: "WhatsApp", logo: "/lovable-uploads/2e8ba0c4-f0ef-4f92-b41c-51a63bf67944.png", alt: "WhatsApp" },
      { name: "Telegram", logo: "/lovable-uploads/e1bc1776-d9c6-4c5c-9ea4-fbaf85b73d53.png", alt: "Telegram" },
      { name: "Discord", logo: "/lovable-uploads/6ecb06fc-bfb0-4ac5-93af-0a52e4d1eb6b.png", alt: "Discord" }
    ]
  }];
  return <section className="bg-background">
      {/* Header section with title and description */}
      <div className="max-w-4xl mx-auto text-center pt-16 px-8 md:px-16 lg:px-24 py-0">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">What's a neighborhood operating system?</h2>
        <p className="text-muted-foreground text-lg mb-8">An all-in-one system to coordinate the care behind every connected neighborhood.</p>
      </div>
      
      {/* Accordion feature section */}
      <Feature197 features={neighborhoodFeatures} />
    </section>;
};
export default Features;