
import { useQuery } from "@tanstack/react-query";
import { SafetyUpdate } from "@/types/localTypes";

const mockSafetyUpdates: SafetyUpdate[] = [
  {
    id: "1",
    title: "Test Safety Update",
    description: "This is a test safety update",
    type: "alert",
    author_id: "1",
    created_at: new Date().toISOString(),
    profiles: {
      id: "1",
      display_name: "Test User",
      avatar_url: "/placeholder.svg"
    }
  }
];

export const useSafetyUpdates = () => {
  return useQuery({
    queryKey: ["safety-updates"],
    queryFn: async () => {
      return mockSafetyUpdates;
    },
  });
};
