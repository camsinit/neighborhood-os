
// This is the main goods form component, refactored into smaller subcomponents
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { GoodsFormProps } from "./types/goodsFormTypes";
import { moduleThemeColors } from "@/theme/moduleTheme";

// Import our refactored components
import CategorySelection from "./form/CategorySelection";
import TitleField from "./form/TitleField";
import DescriptionField from "./form/DescriptionField";
import AvailabilityField from "./form/AvailabilityField";
import UrgencyField from "./form/UrgencyField";
import ImageDropzone from "./form/ImageDropzone";

// Import our custom hook
import { useGoodsForm } from "./hooks/useGoodsForm";

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
 * 
 * Updated with compact spacing and reduced empty space.
 * Now properly handles edit mode to update existing items instead of creating new ones.
 */
const GoodsForm = ({ 
  onClose, 
  initialValues,
  initialData, // Add support for initialData from edit mode
  mode = 'create',
  requestId,
  initialRequestType,
  forceDefaultDisplay = false // Added this prop to force consistent display
}: GoodsFormProps & { forceDefaultDisplay?: boolean }) => {
  
  // Transform initialData from database format to form format for edit mode
  const transformedInitialValues = initialData ? {
    title: initialData.title || "",
    description: initialData.description || "",
    // Map database field 'goods_category' to form field 'category'
    category: initialData.goods_category || initialData.category || "Furniture",
    // Map database field 'request_type' to form field 'requestType'
    requestType: initialData.request_type === "offer" ? "offer" as const : "need" as const,
    // Handle images from both image_url and images array
    images: initialData.images || (initialData.image_url ? [initialData.image_url] : []),
    // Handle urgency for requests
    urgency: initialData.urgency || "medium" as const,
    // Calculate available days from valid_until date for offers
    availableDays: initialData.valid_until ? 
      Math.max(1, Math.ceil((new Date(initialData.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) 
      : 30
  } : initialValues;

  // Use our custom hook to manage the form state and handlers
  // Now passing mode and requestId for proper edit functionality
  const {
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
  } = useGoodsForm({ 
    onClose, 
    initialValues: transformedInitialValues, // Use transformed data
    initialRequestType: transformedInitialValues?.requestType || initialRequestType,
    mode, // Pass mode to hook
    requestId // Pass requestId to hook
  });
  
  // Set title based on form mode (create or edit) and request type (offer or need)
  const formTitle = mode === 'edit' 
    ? "Edit Item" 
    : isOfferForm 
      ? "Offer an Item" 
      : "Request an Item";
  
  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Category Selection - always show for offers or when forcing default display */}
        {(isOfferForm || forceDefaultDisplay) && (
          <CategorySelection 
            category={selectedCategory}
            onChange={handleCategoryChange}
          />
        )}
        
        {/* Title Field */}
        <TitleField 
          mode={isOfferForm ? 'offer' : 'request'}
          value={isOfferForm ? itemFormData.title : requestFormData.title}
          onChange={handleTitleChange}
        />
        
        {/* Description Field */}
        <DescriptionField 
          mode={isOfferForm ? 'offer' : 'request'}
          value={isOfferForm ? itemFormData.description : requestFormData.description}
          onChange={handleDescriptionChange}
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
        {!isOfferForm && !forceDefaultDisplay && (
          <UrgencyField 
            urgency={requestFormData.urgency!}
            onChange={(urgency) => {
              setRequestFormData(prev => ({ ...prev, urgency }));
            }}
          />
        )}
        
        {/* Image Upload Area - always show for offers or when forcing default display */}
        {(isOfferForm || forceDefaultDisplay) && (
          <ImageDropzone 
            isOfferForm={isOfferForm}
            images={itemFormData.images}
            image={requestFormData.image}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
            uploading={uploading}
          />
        )}
        
        {/* Form Submission Buttons */}
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={uploading}
            style={{ 
              backgroundColor: moduleThemeColors.goods.primary,
              borderColor: moduleThemeColors.goods.primary 
            }}
            className="hover:opacity-90"
          >
            {mode === 'edit' ? 'Update' : 'Submit'}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
};

export default GoodsForm;
