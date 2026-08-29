import Link from "next/link"

import SpriteToggle from "@/components/player/SpriteToggle"
import styles from "./footer.module.css"

const socials = [
  { label: "GitHub", href: "https://github.com/MaxwellW32" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/maxwell-wedderburn/" },
  { label: "Email", href: "mailto:maxwellwedderburn32@gmail.com" },
]

const sitemap = [
  { label: "Work", href: "/projects" },
  { label: "Lab", href: "/lab" },
  { label: "Playground", href: "/fun" },
  { label: "About", href: "/aboutMe" },
  { label: "Writing", href: "/blog" },
  { label: "Contact", href: "/contactUs" },
]

export default function Footer() {
  return (
    <footer data-site-chrome className={styles.footer}>
      <div className="shellWide">
        <div className={styles.top}>
          <div className={styles.pitch}>
            <p className="label labelSignal">Open to work</p>

            <p className={styles.headline}>
              Got something hard?
              <br />
              That is the interesting part.
            </p>

            <div className={styles.actions}>
              <Link href="/contactUs" className="btn btnPrimary">
                <span>Start a conversation</span>
              </Link>

              <a href="/resume.pdf" download className="btn">
                <span>Résumé</span>
              </a>
            </div>
          </div>

          <nav className={styles.cols} aria-label="Footer">
            <div>
              <p className="label labelPlain">Site</p>
              <ul>
                {sitemap.map(eachItem => (
                  <li key={eachItem.href}>
                    <Link href={eachItem.href} className="link">{eachItem.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label labelPlain">Elsewhere</p>
              <ul>
                {socials.map(eachSocial => (
                  <li key={eachSocial.href}>
                    <a
                      href={eachSocial.href}
                      className="link"
                      target={eachSocial.href.startsWith("http") ? "_blank" : undefined}
                      rel={eachSocial.href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {eachSocial.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <hr className="rule" />

        <div className={styles.bottom}>
          <p className="readout">
            © {new Date().getFullYear()} Maxwell Wedderburn
          </p>

          <SpriteToggle variant="link" className={styles.sprite} />

          <p className="readout">
            Built with Next.js 16 · React 19 · No template
          </p>
        </div>
      </div>
    </footer>
  )
}
