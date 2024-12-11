import QuickActions from "@/components/QuickActions";
import CommunityCalendar from "@/components/CommunityCalendar";
import MutualSupport from "@/components/MutualSupport";
import SafetyUpdates from "@/components/SafetyUpdates";
import { UserCircle } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">NeighBoard</div>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <UserCircle className="h-8 w-8" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="p-6 rounded-lg bg-[#F1F0FB] bg-opacity-50">
            <QuickActions />
          </div>
          <div className="p-6 rounded-lg bg-[#D3E4FD] bg-opacity-50">
            <CommunityCalendar />
          </div>
          <div className="p-6 rounded-lg bg-[#FEF7CD] bg-opacity-50">
            <MutualSupport />
          </div>
          <div className="p-6 rounded-lg bg-[#FDE1D3] bg-opacity-50">
            <SafetyUpdates />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;