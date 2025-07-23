"use client";

import * as React from "react";
import { enhanceFace } from "@/ai/flows/enhance-face";
import { generateBackground } from "@/ai/flows/generate-background";
import { upscaleImage } from "@/ai/flows/upscale-image";
import { correctColor } from "@/ai/flows/correct-color";
import { removeBackground } from "@/ai/flows/remove-background";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { EditorSidebar } from "@/components/editor-sidebar";
import { ImageWorkspace } from "@/components/image-workspace";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ImageCropper } from "@/components/image-cropper";
import { v4 as uuidv4 } from "uuid";

export type CustomColor = {
  id: string;
  value: string;
};

export type EditingState = {
  backgroundRemoved: boolean;
  backgroundPrompt: string;
  backgroundColor: string;
  faceEnhanced: boolean;
  rotation: number;
  flip: boolean;
};

export default function Home() {
  const { toast } = useToast();
  const [image, setImage] = React.useState<string | null>(null);
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [isCropping, setIsCropping] = React.useState(false);
  const [cropAspectRatio, setCropAspectRatio] = React.useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");
  
  const [editingState, setEditingState] = React.useState<EditingState>({
    backgroundRemoved: false,
    backgroundPrompt: "",
    backgroundColor: "transparent",
    faceEnhanced: false,
    rotation: 0,
    flip: false,
  });

  const [customColors, setCustomColors] = React.useState<CustomColor[]>([
    { id: uuidv4(), value: "#ffffff" },
    { id: uuidv4(), value: "#000000" },
    { id: uuidv4(), value: "#e0e0e0" },
    { id: uuidv4(), value: "#ffcdd2" },
    { id: uuidv4(), value: "#c8e6c9" },
  ]);

  const handleAddColor = (color: string) => {
    if (customColors.length < 10) {
      setCustomColors([...customColors, { id: uuidv4(), value: color }]);
    } else {
      toast({
        variant: "destructive",
        title: "Limit reached",
        description: "You can only have 10 custom colors.",
      });
    }
  };

  const handleUpdateColor = (id: string, value: string) => {
    setCustomColors(
      customColors.map((c) => (c.id === id ? { ...c, value } : c))
    );
  };

  const handleRemoveColor = (id: string) => {
    setCustomColors(customColors.filter((c) => c.id !== id));
  };


  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setOriginalImage(dataUrl);
      setEditingState({
        backgroundRemoved: false,
        backgroundPrompt: "",
        backgroundColor: "transparent",
        faceEnhanced: false,
        rotation: 0,
        flip: false,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFaceEnhance = async () => {
    if (!image) return;
    setIsLoading(true);
    setLoadingMessage("Enhancing face...");
    try {
      const result = await enhanceFace({ photoDataUri: image });
      setImage(result.enhancedPhotoDataUri);
      setEditingState(prev => ({ ...prev, faceEnhanced: true }));
      toast({
        title: "Success",
        description: "Face enhancement applied.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to enhance face.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackground = async (prompt: string) => {
    if (!image) return;
    setIsLoading(true);
    setLoadingMessage("Generating background...");
    try {
      const result = await generateBackground({ prompt });
      setEditingState(prev => ({
        ...prev,
        backgroundRemoved: true,
        backgroundColor: `url(${result.backgroundImage})`,
      }));
       toast({
        title: "Success",
        description: "AI background generated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate background.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpscaleImage = async () => {
    if (!image) return;
    setIsLoading(true);
    setLoadingMessage("Upscaling image...");
    try {
      const result = await upscaleImage({ photoDataUri: image });
      setImage(result.upscaledPhotoDataUri);
      toast({
        title: "Success",
        description: "Image upscaled.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upscale image.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCorrectColor = async () => {
    if (!image) return;
    setIsLoading(true);
    setLoadingMessage("Correcting colors...");
    try {
      const result = await correctColor({ photoDataUri: image });
      if (result?.correctedPhotoDataUri) {
        setImage(result.correctedPhotoDataUri);
        toast({
          title: "Success",
          description: "Color correction applied.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to correct colors.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!image) return;
    setIsLoading(true);
    setLoadingMessage("Removing background...");
    try {
      const result = await removeBackground({ photoDataUri: image });
      if (result?.photoWithBackgroundRemovedDataUri) {
        setImage(result.photoWithBackgroundRemovedDataUri);
        setEditingState(prev => ({
          ...prev,
          backgroundRemoved: true,
          backgroundColor: 'transparent',
        }));
        toast({
          title: "Success",
          description: "Background removed.",
        });
      } else {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Background removal failed to return an image.",
        });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleReset = () => {
    if (originalImage) {
      setImage(originalImage);
      setEditingState({
        backgroundRemoved: false,
        backgroundPrompt: "",
        backgroundColor: "transparent",
        faceEnhanced: false,
        rotation: 0,
        flip: false,
      });
    }
  }

  const handleDownload = () => {
    if (!image) return;

    const img = new (window.Image as any)();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Apply background if it's a solid color and the background has been "removed"
      if (editingState.backgroundRemoved && editingState.backgroundColor.startsWith("#")) {
        ctx.fillStyle = editingState.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw the potentially transparent image on top
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "ai-photo-ace-edit.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Image downloaded!",
        description: "Your masterpiece is saved.",
      });
    };
    img.crossOrigin = "anonymous";
    img.src = image;
  };

  const handleCrop = (aspectRatio?: number) => {
    setCropAspectRatio(aspectRatio);
    setIsCropping(true);
  };
  
  const handleCropComplete = (croppedImage: string) => {
    setImage(croppedImage);
    setOriginalImage(croppedImage); // Set the new cropped image as the base for further edits
    setIsCropping(false);
    toast({
      title: "Success",
      description: "Image cropped.",
    });
  };

  if (isCropping && image) {
    return (
      <ImageCropper
        image={image}
        aspect={cropAspectRatio}
        onCropComplete={handleCropComplete}
        onCancel={() => setIsCropping(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[350px_1fr] overflow-hidden">
        <EditorSidebar
          onFaceEnhance={handleFaceEnhance}
          onGenerateBackground={handleGenerateBackground}
          onUpscaleImage={handleUpscaleImage}
          onCorrectColor={handleCorrectColor}
          onRemoveBackground={handleRemoveBackground}
          setEditingState={setEditingState}
          editingState={editingState}
          onReset={handleReset}
          onCrop={handleCrop}
          isDisabled={!image || isLoading}
          customColors={customColors}
          onAddColor={handleAddColor}
          onUpdateColor={handleUpdateColor}
          onRemoveColor={handleRemoveColor}
        />
        <div className="flex flex-col bg-muted/30 dark:bg-black/20 p-4 md:p-8 overflow-auto">
           <ImageWorkspace
            image={image}
            originalImage={originalImage}
            onImageUpload={handleImageUpload}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            editingState={editingState}
          />
          {image && (
             <div className="flex-shrink-0 pt-4 flex justify-end">
              <Button onClick={handleDownload} size="lg" className="font-headline" disabled={isLoading}>
                <Download className="mr-2 h-5 w-5" />
                Export Image
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
