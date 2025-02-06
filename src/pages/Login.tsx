import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
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