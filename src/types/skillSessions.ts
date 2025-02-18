
export type SkillSessionStatus = 'pending_provider_times' | 'pending_requester_confirmation' | 'confirmed' | 'expired' | 'completed';

export interface TimeSlot {
  id: string;
  session_id: string;
  proposed_time: string;
  created_at: string;
  is_selected: boolean;
}

export interface SkillSession {
  id: string;
  skill_id: string;
  requester_id: string;
  provider_id: string;
  requester_availability: {
    weekday: boolean;
    weekend: boolean;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  status: SkillSessionStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  event_id?: string;
}
