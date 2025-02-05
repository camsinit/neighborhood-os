import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthForm from "@/components/auth/AuthForm";
import SecretTestButton from "@/components/auth/SecretTestButton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Login page mounted');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change in Login page:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
        currentLocation: window.location.pathname,
        navigationState: window.history.state
      });

      if (event === 'SIGNED_IN') {
        if (session) {
          console.log('User signed in, checking profile');
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('created_at, display_name')
              .eq('id', session.user.id)
              .single();

            console.log('Profile check result in Login:', {
              hasProfile: !!profile,
              profileData: profile,
              error,
              timestamp: new Date().toISOString()
            });

            if (error) {
              console.error('Error fetching profile in Login:', {
                error,
                userId: session.user.id,
                timestamp: new Date().toISOString()
              });
              toast({
                title: "Profile Error",
                description: `Error fetching profile: ${error.message}`,
                variant: "destructive",
              });
              return;
            }

            console.log('Attempting navigation to root', {
              timestamp: new Date().toISOString(),
              from: window.location.pathname
            });
            
            navigate("/", { replace: true });
            
            console.log('Navigation completed', {
              timestamp: new Date().toISOString(),
              to: '/',
              navigationState: window.history.state
            });
          } catch (error) {
            console.error('Unexpected error in Login profile check:', {
              error,
              timestamp: new Date().toISOString()
            });
            toast({
              title: "Error",
              description: "An unexpected error occurred while checking your profile",
              variant: "destructive",
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, staying on login page');
        navigate("/login", { replace: true });
      }
    });

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check in Login page:', {
        hasSession: !!session,
        error: error?.message,
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname
      });

      if (session) {
        console.log('Session found, navigating to root');
        navigate("/");
      }
    });

    return () => {
      console.log('Login page unmounting');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleBackClick = () => {
    console.log('Back button clicked, navigating to root');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F1F0FB] via-[#D3E4FD] to-[#F2FCE2]">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2"
        onClick={handleBackClick}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
      <div className="max-w-md w-full space-y-8">
        <AuthHeader />
        <AuthForm />
      </div>
      <SecretTestButton />
    </div>
  );
};

export default Login;