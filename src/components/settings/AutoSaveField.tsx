
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

/**
 * Auto-save status types
 */
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Props for AutoSaveField component
 */
interface AutoSaveFieldProps {
  children: React.ReactElement;
  fieldName: string;
  value: any;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

/**
 * AutoSaveField Component
 * 
 * Wraps form fields and automatically saves changes to the database
 * with debouncing to prevent excessive API calls.
 * 
 * @param children - The form field component to wrap
 * @param fieldName - The database field name to update
 * @param value - The current field value
 * @param debounceMs - Debounce delay in milliseconds (default: 1000)
 * @param onSaveSuccess - Callback when save succeeds
 * @param onSaveError - Callback when save fails
 */
export const AutoSaveField: React.FC<AutoSaveFieldProps> = ({
  children,
  fieldName,
  value,
  debounceMs = 1000,
  onSaveSuccess,
  onSaveError
}) => {
  // Get the current user for database updates
  const user = useUser();
  
  // Track save status for UI feedback
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  
  // Track the last saved value to avoid unnecessary saves
  const [lastSavedValue, setLastSavedValue] = useState(value);

  /**
   * Save the field value to the database
   */
  const saveField = useCallback(async (valueToSave: any) => {
    if (!user?.id) {
      console.error('[AutoSaveField] No user ID available for saving');
      return;
    }

    // Skip save if value hasn't actually changed
    if (valueToSave === lastSavedValue) {
      return;
    }

    console.log(`[AutoSaveField] Saving ${fieldName}:`, valueToSave);
    setSaveStatus('saving');

    try {
      // Update the profile field in the database
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldName]: valueToSave })
        .eq('id', user.id);

      if (error) throw error;

      // Update last saved value and status
      setLastSavedValue(valueToSave);
      setSaveStatus('saved');
      
      // Call success callback if provided
      onSaveSuccess?.();
      
      // Show success feedback briefly, then return to idle
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error: any) {
      console.error(`[AutoSaveField] Error saving ${fieldName}:`, error);
      setSaveStatus('error');
      
      // Show error toast
      toast.error(`Failed to save ${fieldName}. Please try again.`);
      
      // Call error callback if provided
      onSaveError?.(error);
      
      // Return to idle after showing error
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [user?.id, fieldName, lastSavedValue, onSaveSuccess, onSaveError]);

  /**
   * Debounced save effect
   * Saves the field after a delay when the value changes
   */
  useEffect(() => {
    // Don't save on initial load
    if (value === lastSavedValue) return;
    
    // Set up debounced save
    const timeoutId = setTimeout(() => {
      saveField(value);
    }, debounceMs);

    // Clear timeout if value changes again before save
    return () => clearTimeout(timeoutId);
  }, [value, saveField, debounceMs, lastSavedValue]);

  /**
   * Render save status indicator
   */
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-1 text-blue-600 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <Check className="h-3 w-3" />
            <span>Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <X className="h-3 w-3" />
            <span>Error saving</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      {children}
      {renderSaveStatus()}
    </div>
  );
};
