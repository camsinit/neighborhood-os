import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthErrorProps {
  error: string | null;
}

const AuthError = ({ error }: AuthErrorProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default AuthError;