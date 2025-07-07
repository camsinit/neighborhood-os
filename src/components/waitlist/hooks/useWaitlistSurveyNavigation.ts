import { useState } from "react";

/**
 * Custom hook for managing waitlist survey navigation
 */
export const useWaitlistSurveyNavigation = () => {
  // Current carousel page (0 = essential info, 1 = additional questions)
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Navigate to the next carousel page
   */
  const goToNext = () => {
    if (currentPage < 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Navigate to the previous carousel page
   */
  const goToPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isFirstStep = currentPage === 0;
  const isLastStep = currentPage === 1;

  return {
    currentPage,
    goToNext,
    goToPrevious,
    isFirstStep,
    isLastStep
  };
};