import { toast } from 'sonner';

/**
 * Highlights an element by applying visual effects
 * 
 * @param element The DOM element to highlight
 * @param options Optional configurations for the highlight effect
 */
export function highlightElement(
  element: HTMLElement | null,
  options: {
    scrollIntoView?: boolean;
    showToast?: boolean;
    title?: string;
    message?: string;
  } = {}
) {
  if (!element) return;
  
  const {
    scrollIntoView = true,
    showToast = true,
    title = 'Item Found',
    message = 'The requested item has been found and highlighted'
  } = options;

  // Add highlight class
  element.classList.add('highlight-item');
  
  // Remove the class after animation completes
  setTimeout(() => {
    element.classList.remove('highlight-item');
  }, 2000);
  
  // Scroll into view if requested
  if (scrollIntoView) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
  
  // Show toast notification if requested
  if (showToast) {
    // Using Sonner toast with correct description property
    import('sonner').then(({ toast }) => {
      toast(title, {
        description: message
      });
    });
  }
}
