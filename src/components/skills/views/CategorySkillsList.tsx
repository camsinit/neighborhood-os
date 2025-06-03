
import React from 'react';
import { Loader2 } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { useCategorySkills } from './hooks/useCategorySkills';
import { useSkillActions } from './hooks/useSkillActions';
import SkillGroupCard from './components/SkillGroupCard';
import SkillEditDialog from './components/SkillEditDialog';
import SkillDeleteConfirmation from './components/SkillDeleteConfirmation';

/**
 * CategorySkillsList - Main component for displaying skills in a category
 * 
 * This component displays skills as a simple list with skill names on the left
 * and profile images (or stacks for multiple offers) on the right.
 * Shows edit/delete buttons for user's own skills, request button for others.
 */
interface CategorySkillsListProps {
  selectedCategory: SkillCategory;
}

const CategorySkillsList: React.FC<CategorySkillsListProps> = ({
  selectedCategory
}) => {
  // Fetch skills data for the selected category
  const {
    data: skillsData,
    isLoading,
    error,
    refetch
  } = useCategorySkills(selectedCategory);

  // Manage skill actions (edit/delete) state and handlers
  const {
    editDialogOpen,
    editTitle,
    setEditTitle,
    openEditDialog,
    closeEditDialog,
    saveEdit,
    deletePopoverOpen,
    skillToDelete,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDelete,
    isUpdating
  } = useSkillActions();

  /**
   * Handle successful edit - refetch data to update UI
   */
  const handleEditSuccess = () => {
    refetch();
  };

  /**
   * Handle successful delete - refetch data to update UI
   */
  const handleDeleteSuccess = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading skills...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Error loading skills. Please try again.</p>
      </div>
    );
  }

  // Empty state
  if (!skillsData || skillsData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No skills found in this category</p>
      </div>
    );
  }

  return (
    <>
      {/* Skills list */}
      <div className="space-y-2">
        {skillsData.map((skillGroup, index) => (
          <SkillDeleteConfirmation
            key={index}
            open={deletePopoverOpen}
            onOpenChange={() => {}}
            skillTitle={skillToDelete?.title}
            onConfirm={() => confirmDelete(handleDeleteSuccess)}
            onCancel={closeDeleteConfirmation}
            isUpdating={isUpdating}
          >
            <SkillGroupCard
              skillGroup={skillGroup}
              selectedCategory={selectedCategory}
              isUpdating={isUpdating}
              onEdit={openEditDialog}
              onDelete={openDeleteConfirmation}
            />
          </SkillDeleteConfirmation>
        ))}
      </div>

      {/* Edit Skill Dialog */}
      <SkillEditDialog
        open={editDialogOpen}
        onOpenChange={closeEditDialog}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        onSave={() => saveEdit(handleEditSuccess)}
        onCancel={closeEditDialog}
        isUpdating={isUpdating}
      />
    </>
  );
};

export default CategorySkillsList;
