
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportRequestFormData } from "../types/formTypes";

interface FormFieldsProps {
  formData: Partial<SupportRequestFormData>;
  onChange: (field: keyof SupportRequestFormData, value: any) => void;
}

const FormFields = ({ formData, onChange }: FormFieldsProps) => {
  const showCategoryField = formData.requestType !== 'offer' || formData.category !== 'skills';
  const isCareCategory = formData.category === 'care';

  return (
    <>
      {showCategoryField && (
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => onChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goods">Goods</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="skills">Skills</SelectItem>
              <SelectItem value="care">Care</SelectItem>
              <SelectItem value="resources">Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isCareCategory && (
        <div className="space-y-2">
          <Label htmlFor="careCategory">Care Type</Label>
          <Select 
            value={formData.care_category} 
            onValueChange={(value) => onChange('care_category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select care type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="household">Household Tasks</SelectItem>
              <SelectItem value="medical">Medical Assistance</SelectItem>
              <SelectItem value="childcare">Childcare</SelectItem>
              <SelectItem value="eldercare">Elder Care</SelectItem>
              <SelectItem value="petcare">Pet Care</SelectItem>
              <SelectItem value="mealprep">Meal Preparation</SelectItem>
              <SelectItem value="general">General Assistance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {showCategoryField && (
        <div className="space-y-2">
          <Label htmlFor="supportType">Support Type</Label>
          <Select 
            value={formData.supportType} 
            onValueChange={(value) => onChange('supportType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select support type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="validUntil">Valid Until</Label>
        <Input
          id="validUntil"
          type="date"
          value={formData.validUntil || ''}
          onChange={(e) => onChange('validUntil', e.target.value)}
          required
        />
      </div>
    </>
  );
};

export default FormFields;
