import { Button } from "@/components/ui/button";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthForm from "@/components/auth/AuthForm";
import SecretTestButton from "@/components/auth/SecretTestButton";
import { ArrowLeft } from "lucide-react";
import { useLoginState } from "@/hooks/auth/useLoginState";
import { useEffect } from "react";

const Login = () => {
  useLoginState();

  useEffect(() => {
    console.log('Login component mounted', {
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname,
      href: window.location.href
    });

    return () => {
      console.log('Login component unmounting', {
        timestamp: new Date().toISOString(),
        pathname: window.location.pathname
      });
    };
  }, []);

  const handleBackClick = () => {
    console.log('Back button clicked, navigating to root', {
      timestamp: new Date().toISOString()
    });
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