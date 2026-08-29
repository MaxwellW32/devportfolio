import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Game Of Life",
  description: "Tiles that read their eight neighbours and move. Nobody writes the rules — the world invents one every time it sees an arrangement it has not met before.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
