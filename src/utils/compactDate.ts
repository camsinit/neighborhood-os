/**
 * Compact Date Formatting Utility
 * 
 * Formats dates into compact strings like:
 * - "2h" for 2 hours ago
 * - "2d" for 2 days ago
 * - "2m" for 2 minutes ago
 * - "2mo" for 2 months ago
 */

export function formatCompactDate(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  
  // Calculate the difference in milliseconds
  const diffInMs = now.getTime() - targetDate.getTime();
  
  // Convert to different time units
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));
  
  // Return the most appropriate time format
  if (years > 0) {
    return `${years}y`;
  } else if (months > 0) {
    return `${months}mo`;
  } else if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'now';
  }
}