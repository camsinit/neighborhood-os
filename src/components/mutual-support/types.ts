export type Category = {
  icon: any;
  label: string;
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
};