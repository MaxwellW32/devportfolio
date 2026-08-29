import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Luck Ranked",
  description: "The winner is drawn after you click, so there is nothing to read and no way to be good at it. It ranks your luck instead.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
