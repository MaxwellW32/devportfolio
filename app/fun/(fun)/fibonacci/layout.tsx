import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Fibonacci",
  description: "The ratio of consecutive terms converges on the golden ratio. Here is the number and the picture.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
