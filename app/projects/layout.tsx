import HideNav from "@/components/hideNav/HideNav"

export default function HompagesRootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <HideNav>
      {children}
    </HideNav>
  )
}
