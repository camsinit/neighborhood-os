
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSkillsStore } from '@/stores/skillsStore';
import { highlightItem } from '@/utils/highlight';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * Custom hook for managing Skills page state and URL parameters
 * 
 * This hook centralizes all the state management and URL parameter handling
 * for the Skills page, making the main component cleaner and more focused.
 */
export function useSkillsPageState() {
  // Get search parameters from URL
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract all relevant URL parameters
  const view = searchParams.get('view') || 'offers';
  const category = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';
  const action = searchParams.get('action');
  
  // Local state to manage dialog
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(action === 'create');
  const [dialogMode, setDialogMode] = useState<'offer' | 'request'>('offer');
  
  const { setSearchQuery } = useSkillsStore();
  
  // Set up search from URL params
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);
  
  // Handle direct links to specific skills
  useEffect(() => {
    const skillId = searchParams.get('skillId');
    if (skillId) {
      highlightItem('skill', skillId);
    }
  }, [searchParams]);
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', value);
    setSearchParams(newParams);
  };
  
  // Handle category changes
  const handleCategoryChange = (newCategory: SkillCategory | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set('category', newCategory);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };
  
  // Handle search changes
  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('q', value);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };
  
  // Open skill dialog with specified mode
  const handleOpenSkillDialog = (mode: 'offer' | 'request') => {
    setDialogMode(mode);
    setIsSkillDialogOpen(true);
    
    // Update URL to reflect the action
    const newParams = new URLSearchParams(searchParams);
    newParams.set('action', 'create');
    setSearchParams(newParams);
  };
  
  // Close skill dialog and update URL
  const handleCloseSkillDialog = () => {
    setIsSkillDialogOpen(false);
    
    // Remove the action parameter from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    setSearchParams(newParams);
  };
  
  // Handle dialog submission
  const handleSkillAdded = () => {
    setIsSkillDialogOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    setSearchParams(newParams);
  };

  // Convert string category to SkillCategory type or undefined
  const getTypedCategory = (categoryString: string | null): SkillCategory | undefined => {
    if (!categoryString) return undefined;
    return categoryString as SkillCategory;
  };
  
  return {
    view,
    category,
    searchQuery,
    isSkillDialogOpen,
    dialogMode,
    handleTabChange,
    handleCategoryChange,
    handleSearchChange,
    handleOpenSkillDialog,
    handleCloseSkillDialog,
    handleSkillAdded,
    getTypedCategory
  };
}
