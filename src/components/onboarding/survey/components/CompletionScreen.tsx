
import { CheckCircle2 } from "lucide-react";

/**
 * CompletionScreen component
 * 
 * Shows a celebratory animation and success message when the user
 * completes the onboarding process.
 */
export const CompletionScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      {/* Add colorful confetti-like elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-purple-300 rounded-full opacity-20 animate-float" style={{ animationDuration: '7s' }}></div>
        <div className="absolute top-1/4 -right-4 w-12 h-12 bg-teal-300 rounded-full opacity-30 animate-float" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 -left-6 w-20 h-20 bg-amber-300 rounded-full opacity-20 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>
        <div className="absolute -bottom-6 right-1/4 w-14 h-14 bg-rose-300 rounded-full opacity-30 animate-float" style={{ animationDuration: '6s', animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="relative p-4 bg-green-50 rounded-full">
        <CheckCircle2 className="h-16 w-16 text-green-500 animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
      </div>
      
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
        Profile Complete!
      </h2>
      
      <p className="text-center text-muted-foreground max-w-xs">
        Thank you for setting up your profile. Your neighborhood experience is now ready!
      </p>
      
      {/* Added decorative elements */}
      <div className="flex items-center justify-center space-x-1 pt-4">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" 
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};
