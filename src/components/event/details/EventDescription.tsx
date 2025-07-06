
/**
 * EventDescription component - Displays the event description
 * 
 * @param description - The event description text
 */
interface EventDescriptionProps {
  description?: string;
}

const EventDescription = ({ description }: EventDescriptionProps) => {
  // Only display if description is provided
  if (!description) return null;
  
  return (
    <div className="mt-4">
      <h3 className="font-medium mb-1">Details</h3>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{description}</p>
    </div>
  );
};

export default EventDescription;
