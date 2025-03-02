
import { useState, useEffect } from "react";
import { UserDirectory } from "@/components/neighbors/UserDirectory";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * NeighborsPage Component
 * 
 * This page displays a directory of neighbors in the user's neighborhood.
 * It ensures users are part of a neighborhood and redirects to home if they aren't.
 */
const NeighborsPage = () => {
  // State for the search functionality
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get neighborhood context and navigation
  const { currentNeighborhood, isLoading, error } = useNeighborhood();
  const navigate = useNavigate();

  // Add debugging logs
  useEffect(() => {
    console.log("[NeighborsPage] Neighborhood state:", {
      neighborhood: currentNeighborhood,
      isLoading,
      error,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error]);

  // Setup event listener for highlighting neighbors
  useEffect(() => {
    const handleHighlightItem = (e: CustomEvent) => {
      if (e.detail.type === 'neighbors') {
        setTimeout(() => {
          const neighborCard = document.querySelector(`[data-neighbor-id="${e.detail.id}"]`);
          if (neighborCard) {
            neighborCard.classList.add('rainbow-highlight');
            neighborCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
              neighborCard.classList.remove('rainbow-highlight');
            }, 2000);
          }
        }, 100);
      }
    };

    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  // Show loading state while fetching neighborhood data
  if (isLoading) {
    return (
      <div className="min-h-full w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If not in a neighborhood, show a message to redirect user
  if (error || !currentNeighborhood) {
    return (
      <div className="min-h-full w-full flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4">No Neighborhood Access</h2>
          <p className="text-center text-gray-600 mb-6">
            You need an invitation to join a neighborhood. Please contact someone you know who is already 
            in a neighborhood and ask them for an invitation link.
          </p>
          <div className="flex flex-col space-y-4">
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home Page
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // User has a neighborhood, show the neighbors directory
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#D3E4FD] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h2 className="text-2xl font-bold text-gray-900">My Neighbors</h2>
          
          <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">
              Welcome to {currentNeighborhood.name}! Meet and connect with your neighbors. 
              Browse profiles, discover shared interests, and build meaningful connections within your community.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-[280px]">
                <Input
                  type="text"
                  placeholder="Search neighbors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <UserDirectory searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighborsPage;
