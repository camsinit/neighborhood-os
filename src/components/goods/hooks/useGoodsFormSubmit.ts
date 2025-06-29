
// This hook handles form submission with improved query invalidation
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { submitGoodsForm } from "../utils/formSubmission";
import { GoodsItemFormData, GoodsRequestFormData } from "@/components/support/types/formTypes";
import { useEffect } from "react";
import { unifiedEvents } from '@/utils/unifiedEventSystem';

export const useGoodsFormSubmit = (
  isOfferForm: boolean,
  itemFormData: Partial<GoodsItemFormData>,
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string | undefined,
  neighborhoodId: string | undefined,
  onClose: () => void,
  mode: 'create' | 'edit' = 'create',
  itemId?: string
) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!userId) {
      console.warn("useGoodsFormSubmit: No user ID provided");
    }
    if (!neighborhoodId) {
      console.warn("useGoodsFormSubmit: No neighborhood ID provided");
    }
  }, [userId, neighborhoodId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("You must be logged in to submit a goods request");
      return;
    }
    
    if (!neighborhoodId) {
      toast.error("No neighborhood selected");
      console.error("Missing neighborhood ID in form submission", {
        userId,
        neighborhoodId,
        formType: isOfferForm ? "offer" : "request",
        mode,
        itemId
      });
      return;
    }
    
    if (mode === 'edit' && !itemId) {
      toast.error("Cannot update item: missing item ID");
      console.error("Edit mode requires itemId", { mode, itemId });
      return;
    }
    
    try {
      const success = await submitGoodsForm(
        isOfferForm,
        itemFormData,
        requestFormData,
        userId,
        neighborhoodId,
        mode === 'edit' ? itemId : undefined
      );
      
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['goods-exchange'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['goods-preview'] });
        
        unifiedEvents.emitMultiple(['goods', 'activities']);
        
        onClose();
      }
    } catch (error) {
      console.error('Error submitting goods form:', error);
      toast.error(`Failed to ${mode === 'edit' ? 'update' : 'submit'} ${isOfferForm ? 'offer' : 'request'}. Please try again.`);
    }
  };
  
  return { handleSubmit };
};
