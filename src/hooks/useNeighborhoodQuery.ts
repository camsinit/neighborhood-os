
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "./useCurrentNeighborhood";

/**
 * A wrapper hook around useQuery that automatically includes neighborhood_id
 * in the query key and provides neighborhood context to the query function
 * 
 * This helps ensure consistent neighborhood filtering across all data queries
 */
export function useNeighborhoodQuery<TData = unknown, TError = unknown>(
  baseQueryKey: string[],
  queryFn: (neighborhoodId: string) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  const neighborhood = useCurrentNeighborhood();

  return useQuery<TData, TError>({
    // Automatically include neighborhood_id in query key for proper cache isolation
    queryKey: [...baseQueryKey, neighborhood?.id],
    queryFn: async () => {
      if (!neighborhood?.id) {
        throw new Error('No neighborhood selected');
      }
      return queryFn(neighborhood.id);
    },
    // Only run the query if we have a neighborhood
    enabled: !!neighborhood?.id,
    ...options,
  });
}
