import type { Metadata } from "next";
import { Instrument_Sans, Inter } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./providers";
import { Toaster } from "sonner";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PhotaLabs - AI Image Editing Playground",
  description: "Create stunning images with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className={`${instrumentSans.variable} ${inter.variable}`}>
        <body className="min-h-screen bg-bg-primary antialiased">
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-bg-panel !text-text-primary !border-border",
              style: {
                background: "#16161A",
                color: "#FAFAF9",
                border: "1px solid #2A2A2E",
                borderRadius: "12px",
              },
            }}
          />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
