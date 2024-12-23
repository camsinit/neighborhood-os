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
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

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
  const user = useUser();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a support request",
        variant: "destructive",
      });
      return;
    }

    if (!requestType) {
      toast({
        title: "Error",
        description: "Please select whether this is a Need or an Offer",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          title,
          description,
          type,
          request_type: requestType,
          user_id: user.id,
          valid_until: new Date(validUntil).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your support request has been successfully posted.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating support request:', error);
      toast({
        title: "Error",
        description: "Failed to create support request. Please try again.",
        variant: "destructive",
      });
    }
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