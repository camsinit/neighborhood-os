
import { Computer, PenTool, Wrench, GraduationCap, Leaf } from "lucide-react";
import { SkillCategory } from "@/components/mutual-support/types";

interface CategoryListProps {
  onCategorySelect: (category: SkillCategory) => void;
}

interface CategoryItem {
  id: SkillCategory;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const categories: CategoryItem[] = [
  {
    id: 'tech',
    name: 'Technology',
    icon: Computer,
    color: '#9b87f5',
    bgColor: '#F1F0FB',
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: PenTool,
    color: '#D946EF',
    bgColor: '#FFDEE2',
  },
  {
    id: 'trade',
    name: 'Trade Skills',
    icon: Wrench,
    color: '#F97316',
    bgColor: '#FDE1D3',
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    color: '#0EA5E9',
    bgColor: '#D3E4FD',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: Leaf,
    color: '#8B5CF6',
    bgColor: '#E5DEFF',
  },
];

export const CategoryList = ({ onCategorySelect }: CategoryListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className="flex items-center p-6 rounded-lg transition-all hover:scale-[1.02]"
          style={{ backgroundColor: category.bgColor }}
        >
          <div 
            className="p-3 rounded-lg mr-4"
            style={{ backgroundColor: category.color }}
          >
            <category.icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600">
              Browse {category.name.toLowerCase()} skills
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};
