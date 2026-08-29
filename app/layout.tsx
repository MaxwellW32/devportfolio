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
    default: "Maxwell Wedderburn — Full-stack engineer",
    template: "%s — Maxwell Wedderburn",
  },
  description:
    "Full-stack engineer building trading systems, AI-driven products and multi-tenant platforms. I build the instrument before I trust the reading.",
  openGraph: {
    title: "Maxwell Wedderburn — Full-stack engineer",
    description:
      "Trading systems, AI-driven products and multi-tenant platforms, built with measurement discipline.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0c0e",
  colorScheme: "dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
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
