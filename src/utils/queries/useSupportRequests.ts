
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
    title: "Garden Tools to Share",
    description: "Have various gardening tools available to borrow - spades, pruning shears, wheelbarrow, etc.",
    category: "goods",
    request_type: "offer",
    support_type: "recurring",
    user_id: "4",
    valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "4",
      display_name: "Emma Thompson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "9",
    title: "Kitchen Appliances Available",
    description: "Bread maker, slow cooker, and food processor available to borrow. All in excellent condition.",
    category: "goods",
    request_type: "offer",
    support_type: "recurring",
    user_id: "9",
    valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "9",
      display_name: "James Wilson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "10",
    title: "Children's Books Collection",
    description: "Large collection of children's books (ages 3-12) available for lending. Over 50 titles.",
    category: "goods",
    request_type: "offer",
    support_type: "recurring",
    user_id: "10",
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "10",
      display_name: "Lisa Chen",
      avatar_url: "/placeholder.svg"
    }
  },
  // Care-related requests
  {
    id: "5",
    title: "Need Pet Sitter for Weekend",
    description: "Looking for someone to feed my cat and change litter box while I'm away next weekend.",
    category: "care",
    request_type: "need",
    support_type: "one-time",
    user_id: "5",
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "5",
      display_name: "Sarah Wilson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "6",
    title: "Elderly Companion Available",
    description: "Retired nurse offering companionship and basic care for elderly. Available weekday afternoons.",
    category: "care",
    request_type: "offer",
    support_type: "recurring",
    user_id: "6",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "6",
      display_name: "Patricia Brown",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "11",
    title: "After-School Care Needed",
    description: "Looking for someone to watch two children (ages 8 and 10) after school, 3-6pm on weekdays.",
    category: "care",
    request_type: "need",
    support_type: "recurring",
    user_id: "11",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "11",
      display_name: "Rachel Martinez",
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
