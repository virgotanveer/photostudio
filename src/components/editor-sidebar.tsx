"use client";

import type { Dispatch, SetStateAction } from "react";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { EditingState } from "@/app/page";
import {
  Brush,
  Circle,
  Crop,
  Droplet,
  FlipHorizontal,
  Image,
  RefreshCw,
  Sparkles,
  Maximize,
  RotateCcw,
} from "lucide-react";

interface EditorSidebarProps {
  onFaceEnhance: () => void;
  onGenerateBackground: (prompt: string) => void;
  onUpscaleImage: () => void;
  onCorrectColor: () => void;
  onRemoveBackground: () => void;
  setEditingState: Dispatch<SetStateAction<EditingState>>;
  editingState: EditingState;
  onReset: () => void;
  onCrop: (aspectRatio?: number) => void;
  isDisabled: boolean;
}

export function EditorSidebar({
  onFaceEnhance,
  onGenerateBackground,
  onUpscaleImage,
  onCorrectColor,
  onRemoveBackground,
  setEditingState,
  editingState,
  onReset,
  onCrop,
  isDisabled,
}: EditorSidebarProps) {
  const [prompt, setPrompt] = React.useState("");
  const [cropWidth, setCropWidth] = React.useState("");
  const [cropHeight, setCropHeight] = React.useState("");


  const handleColorChange = (color: string) => {
    setEditingState((prev) => ({ ...prev, backgroundColor: color, backgroundRemoved: true }));
  };

  const handleBackgroundTemplate = (templatePrompt: string) => {
    setEditingState((prev) => ({...prev, backgroundPrompt: templatePrompt}));
    onGenerateBackground(templatePrompt);
  }

  const handleRotate = () => {
    setEditingState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const handleFlip = () => {
    setEditingState(prev => ({ ...prev, flip: !prev.flip }));
  };
  
  const handleCropPreset = (value: string) => {
    const ratios: { [key: string]: number } = {
      instagram_post: 1 / 1,
      instagram_story: 9 / 16,
      linkedin_banner: 4 / 1,
      twitter_post: 16 / 9,
    };
    onCrop(ratios[value]);
  };

  const handleApplyCustomCrop = () => {
    const width = parseInt(cropWidth);
    const height = parseInt(cropHeight);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      onCrop(width / height);
    }
  };


  return (
    <aside className="border-r border-border/80 bg-card p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-4 font-headline">Edit Tools</h2>
        <Accordion type="multiple" defaultValue={["background", "enhance", "adjust"]} className="w-full">
          <AccordionItem value="background">
            <AccordionTrigger className="text-lg font-headline">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5" /> Background
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <Button
                onClick={onRemoveBackground}
                variant={editingState.backgroundRemoved && editingState.backgroundColor === 'transparent' ? "secondary" : "outline"}
                className="w-full"
                disabled={isDisabled}
              >
                <Brush className="mr-2 h-4 w-4" />
                Remove Background
              </Button>
              <div className="space-y-2">
                <Label>Solid Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {["#ffffff", "#000000", "#e0e0e0", "#ffcdd2", "#c8e6c9"].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className="w-full h-8 rounded-md border-2 transition-all"
                      style={{ backgroundColor: color, borderColor: editingState.backgroundColor === color ? 'hsl(var(--primary))' : 'transparent' }}
                      aria-label={`Set background to ${color}`}
                      disabled={isDisabled}
                    />
                  ))}
                </div>
                 <div className="flex items-center gap-2">
                    <input type="color" value={editingState.backgroundColor.startsWith('#') ? editingState.backgroundColor : '#ffffff'} onChange={(e) => handleColorChange(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent rounded" disabled={isDisabled}/>
                    <Input value={editingState.backgroundColor} onChange={(e) => handleColorChange(e.target.value)} placeholder="#RRGGBB" className="flex-1" disabled={isDisabled}/>
                </div>
              </div>
              <Separator />
               <div className="space-y-2">
                 <Label htmlFor="ai-prompt">AI Generated Background</Label>
                 <div className="flex gap-2">
                    <Input id="ai-prompt" placeholder="e.g. A vibrant forest" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isDisabled}/>
                    <Button onClick={() => onGenerateBackground(prompt)} disabled={!prompt || isDisabled}><Sparkles className="h-4 w-4"/></Button>
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-sm">
                    <Button variant="outline" size="sm" onClick={() => handleBackgroundTemplate("A professional photography studio, soft lighting")} disabled={isDisabled}>Studio</Button>
                    <Button variant="outline" size="sm" onClick={() => handleBackgroundTemplate("A beautiful beach at sunset")} disabled={isDisabled}>Beach</Button>
                    <Button variant="outline" size="sm" onClick={() => handleBackgroundTemplate("A modern cityscape at night")} disabled={isDisabled}>City</Button>
                    <Button variant="outline" size="sm" onClick={() => handleBackgroundTemplate("Abstract geometric patterns, pastel colors")} disabled={isDisabled}>Abstract</Button>
                 </div>
               </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="enhance">
            <AccordionTrigger className="text-lg font-headline">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" /> Enhance
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <Button onClick={onFaceEnhance} className="w-full" variant="outline" disabled={isDisabled}>
                <Circle className="mr-2 h-4 w-4" /> AI Enhance Face
              </Button>
               <Button variant="outline" className="w-full" onClick={onUpscaleImage} disabled={isDisabled}>
                <Maximize className="mr-2 h-4 w-4" /> AI Upscale Image
              </Button>
               <Button variant="outline" className="w-full" onClick={onCorrectColor} disabled={isDisabled}>
                <Droplet className="mr-2 h-4 w-4" /> AI Color Correction
              </Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="adjust">
            <AccordionTrigger className="text-lg font-headline">
              <div className="flex items-center gap-3">
                <Crop className="h-5 w-5" /> Adjust
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Crop & Resize</Label>
                <Select onValueChange={handleCropPreset} disabled={isDisabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram_post">Instagram Post (1:1)</SelectItem>
                    <SelectItem value="instagram_story">Instagram Story (9:16)</SelectItem>
                    <SelectItem value="linkedin_banner">LinkedIn Banner (4:1)</SelectItem>
                    <SelectItem value="twitter_post">Twitter Post (16:9)</SelectItem>
                  </SelectContent>
                </Select>
                 <div className="flex gap-2">
                    <Input placeholder="Width" type="number" value={cropWidth} onChange={e => setCropWidth(e.target.value)} disabled={isDisabled} />
                    <Input placeholder="Height" type="number" value={cropHeight} onChange={e => setCropHeight(e.target.value)} disabled={isDisabled} />
                </div>
                 <Button variant="outline" className="w-full" onClick={handleApplyCustomCrop} disabled={isDisabled || !cropWidth || !cropHeight}>Apply Crop</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleRotate} disabled={isDisabled}><RotateCcw className="mr-2 h-4 w-4" /> Rotate</Button>
                <Button variant="outline" onClick={handleFlip} disabled={isDisabled}><FlipHorizontal className="mr-2 h-4 w-4" /> Flip</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
       <div className="flex-shrink-0 pt-4 border-t mt-4">
        <Button onClick={onReset} variant="destructive" className="w-full" disabled={isDisabled}>
          <RefreshCw className="mr-2 h-4 w-4" /> Reset All Changes
        </Button>
      </div>
    </aside>
  );
}
