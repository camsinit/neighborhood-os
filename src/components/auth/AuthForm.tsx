
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";

const AuthForm = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - just navigate to home
    navigate("/");
  };

  return (
    <>
      <div className="mt-8 bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
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
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
      <OnboardingDialog 
        open={showOnboarding} 
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) {
            setShowSurvey(true);
          }
        }}
      />
      <SurveyDialog
        open={showSurvey}
        onOpenChange={setShowSurvey}
      />
    </>
  );
};

export default AuthForm;
