import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Shell Game",
  description: "The other half of that idea: the ball goes under a cup before the shuffle, so following it is possible — and the scoreboard says whether you did.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
