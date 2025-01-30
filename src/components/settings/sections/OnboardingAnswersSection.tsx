import { useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OnboardingData {
  phone_number: string;
  address: string;
  skills: string[];
}

export const OnboardingAnswersSection = () => {
  const user = useUser();
  const [data, setData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("phone_number, address, skills")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setData(profile);
      }
    };

    loadOnboardingData();
  }, [user]);

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Contact Information</h4>
          <p className="text-sm text-muted-foreground">
            Phone: {data.phone_number || "Not provided"}
          </p>
          <p className="text-sm text-muted-foreground">
            Address: {data.address || "Not provided"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Your Skills</h4>
          <div className="flex flex-wrap gap-2">
            {data.skills && data.skills.length > 0 ? (
              data.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};