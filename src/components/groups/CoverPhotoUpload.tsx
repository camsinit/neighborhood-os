import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image } from 'lucide-react';
import { useUser } from '@supabase/auth-helpers-react';
import { handleImageUpload } from '@/utils/imageHandling';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
interface CoverPhotoUploadProps {
  coverPhotoUrl: string | null;
  onCoverPhotoChange: (url: string | null) => void;
}

/**
 * CoverPhotoUpload component allows users to upload a cover photo for their group
 * Supports both file selection and drag-and-drop functionality
 */
export const CoverPhotoUpload: React.FC<CoverPhotoUploadProps> = ({
  coverPhotoUrl,
  onCoverPhotoChange
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!user?.id) return;
    setUploading(true);
    setError(null);
    try {
      // Validate file type before upload
      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not an image. Please select an image file.`);
        return;
      }

      // Upload the image directly to the safety_images bucket with user-specific folder
      const imageUrl = await handleImageUpload(file, 'safety_images', `group-covers/${user.id}`);
      if (imageUrl) {
        onCoverPhotoChange(imageUrl);
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  // Remove the current cover photo
  const removeCoverPhoto = () => {
    onCoverPhotoChange(null);
    setError(null);
  };

  // Drag and drop handlers
  const {
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop
  } = useDragAndDrop({ onFileDrop: handleFileUpload });
  return <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Label className="text-lg font-bold">Cover Photo</Label>
        <p className="text-sm text-gray-600">
          Add a cover photo to make your group more appealing (optional)
        </p>
      </div>

      {/* Current cover photo display */}
      {coverPhotoUrl ? <div className="relative">
          <div className="relative h-40 w-full rounded-lg overflow-hidden border">
            <img src={coverPhotoUrl} alt="Group cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
              <Button type="button" variant="destructive" size="sm" onClick={removeCoverPhoto} className="bg-red-500 hover:bg-red-600">
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div> : (/* Upload area */
    <div className={`relative h-40 w-full border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {uploading ? <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div> : <>
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Image className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {isDragOver ? 'Drop image here' : 'Upload cover photo'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Drag & drop or click to select
                    </p>
                  </div>
                </div>
                
                {/* Hidden file input */}
                <Input type="file" accept="image/*" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
              </>}
          </div>
        </div>)}

      {/* Upload button as alternative */}
      {!coverPhotoUrl && !uploading && <div className="text-center">
          
        </div>}

      {/* Error display */}
      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>}
    </div>;
};