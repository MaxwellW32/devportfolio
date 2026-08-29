import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Ricochet Arena",
  description: "Shells reflect properly off walls, and the enemies aim where you are going rather than where you are.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
