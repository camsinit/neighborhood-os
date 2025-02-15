
import { PixelCrop } from 'react-image-crop';

export const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the cropped size
  canvas.width = crop.width;
  canvas.height = crop.height;

  // Calculate scaling factors
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Set black background by default (for transparent images)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the cropped portion of the image
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  // Return as a blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      },
      'image/jpeg',
      1 // Quality
    );
  });
};
