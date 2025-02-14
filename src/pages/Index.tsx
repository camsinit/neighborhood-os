
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight, Users, Calendar, Shield, HandHelping } from "lucide-react";
import Header from "@/components/layout/Header";
import { useState } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Local Link
          </h1>
          <p className="text-xl text-gray-600">
            Connect with your community and make a difference
          </p>
        </div>

        <BentoGrid className="max-w-4xl mx-auto">
          <BentoGridItem
            title="Community Calendar"
            description="Stay updated with local events and activities"
            header={<Calendar className="h-12 w-12" />}
            className="cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => handleFeatureClick('/calendar')}
          />
          <BentoGridItem
            title="Mutual Support"
            description="Share resources and help neighbors"
            header={<HandHelping className="h-12 w-12" />}
            className="cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => handleFeatureClick('/care')}
          />
          <BentoGridItem
            title="Safety Updates"
            description="Stay informed about neighborhood safety"
            header={<Shield className="h-12 w-12" />}
            className="cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => handleFeatureClick('/safety')}
          />
          <BentoGridItem
            title="Community Directory"
            description="Connect with your neighbors"
            header={<Users className="h-12 w-12" />}
            className="cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => handleFeatureClick('/community')}
          />
        </BentoGrid>

        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate('/login')}
            className="group"
            size="lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
