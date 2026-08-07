import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GritFeat Automation Suite",
  description: "Automated birthday post, work anniversary video & ID card generation for GritFeat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bebas+Neue&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400..900&family=Cormorant+Garamond:wght@400;600;700&family=Dancing+Script:wght@400..700&family=Fira+Code:wght@400..700&family=Great+Vibes&family=Inter:wght@400..800&family=Lato:wght@400;700&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:wght@400;700&family=Montserrat:ital,wght@0,400..800;1,400..800&family=Open+Sans:ital,wght@0,400..800;1,400..800&family=Oswald:wght@400..700&family=Outfit:wght@400..800&family=Pacifico&family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&family=Poppins:ital,wght@0,400..800;1,400..800&family=Raleway:ital,wght@0,400..800;1,400..800&family=Roboto:ital,wght@0,400..800;1,400..800&family=Satisfy&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex bg-[#F8F9FD] text-slate-900 selection:bg-[#F47D30]/20 selection:text-[#F47D30]">
        <Sidebar />
        <div className="flex-1 ml-60 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
