
import { supabase } from "@/integrations/supabase/client";

type TableName = "safety_updates" | "events" | "support_requests" | "skill_sessions";

export const getTableName = (type: "safety" | "event" | "support" | "skills"): TableName => {
  switch (type) {
    case "safety":
      return "safety_updates";
    case "event":
      return "events";
    case "support":
      return "support_requests";
    case "skills":
      return "skill_sessions";
  }
};

export const markAsRead = async (type: "safety" | "event" | "support" | "skills", itemId: string) => {
  const table = getTableName(type);
  await supabase
    .from(table)
    .update({ is_read: true })
    .eq('id', itemId);
};

export const archiveNotification = async (type: "safety" | "event" | "support" | "skills", itemId: string) => {
  const table = getTableName(type);
  await supabase
    .from(table)
    .update({ is_archived: true })
    .eq('id', itemId);
};
