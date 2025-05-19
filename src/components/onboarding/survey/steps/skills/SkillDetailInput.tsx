
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { formatSkillDetail } from './skillUtils';
import { SKILLS_REQUIRING_DETAILS } from './skillCategories';

/**
 * Props for the SkillDetailInput component
 */
interface SkillDetailInputProps {
  skill: string;
  onChange: (details: string) => void;
  value?: string;
}

/**
 * SkillDetailInput
 * 
 * A component that renders a specialized input field for entering details
 * about a specific skill (like languages for translation, instruments for music, etc.)
 * 
 * Features:
 * - Shows placeholder examples in gray text
 * - Auto-formats input with commas
 * - Auto-capitalizes as appropriate
 * - Appears beneath skills that require specificity
 */
export const SkillDetailInput = ({ skill, onChange, value = "" }: SkillDetailInputProps) => {
  // Get configuration for this skill
  const config = SKILLS_REQUIRING_DETAILS[skill as keyof typeof SKILLS_REQUIRING_DETAILS];
  
  // Track whether input is focused
  const [isFocused, setIsFocused] = useState(false);
  
  // Local state to track input value
  const [inputValue, setInputValue] = useState(value);
  
  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Automatically add commas when spaces are typed after words
    // This helps enforce the comma-separated format
    const formattedValue = newValue.replace(/(\w+)(\s{2,}|\s+$)/g, '$1, ');
    
    setInputValue(formattedValue);
    onChange(formattedValue);
  };
  
  // When blur occurs, format the input nicely
  const handleBlur = () => {
    setIsFocused(false);
    const formattedValue = formatSkillDetail(inputValue);
    setInputValue(formattedValue);
    onChange(formattedValue);
  };

  // If we don't have config for this skill, don't render anything
  if (!config) return null;

  return (
    <div className="ml-6 mt-1 mb-3 animate-in fade-in slide-in-from-top-1 duration-300">
      <label className="text-xs text-muted-foreground block mb-1">
        {config.prompt}
      </label>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={isFocused || inputValue ? "" : config.placeholder}
        className="h-8 text-sm"
        // Handle Enter key to apply formatting
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
          }
        }}
      />
    </div>
  );
};
