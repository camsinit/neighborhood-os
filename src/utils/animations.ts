export const addScaleAnimation = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.classList.add('animate-scale-in');
  setTimeout(() => {
    element.classList.remove('animate-scale-in');
  }, 300);
};