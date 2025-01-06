import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Calendar, Shield, Users, ArrowRight } from "lucide-react";
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
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Local Link</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Neighborhood Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Strengthening communities through connection, support, and engagement
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Calendar className="h-12 w-12 text-[#9b87f5] mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community Calendar</h3>
            <p className="text-gray-600">Stay updated with local events and never miss important community gatherings.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-[#9b87f5] mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mutual Support</h3>
            <p className="text-gray-600">Connect with neighbors, share resources, and build a stronger community together.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Shield className="h-12 w-12 text-[#9b87f5] mb-4" />
            <h3 className="text-xl font-semibold mb-2">Safety Updates</h3>
            <p className="text-gray-600">Stay informed about important safety announcements and community alerts.</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Why Join Your Local Community?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Stronger Connections</h3>
              <p className="text-gray-600">Build lasting relationships with your neighbors</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Better Communication</h3>
              <p className="text-gray-600">Stay informed about what matters in your area</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Increased Safety</h3>
              <p className="text-gray-600">Work together to maintain a secure neighborhood</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Enhanced Support</h3>
              <p className="text-gray-600">Give and receive help when needed</p>
            </div>
          </div>
        </div>

        {/* Getting Started Steps */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Getting Started is Easy</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="inline-block bg-[#9b87f5] text-white w-8 h-8 rounded-full leading-8 mb-2">1</span>
              <h3 className="font-semibold">Create Your Account</h3>
              <p className="text-gray-600">Sign up and join your local community</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="inline-block bg-[#9b87f5] text-white w-8 h-8 rounded-full leading-8 mb-2">2</span>
              <h3 className="font-semibold">Complete Your Profile</h3>
              <p className="text-gray-600">Tell your neighbors about yourself</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="inline-block bg-[#9b87f5] text-white w-8 h-8 rounded-full leading-8 mb-2">3</span>
              <h3 className="font-semibold">Start Participating</h3>
              <p className="text-gray-600">Engage with your community</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;