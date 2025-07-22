"use client";

import { WandSparkles } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex-shrink-0 border-b border-border/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-2">
            <WandSparkles className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline tracking-tight text-foreground">
              AI Photo Ace
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
