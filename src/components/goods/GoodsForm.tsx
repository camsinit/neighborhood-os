
// This is the main goods form component, refactored into smaller subcomponents
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { GoodsFormProps } from "@/components/support/types/formTypes";

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
 * Updated with narrower width and shorter text fields for better UX.
 */
const GoodsForm = ({ 
  onClose, 
  initialValues,
  mode = 'create',
  requestId,
  initialRequestType,
  forceDefaultDisplay = false // Added this prop to force consistent display
}: GoodsFormProps & { forceDefaultDisplay?: boolean }) => {
  // Use our custom hook to manage the form state and handlers
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
  } = useGoodsForm({ onClose, initialValues, initialRequestType });
  
  // Set title based on form mode (create or edit) and request type (offer or need)
  const formTitle = mode === 'edit' 
    ? "Edit Item" 
    : isOfferForm 
      ? "Offer an Item" 
      : "Request an Item";
  
  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading}>
            {mode === 'edit' ? 'Update' : 'Submit'}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
};

export default GoodsForm;
