
/**
 * FreebiesForm component
 * 
 * This component handles the form for adding or editing a freebie.
 * It reuses the existing GoodsForm component for now since the functionality is the same.
 */
import GoodsForm from '@/components/goods/GoodsForm';
import { GoodsItemCategory } from "@/components/support/types/formTypes";

// Define types for the props
interface FreebiesFormProps {
  mode?: 'add' | 'edit';
  onClose: () => void;
  initialValues?: {
    title?: string;
    description?: string;
    category?: GoodsItemCategory;
    requestType?: 'need' | 'offer';
    images?: string[];
    availableDays?: number;
    urgency?: string;
  };
  requestId?: string;
  initialRequestType?: 'need' | 'offer';
  forceDefaultDisplay?: boolean;
}

/**
 * FreebiesForm Component
 * 
 * A wrapper around the GoodsForm component to maintain naming consistency 
 * with the "Freebies" module, but reusing the GoodsForm functionality.
 */
const FreebiesForm = (props: FreebiesFormProps) => {
  // Pass all props to the GoodsForm component
  return <GoodsForm {...props} />;
};

export default FreebiesForm;
