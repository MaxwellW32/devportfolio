import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Chess",
  description: "Legal move generation verified against published perft counts — plus the mode where both sides move at random and a lone king beats a full roster.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
