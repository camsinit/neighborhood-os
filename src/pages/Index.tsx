import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import SettingsDialog from "@/components/SettingsDialog";
import { useState } from "react";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <MainContent />
        <SettingsDialog 
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F0FB] via-[#D3E4FD] to-[#F2FCE2]">
      <nav className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Neighborhood Dashboard</h1>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/login")}
              className="text-gray-700 hover:text-gray-900"
            >
              Log in
            </Button>
            <Button 
              variant="default" 
              onClick={() => navigate("/login")}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              Sign up
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 max-w-4xl leading-tight">
            Your Community Hub for Local Connection and Support
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl">
            Join your neighbors in building a stronger, more connected community through shared resources and mutual support.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-6 text-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-gray-300 text-gray-700 hover:text-gray-900 px-8 py-6 text-lg"
            >
              Request a Demo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;