
export type Category = {
  icon: any;
  label: string;
};

export type ViewType = 'skills' | 'goods' | 'care' | null;

export type SkillCategory = 'technology' | 'creative' | 'trade' | 'education' | 'wellness';

export type CareCategory = 'transportation' | 'household' | 'medical' | 'childcare' | 'eldercare' | 'petcare' | 'mealprep' | 'general';

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
  skill_category?: SkillCategory | null;
  care_category?: CareCategory | null;
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
  category: string;
  supportType: string;
  imageUrl: string | null;
  skillCategory?: SkillCategory;
  careCategory?: CareCategory;
  originalRequest: SupportRequestFromDB;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  isClaimed?: boolean;
};
