
/**
 * This file handles the processing of goods notifications
 * It contains utility functions for transforming goods notification data
 */
import { BaseNotification, ProfileData } from "../types";

/**
 * Processes goods exchange notifications
 * 
 * @param goodsItems - The goods exchange items data from the database
 * @param profilesMap - Map of user profiles by ID
 * @returns An array of processed notifications
 */
export const processGoodsNotifications = (
  goodsItems: any[],
  profilesMap: Record<string, ProfileData> = {}
): BaseNotification[] => {
  console.log("[processGoodsNotifications] Processing goods notifications:", goodsItems.length);
  
  return goodsItems.map(item => {
    const profile = profilesMap[item.user_id];
    
    return {
      id: item.id,
      user_id: item.user_id || "unknown",
      title: item.title,
      content_type: "goods_exchange",
      content_id: item.id,
      notification_type: "goods", // This matches the HighlightableItemType
      created_at: item.created_at,
      updated_at: item.created_at || item.created_at, // Ensure updated_at is present
      is_read: item.is_read || false,
      is_archived: item.is_archived || false,
      context: {
        contextType: item.request_type === "offer" ? "goods_offer" : "goods_request",
        neighborName: profile?.display_name || null,
        avatarUrl: profile?.avatar_url || null
      }
    };
  });
};
