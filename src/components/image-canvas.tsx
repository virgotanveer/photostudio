
"use client";

import * as React from "react";
import type { EditingState } from "@/app/page";

interface ImageCanvasProps {
  image: string;
  editingState: EditingState;
}

// Helper function to apply color adjustments
const applyAdjustments = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  {
    brightness,
    contrast,
    saturation,
    temperature,
    highlights,
    shadows,
  }: EditingState
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Factors
  const brightnessFactor = (brightness / 100);
  const contrastFactor = (contrast / 100) + 1;
  const saturationFactor = (saturation / 100) + 1;
  const temperatureFactor = temperature / 100;
  const highlightsFactor = highlights / 100;
  const shadowsFactor = shadows / 100;


  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Brightness
    r += 255 * brightnessFactor;
    g += 255 * brightnessFactor;
    b += 255 * brightnessFactor;
    
    // Contrast
    r = ((((r / 255) - 0.5) * contrastFactor) + 0.5) * 255;
    g = ((((g / 255) - 0.5) * contrastFactor) + 0.5) * 255;
    b = ((((b / 255) - 0.5) * contrastFactor) + 0.5) * 255;
    
    // Saturation
    const gray = r * 0.3 + g * 0.59 + b * 0.11;
    r = gray + (r - gray) * saturationFactor;
    g = gray + (g - gray) * saturationFactor;
    b = gray + (b - gray) * saturationFactor;

    // Temperature
    if (temperatureFactor > 0) {
      r += 255 * temperatureFactor;
      b -= 255 * temperatureFactor;
    } else {
      r -= 255 * -temperatureFactor;
      b += 255 * -temperatureFactor;
    }

    // Highlights and Shadows
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    if (luminance > 128) { // Highlights
      r += 255 * highlightsFactor;
      g += 255 * highlightsFactor;
      b += 255 * highlightsFactor;
    } else { // Shadows
      r += 255 * shadowsFactor;
      g += 255 * shadowsFactor;
      b += 255 * shadowsFactor;
    }


    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(imageData, 0, 0);
};

export function ImageCanvas({ image, editingState }: ImageCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { rotation, flip } = editingState;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      
      const rad = rotation * (Math.PI / 180);
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));
      
      canvas.width = Math.round(w * absCos + h * absSin);
      canvas.height = Math.round(w * absSin + h * absCos);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.scale(flip ? -1 : 1, 1);
      ctx.drawImage(img, -w / 2, -h / 2);
      ctx.restore();
      
      applyAdjustments(ctx, canvas.width, canvas.height, editingState);
    };
    img.src = image;

  }, [image, editingState]);

  return <canvas id="image-canvas" ref={canvasRef} className="max-w-full max-h-full object-contain" />;
}

    