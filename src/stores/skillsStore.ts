
/**
 * Skills store (placeholder)
 * Manages the state for skills filtering and search
 */
import { create } from 'zustand';

interface SkillsState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export const useSkillsStore = create<SkillsState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
