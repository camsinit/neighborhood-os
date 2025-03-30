
import { supabase } from "@/integrations/supabase/client";

// Updated to include new tables for the new notification types
type TableName = "safety_updates" | "events" | "support_requests" | "skill_sessions" | "goods_exchange" | "neighborhood_members";

// Updated to include new notification types
export const getTableName = (
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors"
): TableName => {
  switch (type) {
    case "safety":
      return "safety_updates";
    case "event":
      return "events";
    case "support":
      return "support_requests";
    case "skills":
      return "skill_sessions";
    case "goods":
      return "goods_exchange";
    case "neighbors":
      return "neighborhood_members";
  }
};

// Updated to include new notification types
export const markAsRead = async (
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors", 
  itemId: string
) => {
  const table = getTableName(type);
  await supabase
    .from(table)
    .update({ is_read: true })
    .eq('id', itemId);
};

// Updated to include new notification types
export const archiveNotification = async (
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors", 
  itemId: string
) => {
  const table = getTableName(type);
  await supabase
    .from(table)
    .update({ is_archived: true })
    .eq('id', itemId);
};
