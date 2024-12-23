export type Category = {
  icon: any;
  label: string;
};

export type SupportRequestFromDB = {
  id: string;
  type: string;
  request_type: string;
  title: string;
  description: string;
  user_id: string;
  valid_until: string;
  status: string;
  created_at: string;
  image_url: string | null;
  profiles: {
    display_name: string;
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
  imageUrl: string | null;
  originalRequest: SupportRequestFromDB;
};