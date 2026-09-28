import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"

import "./globals.css"
import Navbar from "@/components/chrome/Navbar"
import Footer from "@/components/chrome/Footer"
import Player from "@/components/player/Player"
import AtomLoader from "@/utility/AtomLoader"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://maxwellwedderburn.com"),
  title: {
    default: "Maxwell Wedderburn — Full-stack developer",
    template: "%s — Maxwell Wedderburn",
  },
  description:
    "Full-stack developer in Kingston, Jamaica. I've been solving problems with code since I was six. I build web apps with Next.js, PostgreSQL, Drizzle, Zod and Three.js.",
  openGraph: {
    title: "Maxwell Wedderburn — Full-stack developer",
    description:
      "A website builder, AI story games, trading bots and sites for real businesses, built with Next.js, PostgreSQL and Zod.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0c0e",
  colorScheme: "dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // globals.css sets scroll-behavior: smooth, and data-scroll-behavior tells
    // Next to keep route transitions instant rather than animating the jump.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="grain">
        <AtomLoader />

        <a href="#main" className="srOnly">Skip to content</a>

        <Navbar />

        <div id="main">{children}</div>

        <Footer />

        {/* He is not a feature of /fun any more — he walks the whole site */}
        <Player />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(21% 0.011 240)",
              color: "oklch(96% 0.006 90)",
              border: "1px solid oklch(32% 0.012 240)",
              borderRadius: "3px",
              fontSize: "0.9rem",
            },
          }}
        />
      </body>
    </html>
  )
}
