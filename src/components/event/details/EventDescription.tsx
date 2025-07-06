
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
    <div className="bg-white rounded-xl border border-hsl(var(--border)) p-4">
      <h3 className="font-semibold text-hsl(var(--foreground)) mb-3">Details</h3>
      <p className="text-sm text-hsl(var(--muted-foreground)) leading-relaxed whitespace-pre-wrap">{description}</p>
    </div>
  );
};

export default EventDescription;
