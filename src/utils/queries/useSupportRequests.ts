import { useQuery } from "@tanstack/react-query";
import { SupportRequest } from "@/types/localTypes";

const mockSupportRequests: SupportRequest[] = [
  // Skills-related requests
  {
    id: "1",
    title: "Python Programming Tutoring",
    description: "Experienced software developer offering Python programming lessons for beginners and intermediate learners.",
    category: "skills",
    request_type: "offer",
    support_type: "recurring",
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
    id: "2",
    title: "Guitar Lessons Needed",
    description: "Looking for someone to teach basic guitar. Can meet weekly for 1 hour sessions.",
    category: "skills",
    request_type: "need",
    support_type: "recurring",
    user_id: "2",
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "2",
      display_name: "Maria Garcia",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "3",
    title: "Photography Skills Share",
    description: "Professional photographer willing to teach basic photography and photo editing skills.",
    category: "skills",
    request_type: "offer",
    support_type: "recurring",
    user_id: "3",
    valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "3",
      display_name: "David Kim",
      avatar_url: "/placeholder.svg"
    }
  },
  // Goods-related requests
  {
    id: "4",
    title: "Garden Tools Available",
    description: "Have various gardening tools available to borrow - spades, pruning shears, wheelbarrow, etc.",
    category: "goods",
    request_type: "offer",
    support_type: "recurring",
    user_id: "4",
    valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    profiles: {
      id: "4",
      display_name: "Emma Thompson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "7",
    title: "Fresh Homegrown Vegetables",
    description: "Sharing excess produce from my garden - tomatoes, cucumbers, and herbs available weekly.",
    category: "goods",
    request_type: "offer",
    support_type: "recurring",
    user_id: "7",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f",
    profiles: {
      id: "7",
      display_name: "Michael Chen",
      avatar_url: "/placeholder.svg"
    }
  },
  // Care-related requests
  {
    id: "5",
    title: "Pet Sitting Services",
    description: "Looking for someone to feed my cat and change litter box while I'm away next weekend.",
    category: "care",
    request_type: "need",
    support_type: "one-time",
    user_id: "5",
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    profiles: {
      id: "5",
      display_name: "Sarah Wilson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "6",
    title: "Elderly Companionship",
    description: "Retired nurse offering companionship and basic care for elderly. Available weekday afternoons.",
    category: "care",
    request_type: "offer",
    support_type: "recurring",
    user_id: "6",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: "https://images.unsplash.com/photo-1517022812141-23620dba5c23",
    profiles: {
      id: "6",
      display_name: "Patricia Brown",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "8",
    title: "After-School Care Support",
    description: "Experienced teacher available for after-school care and homework help. Ages 6-12.",
    category: "care",
    request_type: "offer",
    support_type: "recurring",
    user_id: "8",
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "8",
      display_name: "Robert Martinez",
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
