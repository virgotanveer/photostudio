"use client";

import * as React from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import type { EditingState } from "@/app/page";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface ImageWorkspaceProps {
  image: string | null;
  originalImage: string | null;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  loadingMessage: string;
  editingState: EditingState;
}

export function ImageWorkspace({
  image,
  originalImage,
  onImageUpload,
  isLoading,
  loadingMessage,
  editingState,
}: ImageWorkspaceProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const backgroundStyle: React.CSSProperties = editingState.backgroundRemoved
    ? editingState.backgroundColor.startsWith("#")
      ? { backgroundColor: editingState.backgroundColor }
      : { backgroundImage: editingState.backgroundColor }
    : {
        backgroundImage:
          "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
      };

  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div
        className={cn(
          "relative w-full h-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center transition-all duration-300",
          { "border-primary bg-accent/50": isDragging },
          { "border-transparent": image }
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 z-20 flex flex-col items-center justify-center rounded-lg">
            <div className="w-16 h-16 border-4 border-white border-t-primary rounded-full animate-spin"></div>
            <p className="text-white mt-4 font-semibold font-headline">{loadingMessage}</p>
          </div>
        )}

        {image ? (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg"
            style={backgroundStyle}
          >
            <Image
              src={image}
              alt="Edited photo"
              width={800}
              height={800}
              className={cn(
                "object-contain max-w-full max-h-full transition-transform duration-300 ease-in-out",
                { "mix-blend-normal": editingState.backgroundRemoved }
              )}
              style={{
                imageRendering: 'pixelated'
              }}
            />
          </div>
        ) : (
          <div
            className="text-center cursor-pointer p-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-1 font-headline">
              Drag & drop an image
            </h3>
            <p className="text-muted-foreground">or click to browse</p>
            <p className="text-sm text-muted-foreground mt-4">Supports: JPG, PNG, TIFF</p>
            <div className="flex gap-4 mt-8 justify-center">
                <div className="w-32 h-32">
                    <Image src="https://placehold.co/400x400.png" alt="placeholder product" data-ai-hint="product photo" width={128} height={128} className="rounded-lg object-cover shadow-md" />
                </div>
                 <div className="w-32 h-32">
                    <Image src="https://placehold.co/400x400.png" alt="placeholder portrait" data-ai-hint="portrait photo" width={128} height={128} className="rounded-lg object-cover shadow-md" />
                </div>
                 <div className="w-32 h-32">
                    <Image src="https://placehold.co/400x400.png" alt="placeholder graphic" data-ai-hint="graphic design" width={128} height={128} className="rounded-lg object-cover shadow-md" />
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
