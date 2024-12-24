import ReactCrop, { Crop } from 'react-image-crop';
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
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {selectedImage && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => onCropChange(percentCrop)}
              circularCrop
            >
              <img
                ref={imgRef}
                src={selectedImage}
                alt="Crop preview"
                className="max-h-[400px] w-auto"
              />
            </ReactCrop>
          )}
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
              {uploading ? "Uploading..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};