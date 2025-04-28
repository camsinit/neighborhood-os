
/**
 * FreebiesForm component
 * 
 * This component handles the form for adding or editing a freebie.
 * It reuses the existing GoodsForm component for now since the functionality is the same.
 */
import GoodsForm from '@/components/goods/GoodsForm';
import { GoodsItemCategory, GoodsFormProps } from "@/components/support/types/formTypes";

// Define types for the props - using the existing GoodsFormProps type
interface FreebiesFormProps extends GoodsFormProps {
  // Any additional props specific to FreebiesForm can be added here
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
