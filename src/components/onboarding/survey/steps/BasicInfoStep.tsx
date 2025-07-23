
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Generate array of years from 1950 to current year
 */
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
};

/**
 * Basic Information Step Component
 * 
 * This step collects the user's first name, last name, and year moved in
 * with validation to ensure required fields are provided.
 */
interface BasicInfoStepProps {
  firstName: string;
  lastName: string;
  yearMovedIn: number | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onYearMovedInChange: (value: number | null) => void;
  onValidation?: (field: string, isValid: boolean) => void;
  isOAuthUser?: boolean;
  isReadOnly?: boolean;
}

export const BasicInfoStep = ({
  firstName,
  lastName,
  yearMovedIn,
  onFirstNameChange,
  onLastNameChange,
  onYearMovedInChange,
  onValidation,
  isOAuthUser = false,
  isReadOnly = false,
}: BasicInfoStepProps) => {
  // Track validation errors for display
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    yearMovedIn: "",
  });

  // Track if fields have been touched by the user to prevent immediate error display
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    yearMovedIn: false,
  });

  // Get year options for the dropdown
  const yearOptions = generateYearOptions();

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

  // Validate year moved in (optional field, but must be reasonable if provided)
  const validateYearMovedIn = (value: number | null) => {
    let isValid = true;
    let errorMessage = "";

    if (value !== null) {
      const currentYear = new Date().getFullYear();
      if (value < 1950 || value > currentYear) {
        isValid = false;
        errorMessage = `Year must be between 1950 and ${currentYear}`;
      }
    }

    if (!isValid && touched.yearMovedIn) {
      setErrors(prev => ({ ...prev, yearMovedIn: errorMessage }));
    } else {
      setErrors(prev => ({ ...prev, yearMovedIn: "" }));
    }
    
    // Notify parent component of validation result
    onValidation?.("yearMovedIn", isValid);
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

  const handleYearMovedInChange = (value: string) => {
    setTouched(prev => ({ ...prev, yearMovedIn: true }));
    const yearValue = value === "" ? null : parseInt(value);
    onYearMovedInChange(yearValue);
    validateYearMovedIn(yearValue);
  };

  // Run validation when values change (but only show errors if touched)
  useEffect(() => {
    validateFirstName(firstName);
  }, [firstName, touched.firstName]);

  useEffect(() => {
    validateLastName(lastName);
  }, [lastName, touched.lastName]);

  useEffect(() => {
    validateYearMovedIn(yearMovedIn);
  }, [yearMovedIn, touched.yearMovedIn]);

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
      
      {/* Year moved in field - full width */}
      <div className="space-y-2">
        <Label htmlFor="yearMovedIn">What year did you move to this neighborhood? (optional)</Label>
        <Select value={yearMovedIn?.toString() || ""} onValueChange={handleYearMovedInChange}>
          <SelectTrigger className={errors.yearMovedIn ? "border-red-500" : ""}>
            <SelectValue placeholder="Select year..." />
          </SelectTrigger>
          {/* Limit dropdown height to show 8 years before scrolling */}
          <SelectContent className="max-h-64 overflow-y-auto">
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.yearMovedIn && (
          <p className="text-sm text-red-500">{errors.yearMovedIn}</p>
        )}
        <p className="text-sm text-gray-500">
          This helps neighbors understand your connection to the community and will be displayed on your profile
        </p>
      </div>
    </div>
  );
};
