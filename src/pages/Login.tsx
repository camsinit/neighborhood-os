
import { useNavigate } from "react-router-dom";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthForm from "@/components/auth/AuthForm";
import SecretTestButton from "@/components/auth/SecretTestButton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
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
