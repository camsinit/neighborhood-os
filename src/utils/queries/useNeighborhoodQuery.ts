
/**
 * useNeighborhoodQuery Hook
 * 
 * A helper hook that creates React Query queries that are properly scoped to the current neighborhood.
 * This ensures that all data fetching respects the current neighborhood context.
 */
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useNeighborhood } from '@/hooks/useNeighborhood';

/**
 * Creates a neighborhood-scoped query
 * 
 * This helper ensures all queries include the current neighborhood ID in their
 * query key, and are only enabled when a neighborhood is selected.
 */
export function useNeighborhoodQuery<TData>(
  baseQueryKey: string[],
  queryFn: (neighborhoodId: string) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();
  
  return useQuery({
    queryKey: [...baseQueryKey, neighborhood?.id],
    queryFn: () => {
      if (!neighborhood?.id) {
        throw new Error('No neighborhood selected');
      }
      return queryFn(neighborhood.id);
    },
    enabled: !!neighborhood?.id && !isLoadingNeighborhood,
    ...options,
  });
}

export default useNeighborhoodQuery;
