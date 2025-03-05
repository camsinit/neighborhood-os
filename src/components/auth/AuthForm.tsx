
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Define the form schema using Zod
// This schema specifies validation rules for our form fields
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

/**
 * AuthForm Component
 * 
 * This component handles user authentication with email and password.
 * It uses react-hook-form with zod validation to manage form state and validation.
 */
const AuthForm = () => {
  // State for tracking loading state and errors
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Hooks for navigation and authentication
  const supabaseClient = useSupabaseClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get the return URL from query parameters, default to dashboard
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Initialize react-hook-form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Update UI state to show loading
    setLoading(true);
    setErrorMsg(null);

    try {
      // Get values from the form
      const formData = form.getValues();
      
      // Attempt to sign in with Supabase
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // Handle authentication result
      if (error) {
        // If error, throw it to be caught by catch block
        throw error;
      } else {
        // If successful, show success message and redirect
        // Fix: Using toast from sonner which accepts a string directly or
        // can take a title and description
        toast("Successfully signed in!");
        navigate(returnTo, { replace: true });
      }
    } catch (error) {
      // Log error for debugging
      console.error("Authentication error:", error);
      
      // Display error message to user
      setErrorMsg(error instanceof Error ? error.message : "An error occurred during authentication");
    } finally {
      // Reset loading state regardless of outcome
      setLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your email and password to login</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="mail@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Password input field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Submit button */}
            <Button disabled={loading} type="submit" className="w-full">
              {loading ? "Loading" : "Sign In"}
            </Button>
          </form>
        </Form>
        
        {/* Error message display */}
        {errorMsg && (
          <p className="text-red-500 text-sm">{errorMsg}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm;
