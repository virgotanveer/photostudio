
"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, CheckCircle2, XCircle, FileImage, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { removeBackground } from "@/ai/flows/remove-background";
import { cropImage } from "@/ai/flows/crop-image";
import Link from 'next/link';

type ImageFile = {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "processing" | "success" | "error";
  processedUri?: string;
  error?: string;
};

type CropSettings = {
  preset: "35x45mm" | "1.5x1.5in" | "2x2in" | "custom";
  width: number;
  height: number;
  unit: "mm" | "in" | "cm" | "px";
};

const CROP_PRESETS = {
  "35x45mm": { width: 35, height: 45, unit: "mm" },
  "1.5x1.5in": { width: 1.5, height: 1.5, unit: "in" },
  "2x2in": { width: 2, height: 2, unit: "in" },
};

export default function BulkEditPage() {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = React.useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Editing Options
  const [shouldRemoveBackground, setShouldRemoveBackground] = React.useState(false);
  const [backgroundColor, setBackgroundColor] = React.useState("transparent");
  const [shouldCrop, setShouldCrop] = React.useState(false);
  const [cropSettings, setCropSettings] = React.useState<CropSettings>({
    preset: "35x45mm",
    width: 35,
    height: 45,
    unit: "mm",
  });

  // Export options
  const [paperSize, setPaperSize] = React.useState<"4x6" | "5x7">("4x6");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles: ImageFile[] = Array.from(files).map((file) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
    }));
    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };
  
  const handleProcessImages = async () => {
    if (imageFiles.length === 0) {
      toast({ variant: 'destructive', title: 'No images selected', description: 'Please upload images to process.' });
      return;
    }
    setIsProcessing(true);

    const updatedFiles = [...imageFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
        const currentFile = updatedFiles[i];
        if (currentFile.status === 'success') continue;

        try {
            updatedFiles[i] = { ...currentFile, status: 'processing' };
            setImageFiles([...updatedFiles]);

            const reader = new FileReader();
            let dataUri = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(currentFile.file);
            });
            
            if (shouldRemoveBackground) {
                const result = await removeBackground({ photoDataUri: dataUri });
                dataUri = result.photoWithBackgroundRemovedDataUri;
            }

            if (shouldCrop) {
              const { width, height, unit } = cropSettings.preset === 'custom' 
                  ? cropSettings
                  : CROP_PRESETS[cropSettings.preset];

              const DPI = 300;
              let targetWidth = width;
              let targetHeight = height;

              if (unit === 'in') {
                targetWidth = width * DPI;
                targetHeight = height * DPI;
              } else if (unit === 'cm') {
                targetWidth = (width / 2.54) * DPI;
                targetHeight = (height / 2.54) * DPI;
              } else if (unit === 'mm') {
                targetWidth = (width / 25.4) * DPI;
                targetHeight = (height / 25.4) * DPI;
              }
              
              const result = await cropImage({ 
                photoDataUri: dataUri,
                targetWidth: Math.round(targetWidth),
                targetHeight: Math.round(targetHeight)
              });
              dataUri = result.croppedPhotoDataUri;
            }

            updatedFiles[i] = { ...updatedFiles[i], status: 'success', processedUri: dataUri };
            setImageFiles([...updatedFiles]);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            updatedFiles[i] = { ...updatedFiles[i], status: 'error', error: errorMessage };
            setImageFiles([...updatedFiles]);
        }
    }
    setIsProcessing(false);
    toast({ title: "Processing complete!", description: "You can now export the final print layout." });
  };
  
  const handleExport = async () => {
    const successfulImages = imageFiles.filter(f => f.status === 'success' && f.processedUri);
    if (successfulImages.length === 0) {
        toast({ variant: 'destructive', title: 'No processed images', description: 'Please process images successfully before exporting.' });
        return;
    }

    const firstImageUri = successfulImages[0].processedUri!;
    
    const img = new Image();
    img.src = firstImageUri;
    await new Promise(resolve => { img.onload = resolve });

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = img.width;
    sourceCanvas.height = img.height;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) return;

    // Common properties for print layout
    const DPI = 300;
    const paperDimensions = {
      '4x6': { width: 6 * DPI, height: 4 * DPI },
      '5x7': { width: 7 * DPI, height: 5 * DPI },
    };
    const BORDER_WIDTH = 1;
    const CUTTING_MARGIN = 25;

    const { width: paperWidth, height: paperHeight } = paperDimensions[paperSize];
    
    const printCanvas = document.createElement('canvas');
    printCanvas.width = paperWidth;
    printCanvas.height = paperHeight;
    const ctx = printCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);
    
    const photoWithBorderWidth = sourceCanvas.width + 2 * BORDER_WIDTH;
    const photoWithBorderHeight = sourceCanvas.height + 2 * BORDER_WIDTH;
    
    const photoCanvas = document.createElement("canvas");
    photoCanvas.width = photoWithBorderWidth;
    photoCanvas.height = photoWithBorderHeight;
    const photoCtx = photoCanvas.getContext("2d");
    if (!photoCtx) return;

    // Draw border
    photoCtx.strokeStyle = 'rgba(0,0,0,0.5)';
    photoCtx.lineWidth = BORDER_WIDTH * 2;
    photoCtx.strokeRect(BORDER_WIDTH, BORDER_WIDTH, sourceCanvas.width, sourceCanvas.height);

    // Composite background color if needed
    if (backgroundColor !== 'transparent') {
        photoCtx.fillStyle = backgroundColor;
        photoCtx.fillRect(BORDER_WIDTH, BORDER_WIDTH, sourceCanvas.width, sourceCanvas.height);
    }
    
    // Draw image over the background and border
    photoCtx.drawImage(sourceCanvas, BORDER_WIDTH, BORDER_WIDTH);


    if (photoWithBorderWidth === 0 || photoWithBorderHeight === 0) {
        toast({ variant: 'destructive', title: 'Image has no size', description: 'Cannot process an image with zero width or height.' });
        return;
    }
    
    const effectivePhotoWidth = photoWithBorderWidth + CUTTING_MARGIN;
    const effectivePhotoHeight = photoWithBorderHeight + CUTTING_MARGIN;
    
    const cols = Math.floor(paperWidth / effectivePhotoWidth);
    const rows = Math.floor(paperHeight / effectivePhotoHeight);

    if (cols === 0 || rows === 0) {
        toast({ variant: 'destructive', title: 'Image too large', description: 'The image is too large to fit on the selected paper size.' });
        return;
    }

    const totalWidth = cols * effectivePhotoWidth - CUTTING_MARGIN;
    const totalHeight = rows * effectivePhotoHeight - CUTTING_MARGIN;
    const offsetX = (paperWidth - totalWidth) / 2;
    const offsetY = (paperHeight - totalHeight) / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.drawImage(photoCanvas, offsetX + col * effectivePhotoWidth, offsetY + row * effectivePhotoHeight);
        }
    }

    const link = document.createElement('a');
    link.href = printCanvas.toDataURL('image/png');
    link.download = `ai-photo-ace-bulk-print-${paperSize}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Print layout created!', description: `Your ${paperSize} image is ready.` });
  }

  const handleCropPresetChange = (value: string) => {
    if (value === 'custom') {
      setCropSettings(prev => ({...prev, preset: 'custom'}));
    } else {
      const preset = value as keyof typeof CROP_PRESETS;
      setCropSettings({
        preset,
        ...CROP_PRESETS[preset]
      });
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Bulk Image Editor</h1>
            <p className="text-muted-foreground mt-2">Process multiple images at once with the same settings.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- Settings Column --- */}
            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>1. Upload Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={cn(
                              "relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center transition-all duration-300 text-center p-4",
                              { "border-primary bg-accent/50": isDragging }
                            )}
                            onDragEnter={(e) => {e.preventDefault(); e.stopPropagation(); setIsDragging(true);}}
                            onDragLeave={(e) => {e.preventDefault(); e.stopPropagation(); setIsDragging(false);}}
                            onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                          >
                             <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e.target.files)}
                              multiple
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer">
                                <UploadCloud className="h-10 w-10" />
                                <span className="font-semibold">Drag & drop images or click to browse</span>
                                <span className="text-sm">Supports multiple JPG, PNG, TIFF</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>2. Editing Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                           <Checkbox id="remove-bg" checked={shouldRemoveBackground} onCheckedChange={(c) => setShouldRemoveBackground(c as boolean)} />
                           <Label htmlFor="remove-bg">Remove Background</Label>
                        </div>
                        <div>
                            <Label>Background Color</Label>
                            <Select value={backgroundColor} onValueChange={setBackgroundColor} disabled={!shouldRemoveBackground}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transparent">Transparent</SelectItem>
                                    <SelectItem value="#ffffff">White</SelectItem>
                                    <SelectItem value="#f0f0f0">Light Grey</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Checkbox id="crop" checked={shouldCrop} onCheckedChange={(c) => setShouldCrop(c as boolean)} />
                           <Label htmlFor="crop">Crop Images</Label>
                        </div>
                         <div className="space-y-2">
                            <Label>Crop Preset</Label>
                            <Select onValueChange={handleCropPresetChange} defaultValue="35x45mm" disabled={!shouldCrop}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a preset" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="35x45mm">Passport (35x45mm)</SelectItem>
                                <SelectItem value="1.5x1.5in">Square (1.5x1.5in)</SelectItem>
                                <SelectItem value="2x2in">Large Square (2x2in)</SelectItem>
                                <SelectItem value="custom">Custom Dimensions</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>

                        {cropSettings.preset === 'custom' && (
                             <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                                <Input placeholder="Width" type="number" value={cropSettings.width} onChange={e => setCropSettings(p => ({...p, width: parseFloat(e.target.value)}))} disabled={!shouldCrop} aria-label="Resize width"/>
                                <Input placeholder="Height" type="number" value={cropSettings.height} onChange={e => setCropSettings(p => ({...p, height: parseFloat(e.target.value)}))} disabled={!shouldCrop} aria-label="Resize height"/>
                                <Select value={cropSettings.unit} onValueChange={(u) => setCropSettings(p => ({...p, unit: u as any}))} disabled={!shouldCrop}>
                                    <SelectTrigger className="w-[65px]">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="px">px</SelectItem>
                                        <SelectItem value="in">in</SelectItem>
                                        <SelectItem value="cm">cm</SelectItem>
                                        <SelectItem value="mm">mm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>3. Export</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Label>Paper Size</Label>
                        <Select onValueChange={(v) => setPaperSize(v as '4x6' | '5x7')} defaultValue="4x6">
                            <SelectTrigger>
                                <SelectValue placeholder="Select paper size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="4x6">4 x 6 inches</SelectItem>
                                <SelectItem value="5x7">5 x 7 inches</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleProcessImages} className="w-full" disabled={isProcessing || imageFiles.length === 0}>
                            {isProcessing ? 'Processing...' : 'Process Images'}
                        </Button>
                         <Button onClick={handleExport} className="w-full" variant="secondary" disabled={isProcessing || imageFiles.every(f => f.status !== 'success')}>
                            <Download className="mr-2 h-4 w-4"/>
                            Export Print Layout
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            {/* --- Image List Column --- */}
            <div className="lg:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Image Queue</CardTitle>
                        <CardDescription>{imageFiles.length} image(s) uploaded</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {imageFiles.length === 0 ? (
                            <div className="text-center text-muted-foreground py-16">
                                <FileImage className="mx-auto h-12 w-12" />
                                <p className="mt-4">Your uploaded images will appear here.</p>
                            </div>
                       ) : (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {imageFiles.map(imgFile => (
                                <div key={imgFile.id} className="flex items-center gap-4 p-2 border rounded-lg">
                                    <img src={imgFile.preview} alt={imgFile.file.name} className="w-16 h-16 object-cover rounded-md" />
                                    <div className="flex-1">
                                        <p className="font-semibold truncate">{imgFile.file.name}</p>
                                        {imgFile.status === 'pending' && <p className="text-sm text-muted-foreground">Waiting to process...</p>}
                                        {imgFile.status === 'processing' && <Progress value={50} className="h-2 mt-1" />}
                                        {imgFile.status === 'success' && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Complete</p>}
                                        {imgFile.status === 'error' && <p className="text-sm text-destructive truncate flex items-center gap-1"><XCircle className="h-4 w-4"/> {imgFile.error}</p>}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setImageFiles(files => files.filter(f => f.id !== imgFile.id))}>
                                        <XCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
