import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MangaVerse — Read Manga Online", template: "%s | MangaVerse" },
  description: "Explore thousands of manga, manhwa, and manhua from all over the world. Free online manga reader.",
  openGraph: {
    title: "MangaVerse — Read Manga Online",
    description: "Explore thousands of manga, manhwa, and manhua from all over the world.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
