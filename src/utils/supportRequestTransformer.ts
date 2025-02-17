
import { SupportItem, SupportRequestFromDB, SkillCategory, CareCategory } from "@/components/mutual-support/types";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

const isValidSkillCategory = (category: string | null | undefined): category is SkillCategory => {
  const validCategories = ['technology', 'creative', 'trade', 'education', 'wellness'];
  return !!category && validCategories.includes(category);
};

const isValidCareCategory = (category: string | null | undefined): category is CareCategory => {
  const validCategories = ['transportation', 'household', 'medical', 'childcare', 'eldercare', 'petcare', 'mealprep', 'general'];
  return !!category && validCategories.includes(category);
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

export const transformRequest = (request: any): SupportItem => {
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

  let careCategory: CareCategory | undefined;
  if (isValidCareCategory(request.care_category)) {
    careCategory = request.care_category;
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
    category: request.category,
    supportType: request.support_type || 'immediate',
    imageUrl: request.image_url,
    skillCategory,
    careCategory,
    originalRequest: request,
    profiles: request.profiles
  };
};
