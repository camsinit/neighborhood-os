import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";

const Login = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (loading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <AuthHeader />
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;