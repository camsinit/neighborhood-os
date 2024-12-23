import { formatDistanceToNow } from "date-fns";
import { SupportItem, SupportRequestFromDB } from "@/components/mutual-support/types";

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
    description: request.description,
    timeAgo: formatDistanceToNow(new Date(request.created_at), { addSuffix: true }),
    borderColor: colors.borderColor,
    tagColor: colors.tagColor,
    tagBg: colors.tagBg,
    requestType: request.type,
    imageUrl: request.image_url,
    originalRequest: request,
  };
};