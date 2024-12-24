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
                circularCrop
                aspect={1}
                minWidth={50}
                minHeight={50}
                className="max-w-full max-h-full"
                ruleOfThirds
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt="Crop preview"
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              </ReactCrop>
            )}
          </div>
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={uploading}
              className="hover:bg-gray-100"
            >
              {uploading ? "Uploading..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};