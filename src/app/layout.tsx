import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import CornerControls from "@/components/CornerControls";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Alexander Lin",
  description: "Software, systems, and projects by Alexander Lin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrains.variable}>
      <body className="bg-black text-cyan-200">{children}<CornerControls /></body>
    </html>
  );
}
