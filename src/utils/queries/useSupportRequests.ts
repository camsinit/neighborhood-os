
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
  {
    id: "2",
    title: "Winter Coats for Kids",
    description: "Need warm winter coats for two growing kids, sizes 6 and 8. Would greatly appreciate any help.",
    category: "goods",
    request_type: "need",
    support_type: "immediate",
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
  // Mock goods offers
  {
    id: "3",
    title: "Free Moving Boxes",
    description: "Just finished moving and have about 20 sturdy boxes of various sizes. All clean and in good condition. Available for pickup this weekend.",
    category: "goods",
    request_type: "offer",
    support_type: "immediate",
    user_id: "1",
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
    id: "4",
    title: "Extra Garden Tools",
    description: "Offering extra gardening tools: 2 trowels, pruning shears, and a watering can. All in good condition.",
    category: "goods",
    request_type: "offer",
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
  {
    id: "5",
    title: "Baby Clothes (0-6 months)",
    description: "Gently used baby clothes, mostly 0-6 months. Mix of onesies, sleepers, and outfits. All clean and in great condition.",
    category: "goods",
    request_type: "offer",
    support_type: "immediate",
    user_id: "1",
    valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
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
