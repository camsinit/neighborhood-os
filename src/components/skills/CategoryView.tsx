
import { Card, CardContent } from "@/components/ui/card";
import { SkillCategory } from "./types/skillTypes";
import { Palette, Wrench, BookOpen, GraduationCap, Heart } from "lucide-react";

// Define category information with colors and descriptions
const categoryInfo = {
  creative: {
    icon: Palette,
    description: "Share artistic talents, music lessons, writing skills, or crafting expertise",
    color: "bg-[#FDE1D3]",
    iconColor: "text-[#F97316]",
    hoverColor: "hover:bg-[#FDE1D3]/80"
  },
  trade: {
    icon: Wrench,
    description: "Exchange practical skills like repairs, gardening, or home improvement",
    color: "bg-[#E5DEFF]",
    iconColor: "text-[#8B5CF6]",
    hoverColor: "hover:bg-[#E5DEFF]/80"
  },
  technology: {
    icon: BookOpen,
    description: "Help with computers, software, digital tools, or online platforms",
    color: "bg-[#D3E4FD]",
    iconColor: "text-[#0EA5E9]",
    hoverColor: "hover:bg-[#D3E4FD]/80"
  },
  education: {
    icon: GraduationCap,
    description: "Offer tutoring, language lessons, or academic support",
    color: "bg-[#F2FCE2]",
    iconColor: "text-emerald-600",
    hoverColor: "hover:bg-[#F2FCE2]/80"
  },
  wellness: {
    icon: Heart,
    description: "Share fitness tips, nutrition advice, or wellness practices",
    color: "bg-[#FFDEE2]",
    iconColor: "text-[#D946EF]",
    hoverColor: "hover:bg-[#FFDEE2]/80"
  }
} as const;

interface CategoryViewProps {
  onCategoryClick: (category: SkillCategory) => void;
}

// Component to display skill categories in a grid
const CategoryView = ({ onCategoryClick }: CategoryViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
      {(Object.keys(categoryInfo) as SkillCategory[]).map((category) => {
        const { icon: Icon, description, color, iconColor, hoverColor } = categoryInfo[category];
        return (
          <Card 
            key={category}
            onClick={() => onCategoryClick(category)}
            className={`cursor-pointer transition-all duration-200 border-none shadow-sm ${color} ${hoverColor}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <Icon className={`h-8 w-8 ${iconColor}`} />
                <h3 className="text-lg font-semibold capitalize">{category}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryView;
