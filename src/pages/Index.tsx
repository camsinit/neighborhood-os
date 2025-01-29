import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import SettingsDialog from "@/components/SettingsDialog";
import { useState } from "react";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

  if (!session) {
    navigate("/landing");
    return null;
  }

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