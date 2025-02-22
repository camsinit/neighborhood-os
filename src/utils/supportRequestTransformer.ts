
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

const isValidSkillCategory = (category: string | null | undefined): category is SkillCategory => {
  const validCategories: SkillCategory[] = ['technology', 'creative', 'trade', 'education', 'wellness'];
  return !!category && validCategories.includes(category as SkillCategory);
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);

  if (hours < 24) {
    return `${hours}h`;
  } else if (days < 7) {
    return `${days}d`;
  } else if (weeks < 4) {
    return `${weeks}w`;
  } else {
    return `${months}m`;
  }
};

export interface TransformedSkill {
  type: "Needs Help" | "Offering Help";
  title: string;
  description: string;
  timeAgo: string;
  borderColor: string;
  tagColor: string;
  tagBg: string;
  requestType: string;
  skillCategory?: SkillCategory;
  originalRequest: any;
}

export const transformSkill = (request: any): TransformedSkill => {
  const type = request.request_type === 'need' ? "Needs Help" : "Offering Help";
  const colors = type === "Needs Help" 
    ? {
        borderColor: "border-orange-500",
        tagColor: "text-orange-700",
        tagBg: "bg-orange-100",
      }
    : {
        borderColor: "border-green-500",
        tagColor: "text-green-700",
        tagBg: "bg-green-100",
      };

  let skillCategory: SkillCategory | undefined;
  if (isValidSkillCategory(request.skill_category)) {
    skillCategory = request.skill_category;
  }

  return {
    type,
    title: request.title,
    description: request.description || "",
    timeAgo: getTimeAgo(new Date(request.created_at)),
    borderColor: colors.borderColor,
    tagColor: colors.tagColor,
    tagBg: colors.tagBg,
    requestType: request.request_type,
    skillCategory,
    originalRequest: request,
  };
};
