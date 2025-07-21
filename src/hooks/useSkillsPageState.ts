
import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing Skills page state
 * 
 * Centralizes all state management for the Skills page including:
 * - View/tab state (offers, requests, mine)
 * - Category selection
 * - Search functionality
 * - Dialog state
 * - URL search parameters
 */
export const useSkillsPageState = () => {
  // URL search parameters for view, category, and search
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current view from URL params (offers, requests, mine)
  const view = searchParams.get('view') || 'offers';
  
  // Get selected category from URL params
  const category = searchParams.get('category');
  
  // Get search query from URL params
  const searchQuery = searchParams.get('search') || '';
  
  // Dialog state for adding skills
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  
  // Sheet state for requesting skills (NEW)
  const [isSkillRequestSheetOpen, setIsSkillRequestSheetOpen] = useState(false);
  
  // Reference for the search input field
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  return {
    // View and navigation state
    view,
    category,
    searchQuery,
    searchParams,
    setSearchParams,
    
    // Dialog and sheet state
    isSkillDialogOpen,
    setIsSkillDialogOpen,
    isSkillRequestSheetOpen,        // NEW: Export skill request sheet state
    setIsSkillRequestSheetOpen,     // NEW: Export skill request sheet setter
    
    // Refs
    searchInputRef,
  };
};
