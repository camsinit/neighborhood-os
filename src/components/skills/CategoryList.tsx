
import { Button } from "@/components/ui/button";
import { SkillCategory } from "./types/skillTypes";

interface CategoryListProps {
  selectedCategory: SkillCategory | null;
  onSelectCategory: (category: SkillCategory | null) => void;
}

const CategoryList = ({ selectedCategory, onSelectCategory }: CategoryListProps) => {
  const categories: SkillCategory[] = ['technology', 'creative', 'trade', 'education', 'wellness'];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => onSelectCategory(category)}
          className="capitalize"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryList;
