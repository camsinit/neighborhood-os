
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Basic Information Step Component
 * 
 * This step collects the user's first name, last name, and years lived here
 * with validation to ensure required fields are provided.
 */
interface BasicInfoStepProps {
  firstName: string;
  lastName: string;
  yearsLivedHere: number | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onYearsLivedHereChange: (value: number | null) => void;
  onValidation?: (field: string, isValid: boolean) => void; // Add validation callback
}

export const BasicInfoStep = ({
  firstName,
  lastName,
  yearsLivedHere,
  onFirstNameChange,
  onLastNameChange,
  onYearsLivedHereChange,
  onValidation,
}: BasicInfoStepProps) => {
  // Track validation errors for display
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    yearsLivedHere: "",
  });

  // Track if fields have been touched by the user to prevent immediate error display
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    yearsLivedHere: false,
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

  // Validate years lived here (optional field, but must be positive if provided)
  const validateYearsLivedHere = (value: number | null) => {
    let isValid = true;
    let errorMessage = "";

    if (value !== null) {
      if (value < 0) {
        isValid = false;
        errorMessage = "Years must be a positive number";
      } else if (value > 150) {
        isValid = false;
        errorMessage = "Please enter a reasonable number of years";
      }
    }

    if (!isValid && touched.yearsLivedHere) {
      setErrors(prev => ({ ...prev, yearsLivedHere: errorMessage }));
    } else {
      setErrors(prev => ({ ...prev, yearsLivedHere: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("yearsLivedHere", isValid);
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

  const handleYearsLivedHereBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, yearsLivedHere: true }));
    const value = e.target.value === "" ? null : parseInt(e.target.value);
    validateYearsLivedHere(value);
  };

  const handleYearsLivedHereChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value);
    onYearsLivedHereChange(value);
  };

  // Run validation when values change (but only show errors if touched)
  useEffect(() => {
    validateFirstName(firstName);
  }, [firstName, touched.firstName]);

  useEffect(() => {
    validateLastName(lastName);
  }, [lastName, touched.lastName]);

  useEffect(() => {
    validateYearsLivedHere(yearsLivedHere);
  }, [yearsLivedHere, touched.yearsLivedHere]);

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
      
      {/* Years lived here field - full width */}
      <div className="space-y-2">
        <Label htmlFor="yearsLivedHere">How many years have you lived here? (optional)</Label>
        <Input
          id="yearsLivedHere"
          type="number"
          min="0"
          max="150"
          value={yearsLivedHere ?? ""}
          onChange={handleYearsLivedHereChange}
          onBlur={handleYearsLivedHereBlur}
          placeholder="e.g., 5"
          className={errors.yearsLivedHere ? "border-red-500" : ""}
        />
        {errors.yearsLivedHere && (
          <p className="text-sm text-red-500">{errors.yearsLivedHere}</p>
        )}
        <p className="text-sm text-gray-500">
          This helps neighbors understand your connection to the community and will be displayed on your profile
        </p>
      </div>
    </div>
  );
};
