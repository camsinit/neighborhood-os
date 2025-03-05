
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Neighborhood } from "@/contexts/neighborhood/types";

/**
 * DashboardContent Component
 * 
 * This component displays the main dashboard content when a user has successfully loaded
 * their neighborhood data. It includes a welcome message and various cards for
 * different features of the neighborhood app.
 * 
 * @param neighborhood - The neighborhood object containing data like name and id
 */
interface DashboardContentProps {
  neighborhood: Neighborhood;
}

const DashboardContent = ({ neighborhood }: DashboardContentProps) => {
  // Hook to navigate to other routes
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard header with welcome message and navigation button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to {neighborhood.name}
            </h1>
            <p className="mt-1 text-gray-600">
              Connect with your neighbors and community
            </p>
          </div>
          <Button 
            onClick={() => navigate('/neighbors')}
            className="mt-4 sm:mt-0"
          >
            View Neighbors
          </Button>
        </div>
        
        {/* Dashboard content cards/widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Events card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Upcoming events in your neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No upcoming events</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/calendar')}>
                View Calendar
              </Button>
            </CardFooter>
          </Card>
          
          {/* Safety updates card */}
          <Card>
            <CardHeader>
              <CardTitle>Safety Updates</CardTitle>
              <CardDescription>
                Recent safety information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent safety updates</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/safety')}>
                View Safety Updates
              </Button>
            </CardFooter>
          </Card>
          
          {/* Goods exchange card */}
          <Card>
            <CardHeader>
              <CardTitle>Goods Exchange</CardTitle>
              <CardDescription>
                Items being shared in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent exchanges</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate('/goods')}>
                View Exchanges
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
