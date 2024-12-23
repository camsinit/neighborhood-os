import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useSafetyUpdateSubmit } from "@/hooks/safety/useSafetyUpdateSubmit";

interface SafetyUpdateFormProps {
  onClose: () => void;
  initialValues?: {
    title: string;
    description: string;
    type: string;
  };
  mode?: 'create' | 'edit';
  updateId?: string;
}

const SafetyUpdateForm = ({ onClose, initialValues, mode = 'create', updateId }: SafetyUpdateFormProps) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [type, setType] = useState(initialValues?.type || "");

  const { handleSubmit, handleUpdate } = useSafetyUpdateSubmit({
    onSuccess: () => {
      onClose();
      if (mode === 'create') {
        setTitle("");
        setDescription("");
        setType("");
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      description,
      type,
    };

    if (mode === 'edit' && updateId) {
      handleUpdate(updateId, formData);
    } else {
      handleSubmit(formData);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Update Type</Label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alerts">Alerts</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="updates">Updates</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-[#ea384c] hover:bg-[#ea384c]/90">
          {mode === 'edit' ? 'Update' : 'Share Update'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SafetyUpdateForm;