
// This component handles text input fields (title and description)
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Component props definition
interface TextFieldsProps {
  title: string;
  description: string;
  isOfferForm: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

/**
 * TextFields component
 * 
 * Renders the title and description fields for the goods form.
 * The placeholder text changes depending on whether it's an offer or request form.
 */
const TextFields = ({ 
  title, 
  description, 
  isOfferForm, 
  onTitleChange, 
  onDescriptionChange 
}: TextFieldsProps) => {
  return (
    <>
      {/* Title field */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          placeholder={`${isOfferForm ? 'What are you offering?' : 'What do you need?'}`}
        />
      </div>
      
      {/* Description field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          placeholder={`${isOfferForm 
            ? 'Provide details about the item (condition, size, etc.)' 
            : 'Describe what you need and any specific requirements'}`}
          className="min-h-[100px]"
        />
      </div>
    </>
  );
};

export default TextFields;
