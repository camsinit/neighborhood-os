
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { 
  GoodsFormProps, 
  GoodsItemFormData, 
  GoodsRequestFormData, 
  GoodsItemCategory,
  GoodsRequestUrgency
} from "@/components/support/types/formTypes";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";

// Common goods suggestions by category
const GOODS_SUGGESTIONS: Record<GoodsItemCategory, string[]> = {
  furniture: ["Couch", "Chair", "Table", "Desk", "Bookshelf"],
  tools: ["Hammer", "Drill", "Saw", "Ladder", "Lawnmower"],
  electronics: ["TV", "Laptop", "Phone", "Camera", "Speakers"],
  kitchen: ["Blender", "Toaster", "Pots & Pans", "Dishes", "Utensils"],
  clothing: ["Winter Clothes", "Jackets", "Shoes", "Children's Clothes"],
  books: ["Fiction", "Non-fiction", "Textbooks", "Children's Books"],
  toys: ["Board Games", "Puzzles", "Children's Toys", "Outdoor Play Equipment"],
  sports: ["Bicycle", "Tennis Racket", "Basketball", "Camping Gear"],
  garden: ["Plants", "Seeds", "Garden Tools", "Flower Pots"],
  produce: ["Fruits", "Vegetables", "Herbs", "Homegrown Produce"],
  household: ["Cleaning Supplies", "Home Decor", "Bedding", "Storage Containers"],
  other: ["Art Supplies", "Craft Materials", "Musical Instruments"]
};

// List of goods categories with friendly names
const CATEGORY_NAMES: Record<GoodsItemCategory, string> = {
  furniture: "Furniture",
  tools: "Tools & Equipment",
  electronics: "Electronics",
  kitchen: "Kitchen Items",
  clothing: "Clothing & Accessories",
  books: "Books & Media",
  toys: "Toys & Games",
  sports: "Sports & Recreation",
  garden: "Garden & Plants",
  produce: "Fresh Produce",
  household: "Household Items",
  other: "Other Items"
};

// List of urgency levels with friendly names
const URGENCY_NAMES: Record<GoodsRequestUrgency, string> = {
  low: "Low - When convenient",
  medium: "Medium - Within a week",
  high: "High - Within a few days",
  critical: "Critical - Needed immediately"
};

/**
 * GoodsForm component handles both offering and requesting goods items.
 * 
 * For offers, it collects detailed information about the item including:
 * - Title, description, category
 * - How long the item is available
 * - Multiple images
 * 
 * For requests, it collects:
 * - Title, description
 * - Urgency level
 * - Optional category and image
 */
const GoodsForm = ({ 
  onClose, 
  initialValues,
  mode = 'create',
  requestId,
  initialRequestType
}: GoodsFormProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  
  // State for the item form (when offering)
  const [itemFormData, setItemFormData] = useState<Partial<GoodsItemFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: (initialValues as any)?.category || "furniture",
    requestType: initialRequestType,
    availableDays: (initialValues as any)?.availableDays || 30,
    images: (initialValues as any)?.images || []
  });
  
  // State for the request form (when requesting)
  const [requestFormData, setRequestFormData] = useState<Partial<GoodsRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    urgency: (initialValues as any)?.urgency || "medium",
    category: (initialValues as any)?.category,
    image: (initialValues as any)?.image
  });
  
  // State for image upload process
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoodsItemCategory>((initialValues as any)?.category || "furniture");
  
  // Determine whether this is an offer or request form
  const isOfferForm = initialRequestType === "offer";
  
  // Handle file uploads for images
  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error("You must be logged in to upload images");
      return null;
    }
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('mutual_aid_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mutual_aid_images')
        .getPublicUrl(filePath);

      toast.success("Image uploaded successfully");
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  // Handle adding images to the form data
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      if (isOfferForm) {
        setItemFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      } else {
        setRequestFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
      }
    }
  };
  
  // Handle removing an image from the form data
  const handleRemoveImage = (index: number) => {
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index) || []
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        image: null
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a goods request");
      return;
    }
    
    try {
      if (isOfferForm) {
        // Validate required fields for item offers
        if (!itemFormData.title || !itemFormData.description || !itemFormData.category) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        if (!itemFormData.images?.length) {
          toast.error("Please upload at least one image of the item");
          return;
        }
        
        // Prepare data for submission
        const formattedData = {
          title: itemFormData.title,
          description: itemFormData.description,
          goods_category: itemFormData.category,
          request_type: 'offer',
          user_id: user.id,
          valid_until: new Date(Date.now() + (itemFormData.availableDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
          images: itemFormData.images,
          is_archived: false
        };
        
        console.log("Submitting offer data:", formattedData);
        
        // Submit data to the database
        const { error } = await supabase
          .from('goods_exchange')
          .insert(formattedData);
          
        if (error) throw error;
        
      } else {
        // Validate required fields for item requests
        if (!requestFormData.title || !requestFormData.description || !requestFormData.urgency) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        // Prepare data for submission
        const formattedData = {
          title: requestFormData.title,
          description: requestFormData.description,
          goods_category: requestFormData.category || null,
          request_type: 'need',
          user_id: user.id,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          image_url: requestFormData.image,
          urgency: requestFormData.urgency,
          is_archived: false
        };
        
        console.log("Submitting request data:", formattedData);
        
        // Submit data to the database
        const { error } = await supabase
          .from('goods_exchange')
          .insert(formattedData);
          
        if (error) throw error;
      }
      
      // Update the UI and close the form
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      toast.success(isOfferForm ? "Item offered successfully!" : "Item request submitted successfully!");
      onClose();
      
    } catch (error) {
      console.error('Error submitting goods form:', error);
      toast.error("Failed to submit. Please try again.");
    }
  };
  
  // Select a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        title: suggestion
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        title: suggestion
      }));
    }
  };
  
  // Helper for handling category change to update suggestions
  const handleCategoryChange = (category: GoodsItemCategory) => {
    setSelectedCategory(category);
    if (isOfferForm) {
      setItemFormData(prev => ({
        ...prev,
        category
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        category
      }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection (for offers and optionally for requests) */}
      {isOfferForm && (
        <div className="space-y-2">
          <Label htmlFor="category">Item Category</Label>
          <Select 
            value={itemFormData.category as string} 
            onValueChange={(value) => handleCategoryChange(value as GoodsItemCategory)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_NAMES).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Quick Suggestions */}
      {GOODS_SUGGESTIONS[selectedCategory] && (
        <div className="space-y-2">
          <Label>Quick Suggestions</Label>
          <div className="flex flex-wrap gap-2">
            {GOODS_SUGGESTIONS[selectedCategory].map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={isOfferForm ? itemFormData.title : requestFormData.title}
          onChange={(e) => {
            if (isOfferForm) {
              setItemFormData(prev => ({ ...prev, title: e.target.value }));
            } else {
              setRequestFormData(prev => ({ ...prev, title: e.target.value }));
            }
          }}
          required
          placeholder={`${isOfferForm ? 'What are you offering?' : 'What do you need?'}`}
        />
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={isOfferForm ? itemFormData.description : requestFormData.description}
          onChange={(e) => {
            if (isOfferForm) {
              setItemFormData(prev => ({ ...prev, description: e.target.value }));
            } else {
              setRequestFormData(prev => ({ ...prev, description: e.target.value }));
            }
          }}
          required
          placeholder={`${isOfferForm 
            ? 'Provide details about the item (condition, size, etc.)' 
            : 'Describe what you need and any specific requirements'}`}
          className="min-h-[100px]"
        />
      </div>
      
      {/* Available Days (offers only) */}
      {isOfferForm && (
        <div className="space-y-2">
          <Label htmlFor="availableDays">Available For (days)</Label>
          <Input
            id="availableDays"
            type="number"
            min={1}
            max={365}
            value={itemFormData.availableDays || 30}
            onChange={(e) => {
              setItemFormData(prev => ({ 
                ...prev, 
                availableDays: parseInt(e.target.value) || 30 
              }));
            }}
            required
          />
        </div>
      )}
      
      {/* Urgency (requests only) */}
      {!isOfferForm && (
        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency</Label>
          <Select 
            value={requestFormData.urgency} 
            onValueChange={(value) => {
              setRequestFormData(prev => ({
                ...prev,
                urgency: value as GoodsRequestUrgency
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(URGENCY_NAMES).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>
          {isOfferForm 
            ? "Images (required)" 
            : "Image (optional)"}
        </Label>
        <div className="border rounded-md p-4 bg-gray-50">
          {/* Current Images */}
          {isOfferForm ? (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {itemFormData.images?.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image} 
                    alt={`Item ${index+1}`} 
                    className="w-full h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : requestFormData.image ? (
            <div className="relative group mb-4">
              <img 
                src={requestFormData.image} 
                alt="Request" 
                className="w-full h-40 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(0)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : null}
          
          {/* Upload Button */}
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <div className="flex flex-col items-center gap-1">
                <div className="bg-gray-200 rounded-full p-2">
                  <Plus className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-xs text-gray-500">
                  {isOfferForm && itemFormData.images?.length 
                    ? "Add another image" 
                    : "Upload image"}
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAddImage}
                disabled={uploading}
              />
            </label>
          </div>
          
          {/* Validation Message */}
          {isOfferForm && !itemFormData.images?.length && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Please upload at least one image of your item
            </p>
          )}
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {mode === 'edit' ? 'Update' : 'Submit'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default GoodsForm;
