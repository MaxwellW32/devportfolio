import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Seed World",
  description: "A world you can walk forever, stored nowhere. Every tile is a pure function of the seed.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
