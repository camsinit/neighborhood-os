
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleError = (error: any) => {
    console.error("Auth error:", error);
    let message = "An error occurred during authentication";
    
    // Handle specific error cases
    if (error.message.includes("Email not confirmed")) {
      message = "Please check your email to confirm your account";
    } else if (error.message.includes("Invalid login credentials")) {
      message = "Invalid email or password";
    } else if (error.message.includes("User already registered")) {
      message = "This email is already registered";
    } else if (error.message.includes("Password should be at least")) {
      message = "Password should be at least 6 characters long";
    }

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have successfully signed in",
      });
      navigate("/dashboard");
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Check your email for the confirmation link",
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Sign In"}
            </Button>
            <Button type="button" variant="outline" onClick={handleSignUp} disabled={loading}>
              Sign Up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
