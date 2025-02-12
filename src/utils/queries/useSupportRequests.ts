
import { useQuery } from "@tanstack/react-query";
import { SupportRequest } from "@/types/localTypes";

const mockSupportRequests: SupportRequest[] = [
  // Skills-related requests
  {
    id: "1",
    title: "Python Programming & Web Development",
    description: "Experienced software developer offering Python programming and web development mentoring. Can help with projects, debugging, and best practices.",
    category: "skills",
    request_type: "offer",
    support_type: "recurring",
    user_id: "1",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    skill_category: "tech",
    profiles: {
      id: "1",
      display_name: "Alex Chen",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "2",
    title: "Guitar & Music Theory",
    description: "Professional musician offering guitar lessons and music theory tutoring. All skill levels welcome. Can teach acoustic, electric, and bass guitar.",
    category: "skills",
    request_type: "offer",
    support_type: "recurring",
    user_id: "2",
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    skill_category: "creative",
    profiles: {
      id: "2",
      display_name: "Maria Garcia",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "3",
    title: "Photography & Photo Editing",
    description: "Professional photographer offering photography workshops and photo editing training. Learn composition, lighting, and post-processing techniques.",
    category: "skills",
    request_type: "offer",
    support_type: "recurring",
    user_id: "3",
    valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    skill_category: "creative",
    profiles: {
      id: "3",
      display_name: "David Kim",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "6",
    title: "Home Repair & Maintenance",
    description: "Licensed contractor offering hands-on training in basic home repairs and maintenance. Learn practical skills for taking care of your home.",
    category: "skills",
    request_type: "offer",
    support_type: "recurring",
    user_id: "6",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    is_archived: null,
    is_read: null,
    image_url: null,
    skill_category: "trade",
    profiles: {
      id: "6",
      display_name: "Patricia Brown",
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
