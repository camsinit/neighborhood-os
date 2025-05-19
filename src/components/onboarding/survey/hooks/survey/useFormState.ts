
/**
 * useFormState hook
 * 
 * This hook manages the basic state for the survey form fields.
 * It provides state variables and setter functions for all form fields.
 */
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";

export const useFormState = () => {
  const user = useUser();
  
  // Form state for all steps
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  
  return {
    formData: {
      firstName,
      lastName,
      email,
      phone,
      address,
      profilePhoto,
      photoUrl,
      skills
    },
    setters: {
      setFirstName,
      setLastName,
      setEmail,
      setPhone,
      setAddress,
      setProfilePhoto,
      setPhotoUrl,
      setSkills
    }
  };
};
