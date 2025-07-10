import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Check, X } from "lucide-react";
import 'react-image-crop/dist/ReactCrop.css';

/**
 * ImageCropDialog Component
 * 
 * Provides a dialog interface for users to crop their profile image to a circular format.
 * Features zoom, rotation, and precise positioning controls for optimal profile pictures.
 * 
 * The cropping is done with a 1:1 aspect ratio to ensure it fits perfectly in circular avatars.
 */

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

// Helper function to create a centered crop with 1:1 aspect ratio
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export const ImageCropDialog = ({
  open,
  onOpenChange,
  imageFile,
  onCropComplete,
}: ImageCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect] = useState<number | undefined>(1); // 1:1 aspect ratio for circular profiles
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Load the image when the dialog opens
  useState(() => {
    if (imageFile && open) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  });

  // Handle image load to set initial crop
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  // Generate cropped image canvas for preview
  const generateCropPreview = useCallback(async () => {
    if (
      !completedCrop ||
      !previewCanvasRef.current ||
      !imgRef.current
    ) {
      return
    }

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')
    const pixelRatio = window.devicePixelRatio

    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    if (ctx) {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      ctx.imageSmoothingQuality = 'high'

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
      )
    }
  }, [completedCrop])

  // Handle crop completion
  const handleCropComplete = async () => {
    if (!previewCanvasRef.current || !completedCrop) {
      return;
    }

    await generateCropPreview();
    
    previewCanvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
          onOpenChange(false);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  // Reset transformations
  const handleReset = () => {
    setScale(1);
    setRotate(0);
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Crop Your Profile Picture</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adjust the crop area to select the part of your image you want to use for your profile picture.
            The selected area will be displayed as a circle.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image cropping area */}
          <div className="flex justify-center max-h-[400px] overflow-auto border rounded-lg">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minWidth={100}
                minHeight={100}
                circularCrop // This makes the crop overlay circular
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageSrc}
                  style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[350px] object-contain"
                />
              </ReactCrop>
            )}
          </div>

          {/* Zoom control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex items-center space-x-3">
              <span className="text-xs">-</span>
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                max={3}
                min={0.5}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs">+</span>
            </div>
          </div>

          {/* Rotation control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rotation</label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Slider
                value={[rotate]}
                onValueChange={(value) => setRotate(value[0])}
                max={180}
                min={-180}
                step={5}
                className="flex-1"
              />
              <span className="text-xs w-12 text-center">{rotate}°</span>
            </div>
          </div>

          {/* Preview canvas (hidden) */}
          <canvas
            ref={previewCanvasRef}
            style={{ display: 'none' }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCropComplete}>
            <Check className="h-4 w-4 mr-2" />
            Use This Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};