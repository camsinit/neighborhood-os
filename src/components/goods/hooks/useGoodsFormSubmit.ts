
// This hook handles form submission
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { submitGoodsForm } from "../utils/formSubmission";
import { GoodsItemFormData, GoodsRequestFormData } from "@/components/support/types/formTypes";
import { useEffect } from "react";

export const useGoodsFormSubmit = (
  isOfferForm: boolean,
  itemFormData: Partial<GoodsItemFormData>,
  requestFormData: Partial<GoodsRequestFormData>,
  userId: string | undefined,
  neighborhoodId: string | undefined,
  onClose: () => void
) => {
  const queryClient = useQueryClient();
  
  // Check for required dependencies and warn if they're not present
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
        formType: isOfferForm ? "offer" : "request"
      });
      return;
    }
    
    try {
      const success = await submitGoodsForm(
        isOfferForm,
        itemFormData,
        requestFormData,
        userId,
        neighborhoodId
      );
      
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['goods-exchange'] });
        onClose();
      }
    } catch (error) {
      console.error('Error submitting goods form:', error);
    }
  };
  
  return { handleSubmit };
};
