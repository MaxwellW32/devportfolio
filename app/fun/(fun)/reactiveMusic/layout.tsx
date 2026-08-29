import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Reactive Music",
  description: "A spectrum you can watch, and beat detection that works on a quiet track and a loud one alike.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
