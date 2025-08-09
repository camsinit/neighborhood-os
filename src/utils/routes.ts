
/**
 * Routes utility (single source of truth)
 *
 * Why this exists:
 * - Keeps all base paths in one place so we don't duplicate strings across files
 * - Provides helpers to build neighborhood-aware URLs safely
 * - Makes code easier for newcomers to follow and change
 */
import type { HighlightableItemType } from '@/utils/highlight/types';

/**
 * Base (neighborhood-agnostic) routes for app sections
 * Note: Do NOT include trailing slashes
 */
export const BASE_ROUTES = {
  home: '/home',
  calendar: '/calendar',
  skills: '/skills',
  goods: '/goods',
  safety: '/safety',
  neighbors: '/neighbors',
} as const;

/**
 * Map highlightable content types to their base routes
 * Keeping this centralized avoids drift between feature modules.
 */
export const ROUTE_MAP: Record<HighlightableItemType, string> = {
  event: BASE_ROUTES.calendar,
  safety: BASE_ROUTES.safety,
  skills: BASE_ROUTES.skills,
  goods: BASE_ROUTES.goods,
  neighbors: BASE_ROUTES.neighbors,
};

/**
 * Extract the neighborhoodId from a pathname like "/n/<id>/skills"
 * Returns null when the path isn't neighborhood-aware.
 */
export function extractNeighborhoodId(pathname: string = window.location.pathname): string | null {
  // Simple regex: match /n/<anything-but-slash>
  const match = pathname.match(/\/n\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Build a neighborhood-aware path from a base path and neighborhood id.
 * If neighborhoodId is missing, return the base path (graceful fallback).
 */
export function neighborhoodPath(basePath: string, neighborhoodId?: string | null): string {
  if (!neighborhoodId) return basePath; // Fallback for legacy/guest flows
  return `/n/${neighborhoodId}${basePath}`;
}

/**
 * Convenience helper: are we currently on the given base route (ignoring the /n/<id> prefix)?
 */
export function isOnBaseRoute(pathname: string, baseRoute: string): boolean {
  // If path starts with /n/<id>, compare the remainder; otherwise compare directly
  const match = pathname.match(/^(?:\/n\/[^\/]+)(\/.*)$/);
  const routePortion = match ? match[1] : pathname;
  return routePortion.split('?')[0] === baseRoute;
}
