
export const addScaleAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('animate-scale-in');
  setTimeout(() => {
    element.classList.remove('animate-scale-in');
  }, 300);
};

/**
 * Animates gradients based on mouse movement
 * 
 * This function creates a parallax effect where gradient elements
 * move in response to the mouse position on the screen.
 * 
 * @param event The mouse event containing cursor position
 * @param elements An array of HTML elements to animate
 * @param intensity How strongly the elements respond to mouse movement (default: 1)
 * @param invert Whether to invert the movement direction (default: false)
 */
export const animateGradients = (
  event: MouseEvent, 
  elements: (HTMLElement | null)[], 
  intensity: number = 1,
  invert: boolean = false
) => {
  // Get window dimensions for calculating relative movement
  const { innerWidth, innerHeight } = window;
  
  // Calculate cursor position as percentage of window dimensions
  const mouseX = event.clientX / innerWidth;
  const mouseY = event.clientY / innerHeight;
  
  // Movement multiplier determines the direction and strength
  const multiplier = invert ? -1 : 1;
  
  // Apply transform to each provided element
  elements.forEach((element, index) => {
    if (!element) return;
    
    // Each element moves at slightly different rates for layered effect
    const offsetX = (mouseX - 0.5) * intensity * multiplier * (index + 1) * 30;
    const offsetY = (mouseY - 0.5) * intensity * multiplier * (index + 1) * 30;
    
    // Apply smooth transition with transform
    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });
};
