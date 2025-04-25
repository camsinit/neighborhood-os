
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SafetyUpdateFormData } from "../schema/safetyUpdateSchema";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";

interface ImageFieldProps {
  form: UseFormReturn<SafetyUpdateFormData>;
}

export function ImageField({ form }: ImageFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // TODO: Implement file upload to storage and set the resulting URL
    form.setValue("imageUrl", url);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    form.setValue("imageUrl", "");
  };

  return (
    <FormField
      control={form.control}
      name="imageUrl"
      render={() => (
        <FormItem>
          <FormLabel>Image (Optional)</FormLabel>
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Safety update" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">Click to upload an image</p>
                  </div>
                  <Input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
