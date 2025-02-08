
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight, Users, Calendar, Shield, HandHelping } from "lucide-react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import SettingsDialog from "@/components/SettingsDialog";
import { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { useNavigate } from "react-router-dom";
import { seedDashboard } from "@/utils/seedDashboard";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    if (user) {
      seedDashboard().then(() => {
        toast.success("Dashboard populated with sample data!");
      }).catch((error) => {
        console.error("Error seeding dashboard:", error);
        toast.error("Failed to populate dashboard with sample data");
      });
    }
  }, [user]);

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
};

export default Index;
