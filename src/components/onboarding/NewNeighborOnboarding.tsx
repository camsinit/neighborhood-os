
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

/**
 * NewNeighborOnboarding component
 * 
 * This component provides a streamlined onboarding experience for new neighbors
 * who have just joined a neighborhood. It collects essential profile information
 * and welcomes them to the community.
 */
const NewNeighborOnboarding = () => {
  // State for the onboarding form and process
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    address: '',
    phoneNumber: '',
    emailVisible: true,
    phoneVisible: false,
    addressVisible: false,
  });
  
  // Get necessary hooks
  const user = useUser();
  const { currentNeighborhood, refreshNeighborhoodData } = useNeighborhood();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user already has a profile set up
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch the user's profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('display_name, bio, address, phone_number')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // If the user already has their profile filled out, we can skip onboarding
        if (profile && profile.display_name) {
          console.log("[NewNeighborOnboarding] User already has a profile:", profile);
          setIsComplete(true);
        } else if (profile) {
          // Pre-populate with any existing data
          setFormData({
            ...formData,
            displayName: profile.display_name || '',
            bio: profile.bio || '',
            address: profile.address || '',
            phoneNumber: profile.phone_number || '',
          });
        }
      } catch (err) {
        console.error("[NewNeighborOnboarding] Error checking profile:", err);
        setError("Failed to load your profile information");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserProfile();
  }, [user]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle moving to the next step
  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };
  
  // Handle moving to the previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to complete onboarding");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          bio: formData.bio,
          address: formData.address,
          phone_number: formData.phoneNumber,
          email_visible: formData.emailVisible,
          phone_visible: formData.phoneVisible,
          address_visible: formData.addressVisible,
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Refresh neighborhood data to ensure everything is up to date
      refreshNeighborhoodData();
      
      // Mark as complete
      setIsComplete(true);
      
      // Show success message
      toast({
        title: "Welcome to the neighborhood!",
        description: "Your profile has been set up successfully.",
      });
      
    } catch (err) {
      console.error("[NewNeighborOnboarding] Error updating profile:", err);
      setError("Failed to save your profile information");
      
      toast({
        title: "Error",
        description: "Failed to complete your onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle skipping onboarding
  const handleSkip = () => {
    setIsComplete(true);
    
    toast({
      title: "Welcome!",
      description: "You can complete your profile later in Settings.",
    });
  };
  
  // Handle finishing the onboarding process
  const handleFinish = () => {
    navigate('/neighbors');
  };
  
  // If already completed, show success screen
  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to {currentNeighborhood?.name || 'the Neighborhood'}!</CardTitle>
            <CardDescription>
              You're all set up and ready to connect with your neighbors.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Your profile is complete and you're now part of the neighborhood community.
              Explore the dashboard to see events, safety updates, and connect with neighbors.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleFinish}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Render the appropriate step
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to the Neighborhood!</CardTitle>
          <CardDescription>
            {step === 1 && "Let's set up your profile so neighbors can get to know you."}
            {step === 2 && "Where can neighbors find you?"}
            {step === 3 && "Set your privacy preferences for the community."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="How should neighbors call you?"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">About You</label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a bit about yourself, your interests, or what brings you to the neighborhood..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your address in the neighborhood"
                />
                <p className="text-xs text-gray-500">
                  This helps neighbors know where you're located
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Your contact number (optional)"
                />
              </div>
            </div>
          )}
          
          {/* Step 3: Privacy Settings */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-2">
                Choose what information you want to share with your neighbors:
              </p>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <label className="text-sm font-medium">Show my email</label>
                <input
                  type="checkbox"
                  name="emailVisible"
                  checked={formData.emailVisible}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <label className="text-sm font-medium">Show my phone number</label>
                <input
                  type="checkbox"
                  name="phoneVisible"
                  checked={formData.phoneVisible}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <label className="text-sm font-medium">Show my address</label>
                <input
                  type="checkbox"
                  name="addressVisible"
                  checked={formData.addressVisible}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4"
                />
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step === 1 ? (
            <Button variant="ghost" onClick={handleSkip}>
              Skip for Now
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          )}
          
          <Button onClick={handleNextStep}>
            {step < 3 ? "Next" : "Complete Setup"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewNeighborOnboarding;
