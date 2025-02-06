import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Index page mounted, session state:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
    });

    if (!session) {
      console.log('No session found in Index page, redirecting to landing');
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard.",
        variant: "destructive",
      });
      navigate("/landing");
    }
  }, [session, navigate]);

  if (!session) {
    console.log('Index page rendering null due to no session');
    return null;
  }

  console.log('Rendering Index page with valid session');
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => navigate("/settings")} />
      <MainContent />
    </div>
  );
};

export default Index;