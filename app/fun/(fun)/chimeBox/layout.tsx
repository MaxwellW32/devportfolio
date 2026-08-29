import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Chime Box",
  description: "The walls are the instrument. Turn quantise off to hear exactly what quantising does.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
