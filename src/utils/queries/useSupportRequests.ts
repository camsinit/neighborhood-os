
import { useQuery } from "@tanstack/react-query";
import { SupportRequest } from "@/types/localTypes";

const mockSupportRequests: SupportRequest[] = [
  {
    id: "1",
    title: "Need Help",
    description: "Test support request",
    category: "general",
    request_type: "assistance",
    support_type: "one-time",
    user_id: "1",
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: false,
    is_read: false,
    image_url: null,
    profiles: {
      id: "1",
      display_name: "Test User",
      avatar_url: "/placeholder.svg"
    }
  }
];

export const useSupportRequests = () => {
  return useQuery({
    queryKey: ["support-requests"],
    queryFn: async () => {
      return mockSupportRequests;
    },
  });
};
