
export type Category = {
  icon: any;
  label: string;
};

export type SupportRequestFromDB = {
  id: string;
  category: string;
  request_type: string;
  title: string;
  description: string | null;
  user_id: string;
  valid_until: string;
  created_at: string;
  image_url: string | null;
  support_type: string | null;
  is_archived: boolean | null;
  is_read: boolean | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
};

export type SupportItem = {
  type: "Needs Help" | "Offering Help";
  title: string;
  description: string;
  timeAgo: string;
  borderColor: string;
  tagColor: string;
  tagBg: string;
  requestType: string;
  supportType: string;
  imageUrl: string | null;
  originalRequest: SupportRequestFromDB;
};

