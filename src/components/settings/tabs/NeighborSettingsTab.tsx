
import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AutoSaveField } from '../AutoSaveField';
import { UserNeighborhoods } from '../UserNeighborhoods';

/**
 * Skill categories available in the system
 */
const skillCategories = ['technology', 'creative', 'trade', 'education', 'wellness'] as const;
type SkillCategory = typeof skillCategories[number];

/**
 * Neighbor profile settings structure
 */
interface NeighborSettings {
  skills: SkillCategory[];
  email_visible: boolean;
  phone_visible: boolean;
  address_visible: boolean;
  needs_visible: boolean;
}

/**
 * NeighborSettingsTab Component
 * 
 * Handles neighbor profile settings with auto-saving functionality
 */
export const NeighborSettingsTab: React.FC = () => {
  // Get current user
  const user = useUser();
  
  // State for neighbor settings
  const [settings, setSettings] = useState<NeighborSettings>({
    skills: [],
    email_visible: false,
    phone_visible: false,
    address_visible: false,
    needs_visible: false
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user profile data on component mount
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('skills, email_visible, phone_visible, address_visible, needs_visible')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings({
            skills: data.skills || [],
            email_visible: data.email_visible || false,
            phone_visible: data.phone_visible || false,
            address_visible: data.address_visible || false,
            needs_visible: data.needs_visible || false
          });
        }
      } catch (error: any) {
        console.error('[NeighborSettingsTab] Error loading profile:', error);
        toast.error('Failed to load neighbor settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  /**
   * Update a boolean settings field
   */
  const updateBooleanField = (field: keyof Omit<NeighborSettings, 'skills'>, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Add a skill to the user's skill list
   */
  const addSkill = (skill: SkillCategory) => {
    if (!settings.skills.includes(skill)) {
      const newSkills = [...settings.skills, skill];
      setSettings(prev => ({ ...prev, skills: newSkills }));
    }
  };

  /**
   * Remove a skill from the user's skill list
   */
  const removeSkill = (skillToRemove: SkillCategory) => {
    const newSkills = settings.skills.filter(skill => skill !== skillToRemove);
    setSettings(prev => ({ ...prev, skills: newSkills }));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Neighborhoods Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Neighborhoods</h3>
        <UserNeighborhoods />
      </div>

      {/* Skills Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Skills & Expertise</h3>
        
        <div className="space-y-4">
          <Label>Your Skills</Label>
          
          {/* Skill selector */}
          <Select onValueChange={addSkill}>
            <SelectTrigger>
              <SelectValue placeholder="Add a skill..." />
            </SelectTrigger>
            <SelectContent>
              {skillCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Current skills display */}
          <AutoSaveField 
            fieldName="skills" 
            value={settings.skills}
            debounceMs={500}
          >
            <div className="flex flex-wrap gap-2">
              {settings.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </AutoSaveField>
          
          <p className="text-sm text-gray-500">
            Skills you've contributed will automatically appear here.
          </p>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Directory Visibility</h3>
        <p className="text-sm text-gray-500">
          Control what information is visible to other neighbors in the directory.
        </p>
        
        {/* Email visibility */}
        <AutoSaveField 
          fieldName="email_visible" 
          value={settings.email_visible}
          debounceMs={0}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Email Address</Label>
              <p className="text-sm text-gray-500">
                Show your email in the neighbors directory
              </p>
            </div>
            <Switch
              checked={settings.email_visible}
              onCheckedChange={(value) => updateBooleanField('email_visible', value)}
            />
          </div>
        </AutoSaveField>

        {/* Phone visibility */}
        <AutoSaveField 
          fieldName="phone_visible" 
          value={settings.phone_visible}
          debounceMs={0}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Phone Number</Label>
              <p className="text-sm text-gray-500">
                Show your phone number in the neighbors directory
              </p>
            </div>
            <Switch
              checked={settings.phone_visible}
              onCheckedChange={(value) => updateBooleanField('phone_visible', value)}
            />
          </div>
        </AutoSaveField>

        {/* Address visibility */}
        <AutoSaveField 
          fieldName="address_visible" 
          value={settings.address_visible}
          debounceMs={0}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Address</Label>
              <p className="text-sm text-gray-500">
                Show your address in the neighbors directory
              </p>
            </div>
            <Switch
              checked={settings.address_visible}
              onCheckedChange={(value) => updateBooleanField('address_visible', value)}
            />
          </div>
        </AutoSaveField>

        {/* Access needs visibility */}
        <AutoSaveField 
          fieldName="needs_visible" 
          value={settings.needs_visible}
          debounceMs={0}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Access & Functional Needs</Label>
              <p className="text-sm text-gray-500">
                Share any access or functional needs in the neighbors directory
              </p>
            </div>
            <Switch
              checked={settings.needs_visible}
              onCheckedChange={(value) => updateBooleanField('needs_visible', value)}
            />
          </div>
        </AutoSaveField>
      </div>
    </div>
  );
};
