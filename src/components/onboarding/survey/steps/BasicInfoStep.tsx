
import { useState, useEffect } from "react";
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
  onValidation?: (field: string, isValid: boolean) => void; // Add validation callback
}

export const BasicInfoStep = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onValidation,
}: BasicInfoStepProps) => {
  // Track validation errors for display
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
  });

  // Track if fields have been touched by the user to prevent immediate error display
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
  });

  // Validate first name and notify parent
  const validateFirstName = (value: string) => {
    const isValid = value.trim().length > 0;
    if (!isValid && touched.firstName) {
      setErrors(prev => ({ ...prev, firstName: "First name is required" }));
    } else {
      setErrors(prev => ({ ...prev, firstName: "" }));
    }
    // Notify parent component of validation result
    onValidation?.("firstName", isValid);
    return isValid;
  };

  // Validate last name and notify parent
  const validateLastName = (value: string) => {
    const isValid = value.trim().length > 0;
    if (!isValid && touched.lastName) {
      setErrors(prev => ({ ...prev, lastName: "Last name is required" }));
    } else {
      setErrors(prev => ({ ...prev, lastName: "" }));
    }
    // Notify parent component of validation result
    onValidation?.("lastName", isValid);
    return isValid;
  };

  // Handle field blur to mark as touched and validate
  const handleFirstNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, firstName: true }));
    validateFirstName(e.target.value);
  };

  const handleLastNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, lastName: true }));
    validateLastName(e.target.value);
  };

  // Run validation when values change (but only show errors if touched)
  useEffect(() => {
    validateFirstName(firstName);
  }, [firstName, touched.firstName]);

  useEffect(() => {
    validateLastName(lastName);
  }, [lastName, touched.lastName]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            onBlur={handleFirstNameBlur}
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
            onBlur={handleLastNameBlur}
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
