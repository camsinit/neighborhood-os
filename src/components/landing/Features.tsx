
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
  // Array of feature data objects
  const features = [{
    icon: <Home className="h-6 w-6 text-primary" />,
    title: "Home Dashboard",
    description: "One page for all the activity happening across your neighborhood. Ask questions to our AI assistant to find what you're looking for.",
    borderColor: "border-primary/70" // Primary blue for Home
  }, {
    icon: <Calendar className="h-6 w-6 text-[#0EA5E9]" />,
    title: "Community Calendar",
    description: "Stay connected with all neighborhood gatherings, from block parties to garden days with easy RSVP functionality.",
    borderColor: "border-[#0EA5E9]/70" // Turquoise border
  }, {
    icon: <Shield className="h-6 w-6 text-[#ef4444]" />,
    title: "Safety Updates",
    description: "Share and receive important safety information with neighbors, from suspicious activity to lost pets.",
    borderColor: "border-[#ef4444]/70" // Safety red
  }, {
    icon: <Sparkles className="h-6 w-6 text-[#10b981]" />,
    title: "Skills Exchange",
    description: "Offer your talents to neighbors or find help with projects, from gardening advice to language lessons.",
    borderColor: "border-[#10b981]/70" // Skills green
  }, {
    icon: <Package className="h-6 w-6 text-[#f59e0b]" />,
    title: "Goods Exchange",
    description: "Reduce waste by sharing items like ladders or cake pans that aren't used daily. See what's available nearby.",
    borderColor: "border-[#f59e0b]/70" // Goods amber/orange
  }, {
    icon: <Heart className="h-6 w-6 text-[#8b5cf6]" />,
    title: "Care Requests",
    description: "Request or offer help during challenging times, from meal trains to rides for medical appointments.",
    borderColor: "border-[#8b5cf6]/70" // Care purple
  }, {
    icon: <Users className="h-6 w-6 text-[#221F26]" />,
    title: "Neighbors Directory",
    description: "Build stronger connections by seeing who lives nearby, their interests, and skills they're willing to share.",
    borderColor: "border-[#221F26]/70" // Darker brown border
  }];

  return (
    <section className="py-0 px-8 md:px-16 lg:px-24 bg-background pb-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">What's Included?</h2>
        <p className="text-muted-foreground text-lg">Nextdoor became a message board for complaints and missing cats. We help your neighborhood become an invaluable resource for connection, care, and community.</p>
      </div>

      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
        {features.map((feature, index) => (
          <div key={index} className={`border ${feature.borderColor} rounded-xl p-7 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/50`}>
            <div className="flex items-center gap-3 mb-2">
              <div>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">
                {feature.title}
              </h3>
            </div>
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
