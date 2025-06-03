
import { Card, CardContent } from "@/components/ui/card";
import { SkillCategory } from "./types/skillTypes";
import { Brain, Shield, Briefcase, Wrench, Heart, GraduationCap } from "lucide-react";

// Updated to use the 6 standardized onboarding categories
const categoryInfo = {
  technology: {
    icon: Brain,
    description: "Help with computers, software, digital tools, or online platforms",
    borderColor: "border-[#221F26]",
    iconColor: "text-[#221F26]",
    hoverColor: "hover:bg-[#D3E4FD]/10"
  },
  emergency: {
    icon: Shield,
    description: "Share safety skills, emergency response, or first aid knowledge",
    borderColor: "border-[#D946EF]",
    iconColor: "text-[#D946EF]",
    hoverColor: "hover:bg-[#FFDEE2]/10"
  },
  professional: {
    icon: Briefcase,
    description: "Offer business advice, legal guidance, or professional services",
    borderColor: "border-[#8B5CF6]",
    iconColor: "text-[#8B5CF6]",
    hoverColor: "hover:bg-[#E5DEFF]/10"
  },
  maintenance: {
    icon: Wrench,
    description: "Exchange practical skills like repairs, gardening, or home improvement",
    borderColor: "border-[#F97316]",
    iconColor: "text-[#F97316]",
    hoverColor: "hover:bg-[#FDE1D3]/10"
  },
  care: {
    icon: Heart,
    description: "Share wellness tips, fitness advice, or caregiving support",
    borderColor: "border-[#D946EF]",
    iconColor: "text-[#D946EF]",
    hoverColor: "hover:bg-[#FFDEE2]/10"
  },
  education: {
    icon: GraduationCap,
    description: "Offer tutoring, language lessons, or academic support",
    borderColor: "border-emerald-600",
    iconColor: "text-emerald-600",
    hoverColor: "hover:bg-[#F2FCE2]/10"
  }
} as const;

interface CategoryViewProps {
  onCategoryClick: (category: SkillCategory) => void;
}

// Component to display skill categories in a grid
const CategoryView = ({ onCategoryClick }: CategoryViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
      {(Object.keys(categoryInfo) as SkillCategory[]).map((category) => {
        const { icon: Icon, description, borderColor, iconColor, hoverColor } = categoryInfo[category];
        return (
          <Card 
            key={category}
            onClick={() => onCategoryClick(category)}
            className={`cursor-pointer transition-all duration-200 border-2 ${borderColor} bg-white shadow-sm ${hoverColor}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Icon className={`h-6 w-6 mt-0.5 ${iconColor} shrink-0`} />
                <div className="space-y-1">
                  <h3 className="text-base font-medium capitalize">{category}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryView;
