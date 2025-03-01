
// This is the main goods form component, refactored into smaller subcomponents
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { 
  GoodsFormProps, 
  GoodsItemFormData, 
  GoodsRequestFormData, 
  GoodsItemCategory,
  GoodsRequestUrgency
} from "@/components/support/types/formTypes";
import { useQueryClient } from "@tanstack/react-query";

// Import our refactored components
import CategorySelection from "./form/CategorySelection";
import ItemSuggestions from "./form/ItemSuggestions";
import TextFields from "./form/TextFields";
import AvailabilityField from "./form/AvailabilityField";
import UrgencyField from "./form/UrgencyField";
import ImageDropzone from "./form/ImageDropzone";

// Import utility functions
import { uploadImage } from "./utils/imageUpload";

/**
 * GoodsForm component handles both offering and requesting goods items.
 * 
 * For offers, it collects detailed information about the item including:
 * - Title, description, category
 * - How long the item is available
 * - Multiple images
 * 
 * For requests, it collects:
 * - Title, description
 * - Urgency level
 * - Optional category and image
 */
const GoodsForm = ({ 
  onClose, 
  initialValues,
  mode = 'create',
  requestId,
  initialRequestType
}: GoodsFormProps) => {
  // Get the current user and query client
  const user = useUser();
  const queryClient = useQueryClient();
  
  // State for the item form (when offering)
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: (initialValues as any)?.category || "furniture",
    requestType: initialRequestType,
    availableDays: (initialValues as any)?.availableDays || 30,
    images: (initialValues as any)?.images || []
  });
  
  // State for the request form (when requesting)
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: (initialValues as any)?.urgency || "medium",
    category: (initialValues as any)?.category,
    image: (initialValues as any)?.image
  });
  
  // State for image upload process
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory>(
    (initialValues as any)?.category || "furniture"
  );
  
  // Determine whether this is an offer or request form
  const isOfferForm = initialRequestType === "offer";
  
  // Handle file uploads for images
  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error("You must be logged in to upload images");
      return null;
    }
    
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, user.id);
      return imageUrl;
    } finally {
      setUploading(false);
    }
  };
  
  // Handle adding images to the form data
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      if (isOfferForm) {
        setItemFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      } else {
        setRequestFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
      }
    }
  };
  
  // Handle removing an image from the form data
  const handleRemoveImage = (index: number) => {
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index) || []
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        image: null
      }));
    }
  };
  
  // Helper for handling category change to update suggestions
  const handleCategoryChange = (category: GoodsItemCategory) => {
    setSelectedCategory(category);
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        category
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        category
      }));
    }
  };
  
  // Select a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        title: suggestion
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        title: suggestion
      }));
    }
  };
  
  // Handle title change
  const handleTitleChange = (value: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({ ...prev, title: value }));
    } else {
      setRequestFormData(prev => ({ ...prev, title: value }));
    }
  };
  
  // Handle description change
  const handleDescriptionChange = (value: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({ ...prev, description: value }));
    } else {
      setRequestFormData(prev => ({ ...prev, description: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a goods request");
      return;
    }
    
    try {
      if (isOfferForm) {
        // Validate required fields for item offers
        if (!itemFormData.title || !itemFormData.description || !itemFormData.category) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        if (!itemFormData.images?.length) {
          toast.error("Please upload at least one image of the item");
          return;
        }
        
        // Prepare data for submission
        const formattedData = {
          title: itemFormData.title,
          description: itemFormData.description,
          goods_category: itemFormData.category,
          request_type: 'offer',
          user_id: user.id,
          valid_until: new Date(Date.now() + (itemFormData.availableDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
          images: itemFormData.images,
          is_archived: false
        };
        
        console.log("Submitting offer data:", formattedData);
        
        // Submit data to the database
        const { error } = await supabase
          .from('goods_exchange')
          .insert(formattedData);
          
        if (error) throw error;
        
      } else {
        // Validate required fields for item requests
        if (!requestFormData.title || !requestFormData.description || !requestFormData.urgency) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        // Prepare data for submission
        const formattedData = {
          title: requestFormData.title,
          description: requestFormData.description,
          goods_category: requestFormData.category || null,
          request_type: 'need',
          user_id: user.id,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          image_url: requestFormData.image,
          urgency: requestFormData.urgency,
          is_archived: false
        };
        
        console.log("Submitting request data:", formattedData);
        
        // Submit data to the database
        const { error } = await supabase
          .from('goods_exchange')
          .insert(formattedData);
          
        if (error) throw error;
      }
      
      // Update the UI and close the form
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      toast.success(isOfferForm ? "Item offered successfully!" : "Item request submitted successfully!");
      onClose();
      
    } catch (error) {
      console.error('Error submitting goods form:', error);
      toast.error("Failed to submit. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection (for offers and optionally for requests) */}
      {isOfferForm && (
        <CategorySelection 
          category={itemFormData.category as GoodsItemCategory}
          onChange={handleCategoryChange}
        />
      )}
      
      {/* Quick Suggestions */}
      <ItemSuggestions 
        category={selectedCategory}
        onSelectSuggestion={handleSelectSuggestion}
      />
      
      {/* Title and Description Fields */}
      <TextFields 
        title={isOfferForm ? itemFormData.title || "" : requestFormData.title || ""}
        description={isOfferForm ? itemFormData.description || "" : requestFormData.description || ""}
        isOfferForm={isOfferForm}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />
      
      {/* Available Days (offers only) */}
      {isOfferForm && (
        <AvailabilityField 
          availableDays={itemFormData.availableDays || 30}
          onChange={(days) => {
            setItemFormData(prev => ({ ...prev, availableDays: days }));
          }}
        />
      )}
      
      {/* Urgency (requests only) */}
      {!isOfferForm && (
        <UrgencyField 
          urgency={requestFormData.urgency as GoodsRequestUrgency}
          onChange={(urgency) => {
            setRequestFormData(prev => ({ ...prev, urgency }));
          }}
        />
      )}
      
      {/* Image Upload Area */}
      <ImageDropzone 
        isOfferForm={isOfferForm}
        images={itemFormData.images}
        image={requestFormData.image}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        uploading={uploading}
      />
      
      {/* Form Submission Buttons */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {mode === 'edit' ? 'Update' : 'Submit'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default GoodsForm;
