
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface BasicInfoStepProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export const BasicInfoStep = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}: BasicInfoStepProps) => {
  // Track field touch state for validation feedback
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
  });

  // Simple field validation
  const firstNameError = touched.firstName && !firstName.trim() ? "First name is required" : "";
  const lastNameError = touched.lastName && !lastName.trim() ? "Last name is required" : "";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className={firstNameError ? "text-red-500" : ""}>
            First Name*
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            onBlur={() => setTouched({ ...touched, firstName: true })}
            className={firstNameError ? "border-red-500" : ""}
            required
            placeholder="Your first name"
          />
          {firstNameError && <p className="text-sm text-red-500">{firstNameError}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName" className={lastNameError ? "text-red-500" : ""}>
            Last Name*
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            onBlur={() => setTouched({ ...touched, lastName: true })}
            className={lastNameError ? "border-red-500" : ""}
            required
            placeholder="Your last name"
          />
          {lastNameError && <p className="text-sm text-red-500">{lastNameError}</p>}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Your name will be visible to other members of your neighborhood.
      </p>
    </div>
  );
};
