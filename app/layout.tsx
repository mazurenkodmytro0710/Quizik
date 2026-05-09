import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quzik – Study App",
  description: "Practise exam questions with Test Mode and Learn Mode",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className="h-full">
      <body className="min-h-full bg-[#0f0d1a]">{children}</body>
    </html>
  );
}
