import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StageSpot — Get Your First Stage",
  description:
    "StageSpot connects first-time performers with local cafes and restaurants hosting open mic nights in the Delhi region.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
