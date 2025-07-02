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
    title: "Community Calendar",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    description: "Stay connected with all neighborhood gatherings, from block parties to garden days with easy RSVP functionality. Never miss another community event and build stronger relationships with your neighbors."
  }, {
    id: 2,
    title: "Safety Updates",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    description: "Share and receive important safety information with neighbors, from suspicious activity to lost pets. Keep your community informed and create a safer environment for everyone."
  }, {
    id: 3,
    title: "Skills Exchange",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    description: "Offer your talents to neighbors or find help with projects, from gardening advice to language lessons. Build a community where everyone's skills are valued and shared."
  }, {
    id: 4,
    title: "Goods Exchange",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
    description: "Reduce waste by sharing items like ladders or cake pans that aren't used daily. See what's available nearby and contribute to a more sustainable neighborhood."
  }, {
    id: 5,
    title: "Neighbors Directory",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    description: "Build stronger connections by seeing who lives nearby, their interests, and skills they're willing to share. Transform your neighborhood from strangers to friends."
  }];
  return <section className="bg-background">
      {/* Header section with title and description */}
      <div className="max-w-3xl mx-auto text-center pt-16 px-8 md:px-16 lg:px-24 py-0">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">How does neighborhoodOS work?</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Nextdoor became a message board for complaints and missing cats. neighborhoodOS focuses solely on the ingredients that every dreamy neighborhood is made of: connection, care, and community.
        </p>
      </div>
      
      {/* Accordion feature section */}
      <Feature197 features={neighborhoodFeatures} />
    </section>;
};
export default Features;