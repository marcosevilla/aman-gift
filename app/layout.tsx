import type { Metadata } from "next";
import { Lora, Caveat, Newsreader } from "next/font/google";
import { Agentation } from "agentation";
import { DevToolsToggle } from "@/components/DevToolsToggle";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "For Aman",
  description: "A farewell gift from your friends at Canary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lora.variable} ${caveat.variable} ${newsreader.variable} antialiased`}
      >
        {children}
        <DevToolsToggle>
          <Agentation />
        </DevToolsToggle>
      </body>
    </html>
  );
}
