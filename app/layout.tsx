import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvoRank",
  description: "Multi-Sport-Training mit getrennten Datenschutzfreigaben, geschützten Top-10-Bestenlisten, 500 Mobilitätsübungen, Backups und Garmin-Dauersynchronisierung.",
  icons: {
    icon: [
      {
        url: "/rankforge/icons/evorank-x4-192.png",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/rankforge/icons/evorank-x4-192.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/rankforge/icons/evorank-x4-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    shortcut: "/rankforge/icons/evorank-x4-192.png",
    apple: [
      {
        url: "/rankforge/icons/evorank-x4-180.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
