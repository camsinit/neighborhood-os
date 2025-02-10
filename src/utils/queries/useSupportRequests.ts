
import { useQuery } from "@tanstack/react-query";
import { SupportRequest } from "@/types/localTypes";

const mockSupportRequests: SupportRequest[] = [
  {
    id: "1",
    title: "Need Help Moving Furniture",
    description: "Looking for assistance moving a couch and dining table this weekend. Can provide refreshments!",
    category: "physical",
    request_type: "need",
    support_type: "one-time",
    user_id: "1",
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "1",
      display_name: "Sarah Johnson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "2",
    title: "Offering Math Tutoring",
    description: "Retired math teacher available for tutoring students grade 6-12. Flexible schedule.",
    category: "education",
    request_type: "offer",
    support_type: "recurring",
    user_id: "2",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "2",
      display_name: "Robert Chen",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "3",
    title: "Garden Tools to Share",
    description: "Have various gardening tools available to borrow - spades, pruning shears, wheelbarrow, etc.",
    category: "goods",
    request_type: "offer",
    support_type: "recurring",
    user_id: "3",
    valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "3",
      display_name: "Maria Garcia",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "4",
    title: "Need Pet Sitter for Weekend",
    description: "Looking for someone to feed my cat and change litter box while I'm away next weekend.",
    category: "care",
    request_type: "need",
    support_type: "one-time",
    user_id: "4",
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "4",
      display_name: "James Wilson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "5",
    title: "Tech Support Available",
    description: "IT professional offering help with computer problems, wifi setup, and basic troubleshooting.",
    category: "technical",
    request_type: "offer",
    support_type: "recurring",
    user_id: "5",
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "5",
      display_name: "David Kim",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "6",
    title: "Need Ride to Medical Appointment",
    description: "Seeking transportation to doctor's appointment next Tuesday at 2pm. Can compensate for gas.",
    category: "transportation",
    request_type: "need",
    support_type: "one-time",
    user_id: "6",
    valid_until: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    profiles: {
      id: "6",
      display_name: "Emma Thompson",
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

