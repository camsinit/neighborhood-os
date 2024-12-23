import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useSupportRequestSubmit } from "@/hooks/support/useSupportRequestSubmit";

interface SupportRequestFormProps {
  onClose: () => void;
  initialRequestType?: "need" | "offer" | null;
  initialValues?: {
    title: string;
    description: string;
    type: string;
    requestType: "need" | "offer";
    validUntil: string;
  };
  mode?: 'create' | 'edit';
  requestId?: string;
}

const SupportRequestForm = ({ 
  onClose, 
  initialRequestType,
  initialValues,
  mode = 'create',
  requestId
}: SupportRequestFormProps) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [type, setType] = useState(initialValues?.type || "");
  const [validUntil, setValidUntil] = useState(initialValues?.validUntil || "");
  const [requestType, setRequestType] = useState<"need" | "offer" | null>(
    initialValues?.requestType || initialRequestType || null
  );

  const { handleSubmit, handleUpdate } = useSupportRequestSubmit({
    onSuccess: () => {
      onClose();
      if (mode === 'create') {
        setTitle("");
        setDescription("");
        setType("");
        setValidUntil("");
        setRequestType(null);
      }
    }
  });

  useEffect(() => {
    if (initialRequestType) {
      setRequestType(initialRequestType);
    }
  }, [initialRequestType]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return;
    
    const formData = {
      title,
      description,
      type,
      validUntil,
      requestType,
    };

    if (mode === 'edit' && requestId) {
      handleUpdate(requestId, formData);
    } else {
      handleSubmit(formData);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Request Type</Label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="goods">Goods</SelectItem>
            <SelectItem value="transportation">Transportation</SelectItem>
            <SelectItem value="skills">Skills</SelectItem>
            <SelectItem value="resources">Resources</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="need" 
            checked={requestType === "need"}
            onCheckedChange={() => setRequestType("need")}
          />
          <Label htmlFor="need">I need help</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="offer" 
            checked={requestType === "offer"}
            onCheckedChange={() => setRequestType("offer")}
          />
          <Label htmlFor="offer">I have an offer</Label>
        </div>
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
      <div className="space-y-2">
        <Label htmlFor="validUntil">Valid Until</Label>
        <Input
          id="validUntil"
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit">
          {mode === 'edit' ? 'Update Request' : 'Create Request'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SupportRequestForm;