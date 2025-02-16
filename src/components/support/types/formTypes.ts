
export type SupportRequestFormData = {
  title: string;
  description: string;
  category: string;
  requestType: "need" | "offer";
  validUntil: string;
  supportType: "immediate" | "ongoing";
  imageUrl?: string | null;
  skill_category?: string;
  care_category?: string;
};

export type SupportRequestFormProps = {
  onClose: () => void;
  initialValues?: Partial<SupportRequestFormData>;
  mode?: 'create' | 'edit';
  requestId?: string;
  initialRequestType?: "need" | "offer" | null;
};
