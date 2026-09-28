import type { Metadata } from "next"

import ContactForm from "@/components/contactForm/ContactForm"
import { profile } from "@/lib/profile"
import styles from "./contact.module.css"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about a role, a project or a problem you're stuck on.",
}

const channels = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "GitHub", value: "MaxwellW32", href: profile.github },
  { label: "LinkedIn", value: "maxwell-wedderburn", href: profile.linkedin },
  { label: "Based in", value: profile.location, href: null },
]

export default function Page() {
  return (
    <main>
      <section className={`shellWide ${styles.hero}`}>
        <div className="gridlines" aria-hidden="true" />

        <div className={styles.heroInner}>
          <p className="label labelSignal">Open to work</p>
          <h1 className={styles.title}>Let&apos;s talk.</h1>
          <p className={styles.lede}>
            If you have a full-time role, contract work or a problem you&apos;re
            stuck on, send me the details and I&apos;ll get back to you quickly.
            You can also email me directly if you&apos;d rather skip the form.
          </p>
        </div>
      </section>

      <section className={`shellWide ${styles.body}`}>
        <div className={styles.formPanel}>
          <h2 className={styles.panelTitle}>Send a message</h2>
          <ContactForm />
        </div>

        <aside className={styles.side}>
          <div className={styles.channels}>
            <p className="label labelPlain">Direct</p>

            <dl>
              {channels.map(eachChannel => (
                <div key={eachChannel.label}>
                  <dt>{eachChannel.label}</dt>
                  <dd>
                    {eachChannel.href === null ? (
                      eachChannel.value
                    ) : (
                      <a
                        href={eachChannel.href}
                        className="link"
                        target={eachChannel.href.startsWith("http") ? "_blank" : undefined}
                        rel={eachChannel.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {eachChannel.value}
                      </a>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.note}>
            <p className="label labelPlain labelSignal">What helps</p>
            <p>
              Tell me what you&apos;re building, what&apos;s going wrong and
              when you need it by. That&apos;s usually enough for me to know
              whether I can help. If I&apos;m not the right person, I&apos;ll
              tell you.
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}
