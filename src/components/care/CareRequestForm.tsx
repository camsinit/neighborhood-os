
import { useForm } from 'react-hook-form';
import { useUser } from '@supabase/auth-helpers-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from "@/components/ui/form";
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { addDays } from 'date-fns';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

// Import refactored components and hooks
import { 
  careRequestSchema, 
  CareRequestFormData,
  CareRequestFormProps 
} from './schemas/careRequestSchema';
import { 
  TitleField,
  DescriptionField,
  CareCategoryField,
  ValidUntilField,
  FormButtons 
} from './form-fields/CareRequestFormFields';
import { useCareRequestSubmit } from './hooks/useCareRequestSubmit';

/**
 * CareRequestForm component
 * 
 * This refactored component uses smaller, focused components and hooks for better maintainability
 * Now supports create, update, and delete operations with edge function integration
 */
const CareRequestForm = ({
  onClose,
  initialValues = {},
  editMode = false,
  existingRequest = null
}: CareRequestFormProps) => {
  // Get the current user and neighborhood
  const user = useUser();
  
  // Get the current neighborhood - this returns a Neighborhood object
  const neighborhoodData = useCurrentNeighborhood();
  
  // Setup the form submission hook - now with delete support
  const { isSubmitting, submitCareRequest, deleteCareRequest } = useCareRequestSubmit(
    user,
    neighborhoodData,
    onClose,
    editMode,
    existingRequest
  );

  // Setup automatic refresh of activities when care requests are updated
  useAutoRefresh(
    ['activities'], 
    ['care-request-submitted']
  );

  // Set up default values for the form
  const defaultValues = {
    title: existingRequest?.title || '',
    description: existingRequest?.description || '',
    careCategory: existingRequest?.care_category || initialValues.careCategory || 'meal_prep',
    validUntil: existingRequest?.valid_until ? new Date(existingRequest.valid_until) : addDays(new Date(), 7),
  };

  // Initialize the form with react-hook-form
  const form = useForm<CareRequestFormData>({
    resolver: zodResolver(careRequestSchema),
    defaultValues,
  });

  // Handle form submission by forwarding to the submission hook
  const onSubmit = (data: CareRequestFormData) => {
    submitCareRequest(data);
  };

  // Handle care request deletion
  const handleDelete = () => {
    if (existingRequest && existingRequest.id) {
      deleteCareRequest(existingRequest.id, existingRequest.title);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <TitleField form={form} />

        {/* Description */}
        <DescriptionField form={form} />

        {/* Care Category */}
        <CareCategoryField form={form} />

        {/* Valid Until */}
        <ValidUntilField form={form} />

        {/* Form action buttons - now with delete support */}
        <FormButtons 
          onClose={onClose} 
          isSubmitting={isSubmitting} 
          editMode={editMode}
          onDelete={editMode ? handleDelete : undefined}
        />
      </form>
    </Form>
  );
};

export default CareRequestForm;
