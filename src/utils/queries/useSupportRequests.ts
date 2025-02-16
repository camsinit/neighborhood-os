
import { useQuery } from "@tanstack/react-query";
import { SupportRequest } from "@/types/localTypes";

const mockSupportRequests: SupportRequest[] = [
  // Mock goods needs
  {
    id: "1",
    title: "Kitchen Mixer Needed",
    description: "Looking for a stand mixer for baking. Temporary need for upcoming community bake sale.",
    category: "goods",
    request_type: "need",
    support_type: "immediate",
    user_id: "1",
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "1",
      display_name: "Alex Chen",
      avatar_url: "/placeholder.svg"
    }
  },
  // Add some mock skills data for testing
  {
    id: "6",
    title: "Python Programming Lessons",
    description: "Offering beginner to intermediate Python programming lessons",
    category: "skills",
    request_type: "offer",
    support_type: "ongoing",
    skill_category: "technology",
    user_id: "1",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "1",
      display_name: "Alex Chen",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "7",
    title: "Guitar Lessons",
    description: "Offering acoustic guitar lessons for beginners",
    category: "skills",
    request_type: "offer",
    support_type: "ongoing",
    skill_category: "education",
    user_id: "1",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "1",
      display_name: "Alex Chen",
      avatar_url: "/placeholder.svg"
    }
  }
];

export const useSupportRequests = () => {
  return useQuery({
    queryKey: ["support-requests"],
    queryFn: () => Promise.resolve(mockSupportRequests),
  });
};
