/**
 * Contact utilities for goods exchange
 * Shared utility functions for creating contact links and handling communication
 */

import { GoodsExchangeItem } from '@/types/localTypes';

/**
 * Create a pre-populated email link for contacting about a specific good
 * 
 * @param item - The goods exchange item to create contact email for
 * @param requesterName - Name of the person making the contact
 * @returns Pre-formatted mailto link
 */
export function createContactEmailLink(item: GoodsExchangeItem, requesterName?: string): string {
  const subject = encodeURIComponent(`Interest in: ${item.title}`);
  const body = encodeURIComponent(
    `Hi,\n\nI'm interested in "${item.title}" that you posted.\n\n` +
    `Could we discuss the details?\n\n` +
    `Thanks!\n${requesterName || 'A neighbor'}`
  );
  
  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Create a formatted message for sharing good details
 * 
 * @param item - The goods exchange item to format
 * @returns Formatted message string
 */
export function formatGoodsMessage(item: GoodsExchangeItem): string {
  return `${item.title}\n\n${item.description}\n\nCategory: ${item.category}`;
}