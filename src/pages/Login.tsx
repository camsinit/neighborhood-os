
import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Login page component
 * 
 * This page displays the authentication form and header,
 * allowing users to sign in to access the Neighborhood OS dashboard.
 */
const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back button to return to landing page */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AuthHeader />
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
