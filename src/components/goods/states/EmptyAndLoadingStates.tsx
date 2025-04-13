
/**
 * Components for empty and loading states in the goods sections
 */
import React from 'react';
import { Button } from "@/components/ui/button";

/**
 * Loading state for goods sections
 * 
 * Displays animated placeholder content while data is loading
 */
export const GoodsSectionsLoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-pulse bg-gray-200 rounded-md h-8 w-32 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 h-64">
            <div className="animate-pulse bg-gray-200 h-32 w-full rounded-md mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-3/4 rounded-md mb-3"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Empty state for goods requests
 * 
 * Displays when there are no requests in the system yet
 */
export const EmptyRequestsState = ({ onRequestItem }: { onRequestItem: () => void }) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">No requests from neighbors yet</p>
      <Button onClick={onRequestItem}>
        Be the First to Request an Item
      </Button>
    </div>
  );
};
