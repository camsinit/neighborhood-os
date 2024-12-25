import { SupportItem, SupportRequestFromDB } from "@/components/mutual-support/types";
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

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

export const transformRequest = (request: SupportRequestFromDB): SupportItem => {
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

  return {
    type,
    title: request.title,
    description: request.description || "",
    timeAgo: getTimeAgo(new Date(request.created_at)),
    borderColor: colors.borderColor,
    tagColor: colors.tagColor,
    tagBg: colors.tagBg,
    requestType: request.category,
    supportType: request.support_type,
    imageUrl: request.image_url,
    originalRequest: request,
  };
};