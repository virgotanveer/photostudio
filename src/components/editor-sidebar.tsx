
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
import type { EditingState, CustomColor } from "@/app/page";
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
  Plus,
  Trash2,
  Printer,
  Scissors,
  Palette,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "./ui/slider";

interface EditorSidebarProps {
  onFaceEnhance: () => void;
  onGenerateBackground: (prompt: string) => void;
  onUpscaleImage: () => void;
  onCorrectColor: () => void;
  onRemoveBackground: () => void;
  setEditingState: Dispatch<SetStateAction<EditingState>>;
  editingState: EditingState;
  onReset: () => void;
  onRotate: () => void;
  onCropPreset: (aspectRatio?: number) => void;
  onResizeAndCrop: (width: number, height: number, unit: string) => void;
  onPrintExport: (paperSize: '4x6' | '5x7') => void;
  isDisabled: boolean;
  customColors: CustomColor[];
  onAddColor: (color: string) => void;
  onUpdateColor: (id: string, value: string) => void;
  onRemoveColor: (id: string) => void;
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
  onRotate,
  onCropPreset,
  onResizeAndCrop,
  onPrintExport,
  isDisabled,
  customColors,
  onAddColor,
  onUpdateColor,
  onRemoveColor,
}: EditorSidebarProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = React.useState("");
  const [customWidth, setCustomWidth] = React.useState("");
  const [customHeight, setCustomHeight] = React.useState("");
  const [customUnit, setCustomUnit] = React.useState("px");
  const [newColor, setNewColor] = React.useState("#000000");
  const [printSize, setPrintSize] = React.useState<'4x6' | '5x7'>('4x6');


  const handleColorChange = (color: string) => {
    setEditingState((prev) => ({ ...prev, backgroundColor: color, backgroundRemoved: true }));
  };
  
  const handleTransparentBackground = () => {
    setEditingState((prev) => ({ ...prev, backgroundColor: 'transparent', backgroundRemoved: true }));
  }

  const handleBackgroundTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    onGenerateBackground(templatePrompt);
  }

  const handleFlip = () => {
    setEditingState(prev => ({ ...prev, flip: !prev.flip }));
  };
  
  const handleCropPresetChange = (value: string) => {
    if (value === "custom") {
        onCropPreset(undefined);
        return;
    }
    const ratios: { [key: string]: number } = {
      instagram_post: 1 / 1,
      instagram_story: 9 / 16,
      linkedin_banner: 4 / 1,
      twitter_post: 16 / 9,
    };
    onCropPreset(ratios[value]);
  };

  const handleApplyResizeAndCrop = () => {
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      onResizeAndCrop(width, height, customUnit);
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Dimensions",
            description: "Please enter valid numbers for width and height.",
        });
    }
  };

  const handleAddNewColor = () => {
    onAddColor(newColor);
    setNewColor("#000000");
  };

  const handleColorAdjustment = (key: keyof EditingState, value: number) => {
    setEditingState(prev => ({...prev, [key]: value}));
  };

  return (
    <aside className="border-r border-border/80 bg-card p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-4 font-headline">Edit Tools</h2>
        <Accordion type="multiple" defaultValue={["background", "enhance", "adjust", "colors", "print"]} className="w-full">
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
                  <button
                      onClick={handleTransparentBackground}
                      className="w-full h-8 rounded-md border-2 transition-all flex items-center justify-center bg-transparent"
                      style={{ borderColor: editingState.backgroundColor === 'transparent' ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                      aria-label="Set background to transparent"
                      disabled={isDisabled}
                    >
                    <div className="w-4 h-4 bg-white" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}></div>
                  </button>
                  {customColors.map((color) => (
                    <div key={color.id} className="relative group">
                      <button
                        onClick={() => handleColorChange(color.value)}
                        className="w-full h-8 rounded-md border-2 transition-all"
                        style={{ backgroundColor: color.value, borderColor: editingState.backgroundColor === color.value ? 'hsl(var(--primary))' : 'transparent' }}
                        aria-label={`Set background to ${color.value}`}
                        disabled={isDisabled}
                      />
                       <button onClick={() => onRemoveColor(color.id)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" disabled={isDisabled}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                 {customColors.length < 10 && (
                    <div className="flex items-center gap-2 pt-2">
                         <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="w-8 h-8 rounded-md border"
                                    style={{ backgroundColor: newColor }}
                                    disabled={isDisabled}
                                />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-16 h-16 p-0 border-none bg-transparent rounded" disabled={isDisabled}/>
                            </PopoverContent>
                        </Popover>
                        <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="flex-1" disabled={isDisabled}/>
                        <Button size="icon" onClick={handleAddNewColor} disabled={isDisabled}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                 <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={editingState.backgroundColor.startsWith('#') ? editingState.backgroundColor : '#ffffff'} onChange={(e) => handleColorChange(e.target.value)} className="w-8 h-8 p-0 border-none bg-transparent rounded" disabled={isDisabled}/>
                    <Input value={editingState.backgroundColor} onChange={(e) => handleColorChange(e.target.value)} placeholder="#RRGGBB or url(...)" className="flex-1" disabled={isDisabled}/>
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
          
          <AccordionItem value="colors">
            <AccordionTrigger className="text-lg font-headline">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5" /> Color Adjustments
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="flex justify-between"><span>Brightness</span><span className="text-muted-foreground">{editingState.brightness.toFixed(0)}</span></Label>
                <Slider value={[editingState.brightness]} onValueChange={(v) => handleColorAdjustment('brightness', v[0])} min={-100} max={100} step={1} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between"><span>Contrast</span><span className="text-muted-foreground">{editingState.contrast.toFixed(0)}</span></Label>
                <Slider value={[editingState.contrast]} onValueChange={(v) => handleColorAdjustment('contrast', v[0])} min={-100} max={100} step={1} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between"><span>Saturation</span><span className="text-muted-foreground">{editingState.saturation.toFixed(0)}</span></Label>
                <Slider value={[editingState.saturation]} onValueChange={(v) => handleColorAdjustment('saturation', v[0])} min={-100} max={100} step={1} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between"><span>Temperature</span><span className="text-muted-foreground">{editingState.temperature.toFixed(0)}</span></Label>
                <Slider value={[editingState.temperature]} onValueChange={(v) => handleColorAdjustment('temperature', v[0])} min={-100} max={100} step={1} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between"><span>Highlights</span><span className="text-muted-foreground">{editingState.highlights.toFixed(0)}</span></Label>
                <Slider value={[editingState.highlights]} onValueChange={(v) => handleColorAdjustment('highlights', v[0])} min={-100} max={100} step={1} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <Label className="flex justify-between"><span>Shadows</span><span className="text-muted-foreground">{editingState.shadows.toFixed(0)}</span></Label>
                <Slider value={[editingState.shadows]} onValueChange={(v) => handleColorAdjustment('shadows', v[0])} min={-100} max={100} step={1} disabled={isDisabled} />
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
                <Label>Crop by Preset</Label>
                <Select onValueChange={handleCropPresetChange} disabled={isDisabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Freeform Crop</SelectItem>
                    <SelectItem value="instagram_post">Instagram Post (1:1)</SelectItem>
                    <SelectItem value="instagram_story">Instagram Story (9:16)</SelectItem>
                    <SelectItem value="linkedin_banner">LinkedIn Banner (4:1)</SelectItem>
                    <SelectItem value="twitter_post">Twitter Post (16:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
               <div className="space-y-2">
                <Label>Resize & Crop</Label>
                 <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <Input placeholder="Width" type="text" value={customWidth} onChange={e => setCustomWidth(e.target.value)} disabled={isDisabled} aria-label="Resize width"/>
                    <Input placeholder="Height" type="text" value={customHeight} onChange={e => setCustomHeight(e.target.value)} disabled={isDisabled} aria-label="Resize height"/>
                    <Select value={customUnit} onValueChange={setCustomUnit} disabled={isDisabled}>
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
                 <Button className="w-full" onClick={handleApplyResizeAndCrop} disabled={isDisabled || !customWidth || !customHeight}>
                    <Scissors className="mr-2 h-4 w-4" /> Resize & Crop
                </Button>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={onRotate} disabled={isDisabled}><RotateCcw className="mr-2 h-4 w-4" /> Rotate</Button>
                <Button variant="outline" onClick={handleFlip} disabled={isDisabled}><FlipHorizontal className="mr-2 h-4 w-4" /> Flip</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="print">
            <AccordionTrigger className="text-lg font-headline">
                <div className="flex items-center gap-3">
                    <Printer className="h-5 w-5" /> Print Layout
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                    <Label>Paper Size</Label>
                    <Select onValueChange={(v) => setPrintSize(v as '4x6' | '5x7')} defaultValue="4x6" disabled={isDisabled}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select paper size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="4x6">4 x 6 inches</SelectItem>
                            <SelectItem value="5x7">5 x 7 inches</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => onPrintExport(printSize)} className="w-full" disabled={isDisabled}>
                    <Printer className="mr-2 h-4 w-4" /> Export for Print
                </Button>
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

    