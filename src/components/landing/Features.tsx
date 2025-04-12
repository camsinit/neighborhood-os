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
  // Each feature now includes a borderColor that corresponds to the section color in the dashboard
  const features = [
    {
      icon: <Home className="h-6 w-6 text-primary" />,
      title: "Home Dashboard",
      description: "One page for all the activity happening across your neighborhood. Ask questions to our AI assistant to find what you're looking for.",
      borderColor: "border-primary/70" // Primary blue for Home
    },
    {
      icon: <Calendar className="h-6 w-6 text-[#3b82f6]" />,
      title: "Community Calendar",
      description: "Stay connected with all neighborhood gatherings, from block parties to garden days with easy RSVP functionality.",
      borderColor: "border-[#3b82f6]/70" // Calendar blue
    },
    {
      icon: <Shield className="h-6 w-6 text-[#ef4444]" />,
      title: "Safety Updates",
      description: "Share and receive important safety information with neighbors, from suspicious activity to lost pets.",
      borderColor: "border-[#ef4444]/70" // Safety red
    },
    {
      icon: <Sparkles className="h-6 w-6 text-[#10b981]" />,
      title: "Skills Exchange",
      description: "Offer your talents to neighbors or find help with projects, from gardening advice to language lessons.",
      borderColor: "border-[#10b981]/70" // Skills green
    },
    {
      icon: <Package className="h-6 w-6 text-[#f59e0b]" />,
      title: "Goods Exchange",
      description: "Reduce waste by sharing items like ladders or cake pans that aren't used daily. See what's available nearby.",
      borderColor: "border-[#f59e0b]/70" // Goods amber/orange
    },
    {
      icon: <Heart className="h-6 w-6 text-[#8b5cf6]" />,
      title: "Care Requests",
      description: "Request or offer help during challenging times, from meal trains to rides for medical appointments.",
      borderColor: "border-[#8b5cf6]/70" // Care purple
    },
    {
      icon: <Users className="h-6 w-6 text-[#6b7280]" />,
      title: "Neighbors Directory",
      description: "Build stronger connections by seeing who lives nearby, their interests, and skills they're willing to share.",
      borderColor: "border-[#6b7280]/70" // Neighbors gray
    }
  ];

  return (
    // Reduced top padding further to bring the section even closer to the hero image
    <section className="py-4 px-8 md:px-16 lg:px-24 bg-background">
      {/* Section header with title and description */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          What's included in neighborhoodOS?
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to build a more connected, caring neighborhood
        </p>
      </div>

      {/* Features grid - added max-w-6xl instead of max-w-7xl to make cards narrower */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            // Added the specific border color for each card and increased padding
            className={`border ${feature.borderColor} rounded-xl p-7 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/50`}
          >
            {/* Updated to put icon and title in a flex row layout */}
            <div className="flex items-center gap-3 mb-2">
              {/* Icon with primary color */}
              <div>
                {feature.icon}
              </div>
              
              {/* Feature title - moved next to the icon */}
              <h3 className="text-xl font-semibold">
                {feature.title}
              </h3>
            </div>
            
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
