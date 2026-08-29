import ImmersiveMode from "@/components/chrome/ImmersiveMode"

export default function FunProjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Each playground page carries its own "← Playground" link, so the floating
  // toggle would only be one more thing overlapping the controls.
  return <ImmersiveMode showToggle={false}>{children}</ImmersiveMode>
}
