"use client";

import * as React from "react";
import { enhanceFace } from "@/ai/flows/enhance-face";
import { generateBackground } from "@/ai/flows/generate-background";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { EditorSidebar } from "@/components/editor-sidebar";
import { ImageWorkspace } from "@/components/image-workspace";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export type EditingState = {
  backgroundRemoved: boolean;
  backgroundPrompt: string;
  backgroundColor: string;
  faceEnhanced: boolean;
};

export default function Home() {
  const { toast } = useToast();
  const [image, setImage] = React.useState<string | null>(null);
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");
  
  const [editingState, setEditingState] = React.useState<EditingState>({
    backgroundRemoved: false,
    backgroundPrompt: "",
    backgroundColor: "transparent",
    faceEnhanced: false,
  });

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

  const handleReset = () => {
    if (originalImage) {
      setImage(originalImage);
      setEditingState({
        backgroundRemoved: false,
        backgroundPrompt: "",
        backgroundColor: "transparent",
        faceEnhanced: false,
      });
    }
  }

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = "ai-photo-ace-edit.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Image downloaded!",
      description: "Your masterpiece is saved.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[350px_1fr] overflow-hidden">
        <EditorSidebar
          onFaceEnhance={handleFaceEnhance}
          onGenerateBackground={handleGenerateBackground}
          setEditingState={setEditingState}
          editingState={editingState}
          onReset={handleReset}
          isDisabled={!image || isLoading}
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
