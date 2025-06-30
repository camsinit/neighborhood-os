
import React from "react";
import { Calendar, Shield, Sparkles, Package, Heart, Users, Home } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

/**
 * Features component with scroll animation
 * 
 * This component displays the key features of the neighborhoodOS platform
 * using a scroll-based animation effect. The features are presented in an
 * interactive scrolling container with 3D effects.
 */
const Features = () => {
  // Array of feature data objects with placeholder images
  const features = [{
    icon: <Home className="h-6 w-6 text-primary" />,
    title: "Home Dashboard",
    description: "One page for all the activity happening across your neighborhood. Ask questions to our AI assistant to find what you're looking for.",
    borderColor: "border-primary/70",
    image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop" // Modern home dashboard
  }, {
    icon: <Calendar className="h-6 w-6 text-[#0EA5E9]" />,
    title: "Community Calendar",
    description: "Stay connected with all neighborhood gatherings, from block parties to garden days with easy RSVP functionality.",
    borderColor: "border-[#0EA5E9]/70",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop" // Calendar view
  }, {
    icon: <Shield className="h-6 w-6 text-[#ef4444]" />,
    title: "Safety Updates",
    description: "Share and receive important safety information with neighbors, from suspicious activity to lost pets.",
    borderColor: "border-[#ef4444]/70",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop" // Security/safety theme
  }, {
    icon: <Sparkles className="h-6 w-6 text-[#10b981]" />,
    title: "Skills Exchange",
    description: "Offer your talents to neighbors or find help with projects, from gardening advice to language lessons.",
    borderColor: "border-[#10b981]/70",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop" // People collaborating
  }, {
    icon: <Package className="h-6 w-6 text-[#f59e0b]" />,
    title: "Goods Exchange",
    description: "Reduce waste by sharing items like ladders or cake pans that aren't used daily. See what's available nearby.",
    borderColor: "border-[#f59e0b]/70",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop" // Sharing items
  }, {
    icon: <Heart className="h-6 w-6 text-[#8b5cf6]" />,
    title: "Care Requests",
    description: "Request or offer help during challenging times, from meal trains to rides for medical appointments.",
    borderColor: "border-[#8b5cf6]/70",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop" // Community care
  }, {
    icon: <Users className="h-6 w-6 text-[#221F26]" />,
    title: "Neighbors Directory",
    description: "Build stronger connections by seeing who lives nearby, their interests, and skills they're willing to share.",
    borderColor: "border-[#221F26]/70",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop" // Community connections
  }];

  return (
    <section className="py-0 px-8 md:px-16 lg:px-24 bg-background">
      {/* Use ContainerScroll to create the animated effect */}
      <ContainerScroll
        titleComponent={
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              What's Included?
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              Nextdoor became a message board for complaints and missing cats. 
              We help your neighborhood become an invaluable resource for connection, care, and community.
            </p>
          </div>
        }
      >
        {/* Features grid inside the scrolling container */}
        <div className="h-full w-full overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`border ${feature.borderColor} rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-white dark:bg-gray-800`}
              >
                {/* Feature image placeholder */}
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Feature icon and title */}
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold">
                    {feature.title}
                  </h3>
                </div>
                
                {/* Feature description */}
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
};

export default Features;
