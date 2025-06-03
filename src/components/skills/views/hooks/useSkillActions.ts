
import { useState } from 'react';
import { useSkillUpdate } from '@/hooks/skills/useSkillUpdate';

/**
 * Hook to manage skill edit and delete actions
 * 
 * This hook provides state management and handlers for editing and deleting skills,
 * including dialog/popover state management.
 */
export const useSkillActions = () => {
  const { updateSkillTitle, deleteSkill, isLoading: isUpdating } = useSkillUpdate();
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{ id: string; title: string } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // State for delete confirmation popover
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<{ id: string; title: string } | null>(null);

  /**
   * Open the edit dialog for a specific skill
   */
  const openEditDialog = (skillId: string, currentTitle: string) => {
    setEditingSkill({ id: skillId, title: currentTitle });
    setEditTitle(currentTitle);
    setEditDialogOpen(true);
  };

  /**
   * Close the edit dialog and reset state
   */
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingSkill(null);
    setEditTitle('');
  };

  /**
   * Save the edited skill title
   */
  const saveEdit = async (onSuccess?: () => void) => {
    if (!editingSkill || !editTitle.trim()) {
      return { success: false, error: 'Please enter a valid skill title' };
    }

    const success = await updateSkillTitle(editingSkill.id, editTitle.trim());
    if (success) {
      closeEditDialog();
      onSuccess?.();
    }
    return { success };
  };

  /**
   * Open delete confirmation for a specific skill
   */
  const openDeleteConfirmation = (skillId: string, skillTitle: string) => {
    setSkillToDelete({ id: skillId, title: skillTitle });
    setDeletePopoverOpen(true);
  };

  /**
   * Close delete confirmation and reset state
   */
  const closeDeleteConfirmation = () => {
    setDeletePopoverOpen(false);
    setSkillToDelete(null);
  };

  /**
   * Confirm and execute the skill deletion
   */
  const confirmDelete = async (onSuccess?: () => void) => {
    if (!skillToDelete) return { success: false };

    const success = await deleteSkill(skillToDelete.id, skillToDelete.title);
    if (success) {
      closeDeleteConfirmation();
      onSuccess?.();
    }
    return { success };
  };

  return {
    // Edit state and actions
    editDialogOpen,
    editingSkill,
    editTitle,
    setEditTitle,
    openEditDialog,
    closeEditDialog,
    saveEdit,
    
    // Delete state and actions
    deletePopoverOpen,
    skillToDelete,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDelete,
    
    // Shared state
    isUpdating
  };
};
