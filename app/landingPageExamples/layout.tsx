"use client"
import HideNav from "@/components/hideNav/HideNav"
import { landingPageExamples } from "@/lib/landingPageExamplesData"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HompagesRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const checkCurrentIndex = () => {
    const seenLink = document.URL.split("landingPageExamples/")[1]
    let seenIndex = landingPageExamples.findIndex(eachPage => {
      const currentLink = eachPage.link.split("landingPageExamples/")[1]

      if (seenLink === currentLink) {
        return true
      }
    })

    return seenIndex
  }

  const next = () => {
    let newIndex = checkCurrentIndex() + 1

    if (newIndex > landingPageExamples.length - 1) {
      newIndex = 0
    }

    pushToNewPage(newIndex)
  }

  const prev = () => {
    let newIndex = checkCurrentIndex() - 1

    if (newIndex < 0) {
      newIndex = landingPageExamples.length - 1
    }

    pushToNewPage(newIndex)
  }

  const pushToNewPage = (index: number) => {
    router.push(landingPageExamples[index].link)
  }

  return (
    <HideNav>
      {children}

      <div style={{ position: "fixed", bottom: "1rem", width: "100%", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", zIndex: 998 }}>
        <p style={{ cursor: "pointer" }} onClick={prev}>prev</p>
        <p style={{ cursor: "pointer" }} onClick={next}>next</p>
      </div>
    </HideNav>
  )
}
