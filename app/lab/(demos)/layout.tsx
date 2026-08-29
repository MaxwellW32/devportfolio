import ImmersiveMode from "@/components/chrome/ImmersiveMode"

export default function HompagesRootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <ImmersiveMode>
      {children}
    </ImmersiveMode>
  )
}
