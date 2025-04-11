
import React from "react";
import { Calendar, Shield, Sparkles, Package, Heart, Users, Home } from "lucide-react";

/**
 * Features component
 * 
 * This component displays the key features of the neighborhoodOS platform
 * in a grid layout below the hero section on the landing page.
 * Each feature includes an icon, title, and description.
 */
const Features = () => {
  // Array of feature data objects for easy maintenance and updates
  const features = [
    {
      icon: <Home className="h-6 w-6 text-primary" />,
      title: "Home Dashboard",
      description: "AI Neighborhood Assistant that learns your community's needs, answers questions, and helps find local resources."
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: "Community Calendar",
      description: "Stay connected with all neighborhood gatherings, from block parties to garden days with easy RSVP functionality."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Safety Updates",
      description: "Share and receive important safety information with neighbors, from suspicious activity to lost pets."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Skills Exchange",
      description: "Offer your talents to neighbors or find help with projects, from gardening advice to language lessons."
    },
    {
      icon: <Package className="h-6 w-6 text-primary" />,
      title: "Goods Exchange",
      description: "Reduce waste by sharing items like ladders or cake pans that aren't used daily. See what's available nearby."
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Care Requests",
      description: "Request or offer help during challenging times, from meal trains to rides for medical appointments."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Neighbors Directory",
      description: "Build stronger connections by seeing who lives nearby, their interests, and skills they're willing to share."
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      {/* Section header with title and description */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          What's included in neighborhoodOS?
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to build a more connected, caring neighborhood
        </p>
      </div>

      {/* Features grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="border border-border/30 rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/30"
          >
            {/* Icon with primary color */}
            <div className="mb-2">
              {feature.icon}
            </div>
            
            {/* Feature title */}
            <h3 className="text-xl font-semibold">
              {feature.title}
            </h3>
            
            {/* Feature description */}
            <p className="text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
