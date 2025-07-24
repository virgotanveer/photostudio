// src/components/image-cropper.tsx
"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Check, X } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  aspect?: number;
  outputWidth?: number;
  outputHeight?: number;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ 
    image, 
    aspect, 
    outputWidth, 
    outputHeight, 
    onCropComplete, 
    onCancel 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((value: number[]) => {
    setZoom(value[0]);
  }, []);

  const handleCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    outputWidth?: number,
    outputHeight?: number,
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.width = outputWidth || pixelCrop.width;
    canvas.height = outputHeight || pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    
    return canvas.toDataURL('image/png');
  };

  const showCroppedImage = useCallback(async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, outputWidth, outputHeight);
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  }, [image, croppedAreaPixels, onCropComplete, getCroppedImg, outputWidth, outputHeight]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
      <div className="relative w-[90vw] h-[70vh] md:w-[60vw] md:h-[80vh]">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onZoomChange={(zoomValue, newZoom) => onZoomChange([newZoom])}
          onCropComplete={handleCropComplete}
        />
      </div>
      <div className="p-4 bg-card rounded-b-lg flex items-center gap-4 w-[90vw] md:w-[60vw]">
         <div className="w-full max-w-xs">
           <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={onZoomChange}
            aria-label="Zoom"
          />
         </div>
         <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={showCroppedImage}>
                <Check className="mr-2 h-4 w-4" /> Apply
            </Button>
         </div>
      </div>
    </div>
  );
}
