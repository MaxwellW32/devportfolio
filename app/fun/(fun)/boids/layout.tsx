import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Boids",
  description: "Three local rules, no leader, and a flock appears. Turn one off and watch which part dies.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
