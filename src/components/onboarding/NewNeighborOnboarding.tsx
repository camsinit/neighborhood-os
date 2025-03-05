
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading";
import { Neighborhood } from "@/contexts/neighborhood/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, Home } from "lucide-react";

// Define our form schema for new neighbor onboarding
const onboardingSchema = z.object({
  // Basic info
  display_name: z.string().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().optional(),
  
  // Contact information
  email_visible: z.boolean().default(true),
  phone_number: z.string().optional(),
  phone_visible: z.boolean().default(false),
  
  // Address information
  address: z.string().optional(),
  address_visible: z.boolean().default(false),
  
  // Preferences
  access_needs: z.string().optional(),
  needs_visible: z.boolean().default(false),
  
  // Custom fields can be added here for future extension
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

/**
 * NewNeighborOnboarding Component
 * 
 * This component handles the onboarding flow for new neighbors joining an existing neighborhood.
 * It's triggered via invitation links and guides users through setting up their profile.
 */
const NewNeighborOnboarding = () => {
  // Get parameters from URL and navigation function
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUser();
  
  // Track the onboarding state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set up form with validation
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      display_name: "",
      bio: "",
      email_visible: true,
      phone_number: "",
      phone_visible: false,
      address: "",
      address_visible: false,
      access_needs: "",
      needs_visible: false,
    },
  });
  
  // Define the steps in our onboarding process
  const steps = [
    { id: "welcome", label: "Welcome" },
    { id: "basics", label: "Basic Info" },
    { id: "contact", label: "Contact Info" },
    { id: "address", label: "Address" },
    { id: "needs", label: "Access Needs" },
    { id: "complete", label: "Complete" },
  ];
  
  // Effect to load neighborhood information from invite code
  useEffect(() => {
    async function fetchInvitation() {
      try {
        if (!inviteCode) {
          setError("No invitation code provided");
          setIsLoading(false);
          return;
        }
        
        // Fetch invitation information
        const { data: invitation, error: inviteError } = await supabase
          .from('invitations')
          .select(`
            *,
            neighborhoods (
              id, name, address, city, state, zip
            )
          `)
          .eq('invite_code', inviteCode)
          .single();
        
        if (inviteError) throw inviteError;
        if (!invitation) throw new Error("Invitation not found");
        
        if (invitation.status === 'expired') {
          throw new Error("This invitation has expired");
        }
        if (invitation.status === 'accepted') {
          throw new Error("This invitation has already been used");
        }
        
        // Store the neighborhood information
        setNeighborhood(invitation.neighborhoods as Neighborhood);
        
        // Pre-fill address fields if the user allows this
        if (invitation.neighborhoods?.address) {
          form.setValue('address', invitation.neighborhoods.address);
        }
        
        // Load existing profile data if available
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            // Pre-fill the form with existing profile data
            form.reset({
              display_name: profile.display_name || "",
              bio: profile.bio || "",
              email_visible: profile.email_visible ?? true,
              phone_number: profile.phone_number || "",
              phone_visible: profile.phone_visible ?? false,
              address: profile.address || invitation.neighborhoods?.address || "",
              address_visible: profile.address_visible ?? false,
              access_needs: profile.access_needs || "",
              needs_visible: profile.needs_visible ?? false,
            });
          }
        }
      } catch (err) {
        console.error("[NewNeighborOnboarding] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load invitation");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchInvitation();
  }, [inviteCode, user, form]);
  
  // Function to handle form submission
  const onSubmit = async (values: OnboardingFormValues) => {
    if (!user || !neighborhood) return;
    
    setIsSubmitting(true);
    
    try {
      // Update user profile with form data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: values.display_name,
          bio: values.bio,
          phone_number: values.phone_number,
          email_visible: values.email_visible,
          phone_visible: values.phone_visible,
          address: values.address,
          address_visible: values.address_visible,
          access_needs: values.access_needs,
          needs_visible: values.needs_visible,
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Add user to the neighborhood using our secure RPC function
      const { data: membershipResult, error: membershipError } = await supabase
        .rpc('add_neighborhood_member', {
          user_uuid: user.id,
          neighborhood_uuid: neighborhood.id
        });
        
      if (membershipError) throw membershipError;
      
      // Update invitation status
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_code', inviteCode);
        
      if (inviteError) throw inviteError;
      
      // Move to the final step on success
      setCurrentStep(steps.length - 1);
    } catch (err) {
      console.error("[NewNeighborOnboarding] Submit error:", err);
      toast({
        title: "Error saving profile",
        description: err instanceof Error ? err.message : "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const goToDashboard = () => {
    navigate('/dashboard');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle>Loading Onboarding...</CardTitle>
            <CardDescription>Please wait while we load your invitation</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error || !inviteCode || !neighborhood) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>
              {error || "There was a problem with this invitation link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-6">
              This invitation link may be invalid, expired, or already used.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </h2>
            <span className="text-sm text-gray-500">
              {steps[currentStep].label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Form Container */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Welcome Step */}
            {currentStep === 0 && (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome to {neighborhood.name}!</CardTitle>
                  <CardDescription>
                    Let's set up your neighbor profile so you can connect with your community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <div className="bg-blue-50 p-6 rounded-lg mb-4">
                    <Home className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <p>
                      You're joining a neighborhood where neighbors help each other with various needs,
                      share resources, and build community together.
                    </p>
                  </div>
                  <p>
                    We need a bit of information to help you get started. This will only take a few minutes.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Get Started <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Basic Info Step */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Let's start with some basic details about you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is how you'll appear to your neighbors
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About You</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell your neighbors a bit about yourself..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A short bio helps neighbors get to know you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Contact Info Step */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    How would you like neighbors to reach you?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md mb-4">
                    <p className="text-sm">
                      Your email address ({user?.email}) is automatically part of your account.
                      You can control whether it's visible to your neighbors.
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email_visible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Visibility</FormLabel>
                          <FormDescription>
                            Allow neighbors to see your email address
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Add a phone number if you'd like neighbors to call or text you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone_visible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Phone Visibility</FormLabel>
                          <FormDescription>
                            Allow neighbors to see your phone number
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Address Step */}
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Your Address</CardTitle>
                  <CardDescription>
                    Where do you live in the neighborhood?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your address" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your address in the neighborhood
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address_visible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Address Visibility</FormLabel>
                          <FormDescription>
                            Allow neighbors to see your address
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Access Needs Step */}
            {currentStep === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Access Needs</CardTitle>
                  <CardDescription>
                    Let neighbors know if you have any access needs they should be aware of
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="access_needs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Needs (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any access or functional needs..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This helps neighbors accommodate your needs when organizing events or offering help
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="needs_visible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Needs Visibility</FormLabel>
                          <FormDescription>
                            Allow neighbors to see your access needs
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save & Complete"}
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Completion Step */}
            {currentStep === 5 && (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <CardTitle>Welcome to {neighborhood.name}!</CardTitle>
                  <CardDescription>
                    You've successfully joined your neighborhood
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-6">
                    Your profile has been set up and you're now a member of {neighborhood.name}.
                    You can now explore the neighborhood dashboard, meet your neighbors, and participate
                    in community activities.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={goToDashboard}>
                    Go to Neighborhood Dashboard
                  </Button>
                </CardFooter>
              </>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default NewNeighborOnboarding;
