import type { Metadata } from "next"

/* The toy itself is a client component, so its title lives here — otherwise
   every playground page shares the site's default and a browser history full
   of them is thirteen identical rows. */
export const metadata: Metadata = {
  title: "Music Timeline",
  description: "Drag clips around and it stays in time, because the playhead comes from the audio clock rather than a timer.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
