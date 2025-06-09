
/**
 * This file contains utility functions for handling activity content
 */
import { supabase } from "@/integrations/supabase/client";
import { ContentTable } from "./types";

/**
 * Helper function to fetch titles for a specific content type with type safety
 * 
 * @param tableName Name of the table to query
 * @param ids Array of content IDs to look up
 * @param titleMap Map to store the results
 */
export const fetchTitlesForType = async (
  tableName: ContentTable, 
  ids: string[],
  titleMap: Map<string, string>
): Promise<void> => {
  // Skip if no IDs to fetch
  if (ids.length === 0) return;
  
  try {
    // All these tables have the same structure for id and title columns
    // so we can use a generic query with type safety
    const { data, error } = await supabase
      .from(tableName)
      .select('id, title')
      .in('id', ids);
      
    if (error) {
      console.error(`Error fetching ${tableName} titles:`, error);
      return;
    }
    
    // Add titles to our map - ensure data exists and has the expected structure
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        // Type guard to ensure item has the expected properties
        if (item && typeof item === 'object' && 'id' in item && 'title' in item) {
          const record = item as { id: string; title: string };
          if (record.id && record.title) {
            titleMap.set(record.id, record.title);
          }
        }
      });
    }
  } catch (err) {
    console.error(`Unexpected error fetching ${tableName} titles:`, err);
  }
};

/**
 * Fetches content titles from their respective tables
 * Used to ensure activity feeds show up-to-date titles
 * 
 * @param contentIds Map of content types to arrays of IDs
 * @returns Map of content IDs to their current titles
 */
export const fetchContentTitles = async (
  contentIds: Record<string, string[]>
): Promise<Map<string, string>> => {
  const titleMap = new Map<string, string>();
  
  // Process each content type in parallel for better performance
  const fetchPromises: Promise<void>[] = [];
  
  // Type-safe mapping of content types to their tables
  const validTables: ContentTable[] = ['events', 'safety_updates', 'skills_exchange', 'goods_exchange'];
  
  // Create a promise for each table that has IDs to fetch
  validTables.forEach(table => {
    if (contentIds[table]?.length) {
      fetchPromises.push(fetchTitlesForType(table, contentIds[table], titleMap));
    }
  });
  
  // Wait for all fetch operations to complete
  await Promise.all(fetchPromises);
  
  return titleMap;
};
