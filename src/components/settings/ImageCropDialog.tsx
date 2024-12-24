import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: string | null;
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: PixelCrop) => void;
  imgRef: React.RefObject<HTMLImageElement>;
  onSave: () => void;
  uploading: boolean;
}

export const ImageCropDialog = ({
  open,
  onOpenChange,
  selectedImage,
  crop,
  onCropChange,
  onCropComplete,
  imgRef,
  onSave,
  uploading,
}: ImageCropDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="w-[400px] h-[400px] overflow-hidden bg-gray-100 flex items-center justify-center">
            {selectedImage && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => onCropChange(percentCrop)}
                onComplete={(c) => onCropComplete(c)}
                circularCrop
                aspect={1}
                minWidth={100}
                minHeight={100}
                className="max-w-full max-h-full"
                ruleOfThirds
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt="Crop preview"
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const width = img.width;
                    const height = img.height;
                    const size = Math.min(width, height);
                    const x = (width - size) / 2;
                    const y = (height - size) / 2;
                    const newCrop: Crop = {
                      unit: '%',
                      width: (size / width) * 100,
                      height: (size / height) * 100,
                      x: (x / width) * 100,
                      y: (y / height) * 100,
                    };
                    onCropChange(newCrop);
                    onCropComplete(newCrop as PixelCrop);
                  }}
                />
              </ReactCrop>
            )}
          </div>
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};