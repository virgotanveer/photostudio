
"use client";

import { WandSparkles } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="flex-shrink-0 border-b border-border/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <WandSparkles className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline tracking-tight text-foreground">
              AI Photo Ace
            </h1>
          </Link>

          <nav className="flex items-center gap-2">
             <Button asChild variant={pathname === '/' ? 'secondary' : 'ghost'}>
                <Link href="/">Single Image</Link>
             </Button>
             <Button asChild variant={pathname === '/bulk-edit' ? 'secondary' : 'ghost'}>
                <Link href="/bulk-edit">Bulk Edit</Link>
             </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
