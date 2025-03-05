
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface NewNeighborOnboardingProps {
  inviteCode: string;
}

/**
 * Onboarding steps enum to track progress
 */
enum OnboardingStep {
  WELCOME = 0,
  PERSONAL_INFO = 1,
  CONTACT_INFO = 2, 
  PRIVACY_SETTINGS = 3,
  SKILLS = 4,
  COMPLETE = 5
}

/**
 * NewNeighborOnboarding Component
 * 
 * This component manages the multi-step onboarding flow for new neighbors
 * joining an existing neighborhood.
 */
const NewNeighborOnboarding = ({ inviteCode }: NewNeighborOnboardingProps) => {
  const navigate = useNavigate();
  const user = useUser();
  const { toast } = useToast();
  const { refreshNeighborhoodData } = useNeighborhood();
  
  // State for invitation data
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [saving, setSaving] = useState(false);
  const [joinedNeighborhood, setJoinedNeighborhood] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    address: "",
    phoneNumber: "",
    phoneVisible: false,
    emailVisible: false,
    addressVisible: false,
    skills: [] as string[],
  });
  
  // Available skill options
  const skillOptions = [
    "Gardening", "Home Repair", "Cooking", "Childcare", 
    "Pet Care", "Tech Support", "Transportation", "Education",
    "Arts & Crafts", "Music", "Languages", "Medical Knowledge"
  ];
  
  // Fetch the invitation data on mount
  useEffect(() => {
    async function fetchInvitationData() {
      if (!user || !inviteCode) return;
      
      try {
        setLoading(true);
        
        // Fetch the invitation data
        const { data, error } = await supabase
          .from('invitations')
          .select(`
            *,
            neighborhoods (
              name,
              id
            )
          `)
          .eq('invite_code', inviteCode)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error("Invitation not found");
        
        console.log("[Onboarding] Invitation data:", data);
        setInvitation(data);
        
        // Check if user profile exists and pre-fill form data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          console.log("[Onboarding] Existing profile data:", profileData);
          setFormData({
            displayName: profileData.display_name || "",
            bio: profileData.bio || "",
            address: profileData.address || "",
            phoneNumber: profileData.phone_number || "",
            phoneVisible: profileData.phone_visible || false,
            emailVisible: profileData.email_visible || false,
            addressVisible: profileData.address_visible || false,
            skills: profileData.skills || [],
          });
        }
        
        // Check if already a member of the neighborhood
        const { data: memberData } = await supabase
          .from('neighborhood_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('neighborhood_id', data.neighborhood_id)
          .single();
        
        if (memberData) {
          console.log("[Onboarding] User is already a neighborhood member:", memberData);
          setJoinedNeighborhood(true);
        }
        
      } catch (err) {
        console.error("[Onboarding] Error fetching invitation:", err);
        setError(err instanceof Error ? err.message : "Failed to load invitation");
      } finally {
        setLoading(false);
      }
    }
    
    fetchInvitationData();
  }, [user, inviteCode]);
  
  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle skill selection
  const toggleSkill = (skill: string) => {
    const updatedSkills = [...formData.skills];
    
    if (updatedSkills.includes(skill)) {
      // Remove the skill if it's already selected
      const index = updatedSkills.indexOf(skill);
      updatedSkills.splice(index, 1);
    } else {
      // Add the skill if it's not already selected
      updatedSkills.push(skill);
    }
    
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };
  
  // Join the neighborhood and continue onboarding
  const handleJoinNeighborhood = async () => {
    if (!user || !invitation) return;
    
    try {
      setSaving(true);
      
      // If not already a member, add to neighborhood
      if (!joinedNeighborhood) {
        // Use supabase RPC to call our security definer function
        const { error: joinError } = await supabase
          .rpc('add_neighborhood_member', {
            user_uuid: user.id,
            neighborhood_uuid: invitation.neighborhood_id
          });
        
        if (joinError) throw joinError;
        
        // Mark invitation as accepted
        const { error: inviteError } = await supabase
          .from('invitations')
          .update({
            status: 'accepted',
            accepted_by_id: user.id,
            accepted_at: new Date().toISOString()
          })
          .eq('id', invitation.id);
        
        if (inviteError) throw inviteError;
        
        setJoinedNeighborhood(true);
        toast({
          title: "Welcome!",
          description: `You've successfully joined ${invitation.neighborhoods.name}!`,
        });
      }
      
      // Move to the first data collection step
      setCurrentStep(OnboardingStep.PERSONAL_INFO);
      
    } catch (err) {
      console.error("[Onboarding] Error joining neighborhood:", err);
      toast({
        title: "Error",
        description: "Failed to join neighborhood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Save the profile data and proceed to the next step
  const handleNext = async () => {
    // Validate current step
    if (currentStep === OnboardingStep.PERSONAL_INFO && !formData.displayName) {
      toast({
        title: "Missing Information",
        description: "Please provide your name before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    // If we're at the final step, save everything and complete
    if (currentStep === OnboardingStep.COMPLETE) {
      await handleComplete();
      return;
    }
    
    // Move to the next step
    setCurrentStep(prev => prev + 1);
  };
  
  // Go back to the previous step
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Complete the onboarding process
  const handleComplete = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update the user profile with all collected data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          bio: formData.bio,
          address: formData.address,
          phone_number: formData.phoneNumber,
          phone_visible: formData.phoneVisible,
          email_visible: formData.emailVisible,
          address_visible: formData.addressVisible,
          skills: formData.skills,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Refresh neighborhood data in context
      await refreshNeighborhoodData();
      
      toast({
        title: "Onboarding Complete!",
        description: "Your profile has been set up successfully.",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error("[Onboarding] Error saving profile:", err);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Skip onboarding and go directly to dashboard
  const handleSkip = () => {
    navigate('/dashboard');
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading your invitation...</p>
      </div>
    );
  }
  
  // Handle error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>
              {error || "This invitation link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Welcome to {invitation.neighborhoods.name}!</CardTitle>
              <CardDescription>
                You've been invited to join this neighborhood community. Let's get you set up.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                This onboarding process will help you:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Set up your neighborhood profile</li>
                <li>Configure your privacy settings</li>
                <li>Share your skills with neighbors</li>
              </ul>
              <p className="text-sm text-gray-500">
                You can update these settings anytime from your profile.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
              <Button onClick={handleJoinNeighborhood} disabled={saving}>
                {saving ? "Joining..." : "Let's Begin"}
              </Button>
            </CardFooter>
          </Card>
        );
      
      case OnboardingStep.PERSONAL_INFO:
        return (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Tell your neighbors a bit about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name *</Label>
                <Input 
                  id="displayName" 
                  value={formData.displayName} 
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="How neighbors will know you"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">About You</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio} 
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Share a bit about yourself, your interests, or what brought you to the neighborhood"
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </CardFooter>
          </Card>
        );
      
      case OnboardingStep.CONTACT_INFO:
        return (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How neighbors can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Your address in the neighborhood"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  type="tel"
                  value={formData.phoneNumber} 
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Your phone number (optional)"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </CardFooter>
          </Card>
        );
      
      case OnboardingStep.PRIVACY_SETTINGS:
        return (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control what information is visible to other neighbors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="phoneVisible" className="flex-1">
                  Show phone number to neighbors
                </Label>
                <Switch
                  id="phoneVisible" 
                  checked={formData.phoneVisible} 
                  onCheckedChange={(checked) => handleInputChange('phoneVisible', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emailVisible" className="flex-1">
                  Show email to neighbors
                </Label>
                <Switch
                  id="emailVisible" 
                  checked={formData.emailVisible} 
                  onCheckedChange={(checked) => handleInputChange('emailVisible', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="addressVisible" className="flex-1">
                  Show address to neighbors
                </Label>
                <Switch
                  id="addressVisible" 
                  checked={formData.addressVisible} 
                  onCheckedChange={(checked) => handleInputChange('addressVisible', checked)}
                />
              </div>
              
              <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mt-4">
                <p>
                  These settings only control visibility to other neighbors. 
                  Neighborhood administrators will have access to contact information for emergency purposes.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </CardFooter>
          </Card>
        );
      
      case OnboardingStep.SKILLS:
        return (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
              <CardDescription>
                Let neighbors know what skills you can share
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Select any skills you're willing to share with neighbors:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {skillOptions.map(skill => (
                    <div 
                      key={skill}
                      className={`p-2 rounded-md cursor-pointer text-sm border ${
                        formData.skills.includes(skill) 
                          ? 'bg-blue-100 border-blue-300' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(OnboardingStep.COMPLETE)}>
                Next
              </Button>
            </CardFooter>
          </Card>
        );
      
      case OnboardingStep.COMPLETE:
        return (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>All Set!</CardTitle>
              <CardDescription>
                You're ready to join your neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="mb-4">
                  Thanks for completing your profile setup! You're now ready to connect with your neighbors.
                </p>
                <p className="text-sm text-gray-600">
                  You can update your information anytime from your profile settings.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleComplete} disabled={saving}>
                {saving ? "Saving..." : "Go to Dashboard"}
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };
  
  // Render the progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      'Welcome',
      'Personal Info',
      'Contact Info',
      'Privacy',
      'Skills',
      'Complete'
    ];
    
    return (
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`relative flex flex-col items-center ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs hidden sm:block mt-1">{step}</span>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-3 w-full h-0.5 -right-1/2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Main component render
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-2">
          Join {invitation.neighborhoods.name}
        </h1>
        
        {currentStep > OnboardingStep.WELCOME && (
          renderProgressIndicator()
        )}
        
        <div className="flex justify-center">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default NewNeighborOnboarding;
