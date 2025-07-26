// src/components/image-cropper.tsx
"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Check, X } from 'lucide-react';
import { Label } from './ui/label';

interface ImageCropperProps {
  image: string;
  aspect?: number;
  outputWidth?: number;
  outputHeight?: number;
  initialRotation?: number;
  onCropComplete: (croppedImage: string, rotation: number) => void;
  onCancel: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}


const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  outputWidth?: number,
  outputHeight?: number
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const rotRad = getRadianAngle(rotation);
  const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  const finalCanvas = document.createElement('canvas');
  const finalCtx = finalCanvas.getContext('2d');
  
  if (!finalCtx) {
    throw new Error('Could not create final canvas context');
  }

  finalCanvas.width = pixelCrop.width;
  finalCanvas.height = pixelCrop.height;
  finalCtx.putImageData(data, 0, 0);

  if (outputWidth && outputHeight) {
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = outputWidth;
    resizedCanvas.height = outputHeight;
    const resizedCtx = resizedCanvas.getContext('2d');
    if (!resizedCtx) {
        throw new Error('Could not create resized canvas context');
    }
    resizedCtx.drawImage(finalCanvas, 0, 0, outputWidth, outputHeight);
    return resizedCanvas.toDataURL('image/png');
  }

  return finalCanvas.toDataURL('image/png');
};


export function ImageCropper({ 
    image, 
    aspect, 
    outputWidth, 
    outputHeight, 
    initialRotation = 0,
    onCropComplete, 
    onCancel 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(initialRotation);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((value: number[]) => {
    setZoom(value[0]);
  }, []);

  const onRotationChange = useCallback((value: number[]) => {
    setRotation(value[0]);
  }, []);

  const handleCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation, outputWidth, outputHeight);
        onCropComplete(croppedImage, rotation);
      }
    } catch (e) {
      console.error(e);
    }
  }, [image, croppedAreaPixels, onCropComplete, rotation, outputWidth, outputHeight]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full h-[70vh] md:w-[60vw] md:h-[75vh]">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={onCropChange}
          onZoomChange={(zoomValue, newZoom) => onZoomChange([newZoom])}
          onRotationChange={(newRotation) => onRotationChange([newRotation])}
          onCropComplete={handleCropComplete}
        />
      </div>
      <div className="p-4 bg-card rounded-lg flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl mt-4">
         <div className="w-full flex-1">
           <Label className="text-sm font-medium mb-2 block">Zoom</Label>
           <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={onZoomChange}
            aria-label="Zoom"
          />
         </div>
         <div className="w-full flex-1">
            <Label className="text-sm font-medium mb-2 block flex justify-between">
                <span>Straighten</span>
                <span className="text-muted-foreground">{rotation.toFixed(1)}°</span>
            </Label>
            <Slider
                value={[rotation]}
                min={-45}
                max={45}
                step={0.1}
                onValueChange={onRotationChange}
                aria-label="Rotation"
            />
         </div>
         <div className="flex gap-2 ml-auto self-end">
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
