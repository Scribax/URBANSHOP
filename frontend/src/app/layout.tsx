import type { Metadata } from "next";
import { Inter, Anton, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LATIN BROÚ | No es ropa. Es identidad.",
  description: "Marca de indumentaria urbana premium. Nacido en la calle, hecho para perdurar. Trap, Hip Hop, Graffiti, y Cultura Latinoamericana.",
  keywords: ["streetwear", "moda urbana", "trap", "ropa calle", "oversized", "latin brou", "limited drops"],
  openGraph: {
    title: "LATIN BROÚ | No es ropa. Es identidad.",
    description: "Marca de indumentaria urbana premium. Trap, Hip Hop, Graffiti, y Cultura Latinoamericana.",
    url: "https://latinbrou.com",
    siteName: "LATIN BROÚ",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LATIN BROÚ Streetwear",
      },
    ],
    locale: "es_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LATIN BROÚ | No es ropa. Es identidad.",
    description: "Marca de indumentaria urbana premium.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${anton.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-grain min-h-screen">
        <ShopProvider>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
