import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Step Sequencer",
  description: "A drum machine with no samples in it. Every sound is built from oscillators and noise, and the whole pattern fits in a link.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
