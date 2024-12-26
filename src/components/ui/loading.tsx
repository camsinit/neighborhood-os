import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}