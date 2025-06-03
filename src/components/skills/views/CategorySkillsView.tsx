import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import SkillsList from '@/components/skills/SkillsList';
import { useSkillsStore } from '@/stores/skillsStore';

interface CategorySkillsViewProps {
  category: SkillCategory;
  onBack: () => void;
  onAddSkill: () => void;
}

const CategorySkillsView: React.FC<CategorySkillsViewProps> = ({
  category,
  onBack,
  onAddSkill
}) => {
  const { setCategory } = useSkillsStore();

  useEffect(() => {
    // Set the category in the store when the component mounts
    setCategory(category);

    // Cleanup function to reset the category when the component unmounts
    return () => {
      setCategory(undefined);
    };
  }, [category, setCategory]);

  const handleAddSkill = () => {
    onAddSkill();
  };

  if (!category) {
    return <div>No category selected.</div>;
  }

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Categories
      </Button>
      <h2 className="text-2xl font-bold mb-4">{category} Skills</h2>
      <SkillsList onAddSkill={handleAddSkill} />
    </div>
  );
};

export default CategorySkillsView;
