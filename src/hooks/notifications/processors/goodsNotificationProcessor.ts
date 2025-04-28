
/**
 * This file handles the processing of goods notifications
 * It contains utility functions for transforming goods notification data
 */
import { BaseNotification, ProfileData } from "../types";

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
      user_id: item.user_id || "unknown",
      title: item.title,
      content_type: "goods_exchange",
      content_id: item.id,
      notification_type: "goods",
      created_at: item.created_at,
      updated_at: item.created_at, // Fallback if no updated_at
      is_read: item.is_read,
      is_archived: item.is_archived,
      context: {
        contextType: item.request_type === "offer" ? "goods_offer" : "goods_request",
        neighborName: userProfile.display_name || null,
        avatarUrl: userProfile.avatar_url || null
      }
    };
  });
};
