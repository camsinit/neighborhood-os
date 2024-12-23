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
}

const SafetyUpdateForm = ({ onClose }: SafetyUpdateFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");

  const { handleSubmit } = useSafetyUpdateSubmit({
    onSuccess: () => {
      onClose();
      setTitle("");
      setDescription("");
      setType("");
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({
      title,
      description,
      type,
    });
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
          Share Update
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SafetyUpdateForm;