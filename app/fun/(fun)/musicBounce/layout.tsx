import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Music Bounce",
  description: "Pick a slice of the spectrum, say what the cube should do when it gets loud, and let the track draw the path.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
