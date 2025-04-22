
import { ProfileData } from "../types";

/**
 * Creates a map from user ID to profile data.
 */
export const createProfilesMap = (
  profiles: ProfileData[] = []
): Record<string, ProfileData> => {
  return profiles.reduce((map, profile) => {
    if (profile && profile.id) {
      map[profile.id] = profile;
    }
    return map;
  }, {} as Record<string, ProfileData>);
};
