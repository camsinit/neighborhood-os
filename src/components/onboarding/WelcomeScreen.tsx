import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Avatar } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * WelcomeScreen component
 * 
 * This component displays a welcome message with a carousel of neighbor profile images.
 * It fetches profile images from the database and displays them in a continuously 
 * sliding carousel to give new users a sense of the community they're joining.
 */
const WelcomeScreen = () => {
  // Query to fetch neighbor profiles with images
  // This will be used to populate our carousel
  const { data: neighbors, isLoading } = useQuery({
    queryKey: ["neighborProfiles"],
    queryFn: async () => {
      // Fetch profiles that have avatar URLs
      // We limit to 15 profiles to keep the carousel performant
      const { data, error } = await supabase
        .from("profiles")
        .select("id, avatar_url, display_name")
        .not("avatar_url", "is", null)
        .limit(15);
      
      if (error) {
        console.error("Error fetching neighbor profiles:", error);
        return [];
      }
      
      return data || [];
    },
  });

  // If we're still loading or have no neighbors, show a simplified welcome message
  if (isLoading || !neighbors || neighbors.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Neighborhood!</h2>
        <p className="text-gray-600">
          Join your neighbors and build a stronger community together.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Neighborhood!</h2>
        <p className="text-gray-600">
          Join your neighbors and build a stronger community together.
        </p>
      </div>
      
      {/* Carousel of neighbor avatars */}
      <div className="py-4">
        <p className="text-sm text-muted-foreground mb-3">Meet some of your neighbors:</p>
        
        {/* Auto-sliding carousel that loops through neighbor avatars */}
        <Carousel
          opts={{
            align: "center",
            loop: true,
            dragFree: true,
            containScroll: false,
          }}
          className="w-full"
        >
          <CarouselContent className="py-2">
            {/* Map through neighbors and display their avatars */}
            {neighbors.map((neighbor) => (
              <CarouselItem key={neighbor.id} className="basis-1/5 md:basis-1/6 lg:basis-1/7">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-16 w-16">
                    <img 
                      src={neighbor.avatar_url}
                      alt={neighbor.display_name || "Neighbor"}
                      className="object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </Avatar>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default WelcomeScreen;
