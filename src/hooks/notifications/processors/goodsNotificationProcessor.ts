
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
    const contextType = item.request_type === "offer" ? "goods_offer" : "goods_request";
    
    return {
      id: item.id,
      user_id: item.user_id || "unknown",
      title: item.title,
      content_type: "goods_exchange",
      content_id: item.id,
      notification_type: "goods",
      action_type: contextType === "goods_offer" ? "view" : "help",
      action_label: contextType === "goods_offer" ? "View Offer" : "Help Out",
      created_at: item.created_at,
      updated_at: item.created_at || item.created_at,
      is_read: item.is_read || false,
      is_archived: item.is_archived || false,
      context: {
        contextType: contextType,
        neighborName: profile?.display_name || null,
        avatarUrl: profile?.avatar_url || null,
        goodsCategory: item.goods_category || item.category,
        condition: item.condition,
        urgency: item.urgency,
        summary: contextType === "goods_offer" 
          ? `${profile?.display_name || "Someone"} is offering: ${item.title}`
          : `${profile?.display_name || "Someone"} is looking for: ${item.title}`
      }
    };
  });
};
