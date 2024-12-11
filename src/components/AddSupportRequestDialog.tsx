import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AddSupportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRequestType?: "need" | "offer" | null;
}

const AddSupportRequestDialog = ({ open, onOpenChange, initialRequestType }: AddSupportRequestDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [requestType, setRequestType] = useState<"need" | "offer" | null>(initialRequestType);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open && initialRequestType) {
      setRequestType(initialRequestType);
    }
  }, [open, initialRequestType]);

  React.useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setType("");
      setValidUntil("");
      setRequestType(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) {
      toast({
        title: "Error",
        description: "Please select whether this is a Need or an Offer",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Request Added",
      description: "Your support request has been successfully posted.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Need or Offer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit">Create Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupportRequestDialog;