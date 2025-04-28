
// Function to create a highlight listener for a specific module type
export const createHighlightListener = (moduleType: string) => {
  return (event: Event) => {
    // Handle both /freebies and /goods routes mapping to the same freebies module
    if (moduleType === 'freebies' && (window.location.pathname.includes('/goods') || window.location.pathname.includes('/freebies'))) {
      return;
    }
    
    // Only handle events for routes matching the module type
    if (!window.location.pathname.includes(`/${moduleType}`)) {
      window.location.href = `/${moduleType}?forceHideBadge=true`;
    }
  };
};
