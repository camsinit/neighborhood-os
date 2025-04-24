
/**
 * This file handles the processing of goods notifications
 * It contains utility functions for transforming goods notification data
 */
import { BaseNotification } from "../types";
import { ProfileData } from "../types";

/**
 * Processes goods exchange notifications
 * 
 * @param goodsItems - The goods exchange data from the database
 * @param profilesMap - Map of user IDs to profile data
 * @returns An array of processed notifications
 */
export const processGoodsNotifications = (
  goodsItems: any[],
  profilesMap: Record<string, ProfileData>
): BaseNotification[] => {
  console.log("[processGoodsNotifications] Processing goods notifications:", goodsItems.length);
  
  return goodsItems.map(item => {
    const userProfile = profilesMap[item.user_id] || { display_name: null, avatar_url: null };
    
    return {
      id: item.id,
      title: item.title,
      type: "goods" as const,
      created_at: item.created_at,
      is_read: item.is_read,
      is_archived: item.is_archived,
      context: {
        contextType: item.request_type === "offer" ? "goods_offer" as const : "goods_request" as const,
        neighborName: userProfile.display_name || null,
        avatarUrl: userProfile.avatar_url || null
      }
    };
  });
};
