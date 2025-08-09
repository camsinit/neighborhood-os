
// Main hook that combines all the others
import { useUser } from "@supabase/auth-helpers-react";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useGoodsFormState } from "./useGoodsFormState";
import { useGoodsFormHandlers } from "./useGoodsFormHandlers";
import { useGoodsFormSubmit } from "./useGoodsFormSubmit";
import { GoodsFormProps } from "../types/goodsFormTypes";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";

export const useGoodsForm = ({ 
  onClose, 
  initialValues, 
  initialRequestType,
  mode = 'create', // Add mode parameter
  requestId // Add requestId parameter (this will be the itemId for edit mode)
}: Pick<GoodsFormProps, 'onClose' | 'initialValues' | 'initialRequestType' | 'mode' | 'requestId'>) => {
  // Create a logger instance scoped to this hook
  const logger = createLogger('useGoodsForm');
  // Get the current user and neighborhood
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  
  // Log the neighborhood data for debugging purposes (debug level)
  logger.debug("Current neighborhood", neighborhood);
  
  // We'll pass the initialRequestType directly to useGoodsFormState
  // since we've updated it to handle both "need" and "request"
  const {
    itemFormData,
    setItemFormData,
    requestFormData,
    setRequestFormData,
    uploading,
    setUploading,
    selectedCategory,
    setSelectedCategory,
    isOfferForm
  } = useGoodsFormState(initialValues, initialRequestType);
  
  const {
    handleAddImage,
    handleRemoveImage,
    handleCategoryChange,
    handleTitleChange,
    handleDescriptionChange
  } = useGoodsFormHandlers(
    isOfferForm,
    user?.id,
    setUploading,
    setItemFormData,
    setRequestFormData,
    setSelectedCategory
  );

  // Ensure we have a neighborhood before submitting
  if (!neighborhood) {
    // Surface as a warning but avoid breaking the flow
    logger.warn("No neighborhood selected");
  }
  
  const { handleSubmit } = useGoodsFormSubmit(
    isOfferForm,
    itemFormData,
    requestFormData,
    user?.id,
    neighborhood?.id,
    onClose,
    mode, // Pass mode to submit hook
    requestId // Pass requestId as itemId for edit mode
  );
  
  return {
    itemFormData,
    requestFormData,
    uploading,
    selectedCategory,
    isOfferForm,
    handleAddImage,
    handleRemoveImage,
    handleCategoryChange,
    handleTitleChange,
    handleDescriptionChange,
    handleSubmit,
    setItemFormData,
    setRequestFormData
  };
};
