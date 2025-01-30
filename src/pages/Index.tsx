import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";

const Index = () => {
  const session = useSession();
  const navigate = useNavigate();

  if (!session) {
    navigate("/landing");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => navigate("/settings")} />
      <MainContent />
    </div>
  );
};

export default Index;