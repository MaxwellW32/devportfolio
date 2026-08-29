"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, useSyncExternalStore } from "react"
import styles from "./navbar.module.css"

const SCROLL_THRESHOLD = 24

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  return () => window.removeEventListener("scroll", onChange)
}

function isScrolled() {
  return window.scrollY > SCROLL_THRESHOLD
}

const navLinks = [
  { label: "Work", href: "/projects" },
  { label: "Lab", href: "/lab" },
  { label: "Playground", href: "/fun" },
  { label: "About", href: "/aboutMe" },
  { label: "Contact", href: "/contactUs" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, menuOpenSet] = useState(false)

  // Scroll position is browser state, not React state — subscribing to it
  // directly avoids a setState-inside-an-effect and the cascading render it
  // would cause on a page that loads already scrolled.
  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, () => false)

  // Navigating dismisses the sheet. Handled on the click that causes the
  // navigation rather than by reacting to the pathname, so there is no
  // setState inside an effect and no extra render on every route change.

  // An open sheet takes over the screen, so stop the page behind it scrolling
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header data-site-chrome className={styles.header} data-scrolled={scrolled} data-open={menuOpen}>
      <nav className={`shellWide ${styles.bar}`} aria-label="Primary">
        <Link href="/" className={styles.brand} aria-label="Maxwell Wedderburn — home">
          <span className={styles.mark} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Maxwell Wedderburn</span>
            <span className={styles.brandRole}>Full-stack engineer</span>
          </span>
        </Link>

        <ul className={styles.links}>
          {navLinks.map(eachLink => (
            <li key={eachLink.href}>
              <Link
                href={eachLink.href}
                className={styles.link}
                data-active={isActive(eachLink.href)}
              >
                {eachLink.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.tail}>
          <a href="/resume.pdf" download className={`btn btnSm ${styles.resume}`}>
            <span>Résumé</span>
          </a>

          <button
            type="button"
            className={styles.toggle}
            onClick={() => menuOpenSet(prev => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div id="mobile-nav" className={styles.sheet} hidden={!menuOpen}>
        <ul>
          {navLinks.map((eachLink, eachLinkIndex) => (
            <li key={eachLink.href} style={{ "--i": eachLinkIndex } as React.CSSProperties}>
              <Link
                href={eachLink.href}
                data-active={isActive(eachLink.href)}
                onClick={() => menuOpenSet(false)}
              >
                <span className="readout">0{eachLinkIndex + 1}</span>
                {eachLink.label}
              </Link>
            </li>
          ))}
        </ul>

        <a href="/resume.pdf" download className="btn btnPrimary" onClick={() => menuOpenSet(false)}>
          <span>Download résumé</span>
        </a>
      </div>
    </header>
  )
}
