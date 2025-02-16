
import { Computer, Paintbrush, Wrench, GraduationCap, PersonStanding } from "lucide-react";
import { SkillCategory } from "@/components/mutual-support/types";

interface CategoryListProps {
  onCategorySelect: (category: SkillCategory) => void;
}

interface CategoryItem {
  id: SkillCategory;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  examples: string;
}

const categories: CategoryItem[] = [
  {
    id: 'technology',  // Changed from 'tech' to 'technology' to match SkillCategory type
    name: 'Technology',
    icon: Computer,
    color: '#9b87f5',
    examples: 'Web Development, Smart Phone Help, Tech Questions, App Development, Etc.'
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: Paintbrush,
    color: '#D946EF',
    examples: 'Graphic Design, Photography, Collage, Drawing, Etc.'
  },
  {
    id: 'trade',
    name: 'Trade Skills',
    icon: Wrench,
    color: '#F97316',
    examples: 'Carpentry, Plumbing, Electrical Work, Car Repair, Etc.'
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    color: '#0EA5E9',
    examples: 'Tutoring, Language Learning, Test Prep, Music Lessons, Etc.'
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: PersonStanding,
    color: '#8B5CF6',
    examples: 'Yoga, Personal Training, Nutrition, Meditation, Etc.'
  }
];

export const CategoryList = ({ onCategorySelect }: CategoryListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-8 px-0 my-0 mx-0">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className="flex items-center p-6 rounded-lg border border-gray-100 bg-white transition-all hover:scale-[1.02] shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          <div
            className="p-3 rounded-lg mr-4"
            style={{ backgroundColor: category.color }}
          >
            <category.icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-xs text-gray-600">
              {category.examples}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};
