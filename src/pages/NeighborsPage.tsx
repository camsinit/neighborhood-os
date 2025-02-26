
import { useState, useEffect } from "react";
import { UserDirectory } from "@/components/neighbors/UserDirectory";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

const NeighborsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentNeighborhood } = useNeighborhood();

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

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#D3E4FD] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h2 className="text-2xl font-bold text-gray-900">My Neighbors</h2>
          
          <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">
              Welcome to {currentNeighborhood?.name || 'your neighborhood'}! Meet and connect with your neighbors. 
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
