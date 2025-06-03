
/**
 * Skills store - Enhanced to support category management
 * Manages the state for skills filtering, search, and category selection
 */
import { create } from 'zustand';
import { SkillCategory } from '@/components/skills/types/skillTypes';

interface SkillsState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: SkillCategory | undefined;
  setCategory: (category: SkillCategory | undefined) => void;
}

export const useSkillsStore = create<SkillsState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: undefined,
  setCategory: (category) => set({ selectedCategory: category }),
}));
