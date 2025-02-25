
export const addRainbowHighlight = (element: HTMLElement | null) => {
  if (!element) return;
  
  // Add rainbow animation class
  element.classList.add('rainbow-highlight');
  
  // Remove the animation class after 2 seconds
  setTimeout(() => {
    element.classList.remove('rainbow-highlight');
  }, 2000);
};

// Helper to find and highlight elements by data attribute
export const highlightElement = (selector: string) => {
  setTimeout(() => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addRainbowHighlight(element as HTMLElement);
    }
  }, 100);
};
