import type { Metadata } from "next";
import { Poppins, PT_Sans, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const fontPtSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const fontSourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-code-pro",
});

export const metadata: Metadata = {
  title: "AI Photo Ace",
  description: "Transform Your Photos with AI-Powered Precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontPoppins.variable,
          fontPtSans.variable,
          fontSourceCodePro.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
