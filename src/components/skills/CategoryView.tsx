
import { Card, CardContent } from "@/components/ui/card";
import { SkillCategory } from "./types/skillTypes";
import { BookOpen, Palette, Wrench, GraduationCap, Heart } from "lucide-react";

// Object mapping categories to their respective icons and descriptions
const categoryInfo = {
  technology: {
    icon: BookOpen,
    description: "Computer skills, programming, digital tools"
  },
  creative: {
    icon: Palette,
    description: "Arts, music, crafts, writing"
  },
  trade: {
    icon: Wrench,
    description: "Repairs, construction, manual skills"
  },
  education: {
    icon: GraduationCap,
    description: "Teaching, tutoring, academic subjects"
  },
  wellness: {
    icon: Heart,
    description: "Health, fitness, mental wellbeing"
  }
} as const;

interface CategoryViewProps {
  onCategoryClick: (category: SkillCategory) => void;
}

const CategoryView = ({ onCategoryClick }: CategoryViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
      {(Object.keys(categoryInfo) as SkillCategory[]).map((category) => {
        const { icon: Icon, description } = categoryInfo[category];
        return (
          <Card 
            key={category}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onCategoryClick(category)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <Icon className="w-12 h-12 text-blue-500" />
              <h3 className="text-xl font-semibold capitalize">{category}</h3>
              <p className="text-gray-600">{description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryView;
