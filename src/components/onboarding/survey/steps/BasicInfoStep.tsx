
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Basic Information Step Component
 * 
 * This step collects the user's first and last name
 * with validation to ensure both fields are provided.
 */
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
  // Track validation errors
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
  });

  // Validate on blur
  const validateFirstName = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, firstName: "First name is required" }));
      return false;
    }
    setErrors(prev => ({ ...prev, firstName: "" }));
    return true;
  };

  const validateLastName = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, lastName: "Last name is required" }));
      return false;
    }
    setErrors(prev => ({ ...prev, lastName: "" }));
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            onBlur={(e) => validateFirstName(e.target.value)}
            required
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            onBlur={(e) => validateLastName(e.target.value)}
            required
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>
    </div>
  );
};
