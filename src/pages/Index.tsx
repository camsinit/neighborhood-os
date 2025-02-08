
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight, Users, Calendar, Shield, HandHelping } from "lucide-react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import SettingsDialog from "@/components/SettingsDialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { seedDashboard } from "@/utils/seedDashboard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      seedDashboard().then(() => {
        toast.success("Dashboard populated with sample data!");
      }).catch((error) => {
        console.error("Error seeding dashboard:", error);
        toast.error("Failed to populate dashboard with sample data");
      });
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? (
        <>
          <Header onOpenSettings={() => setIsSettingsOpen(true)} />
          <MainContent />
          <SettingsDialog 
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />
        </>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <h1 className="text-4xl font-bold">Welcome to Terrific Terrace</h1>
            <p className="text-gray-600">Connect with your neighbors and build a stronger community.</p>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full max-w-xs mx-auto"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In / Register
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
