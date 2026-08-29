"use client"

import Link from "next/link"
import { useCallback, useMemo, useRef, useState } from "react"

import type { project, projectTier } from "@/lib/projects"
import { tierLabels, tierOrder } from "@/lib/projects"
import ProjectShot from "./ProjectShot"
import StatusTag from "./StatusTag"
import styles from "./projectExplorer.module.css"

type explorerProps = {
  projects: project[]
  shots: Record<string, string | null>
  counts: { total: number; live: number; caseStudies: number }
}

export default function ProjectExplorer({ projects, shots, counts }: explorerProps) {
  const [activeSlug, activeSlugSet] = useState(projects[0]?.slug ?? "")
  const [domainFilter, domainFilterSet] = useState<string>("All")
  const listRef = useRef<HTMLDivElement | null>(null)

  const domains = useMemo(() => {
    const set = new Set(projects.map(eachProject => eachProject.domain))
    return ["All", ...[...set].sort()]
  }, [projects])

  const visible = useMemo(() => {
    if (domainFilter === "All") return projects
    return projects.filter(eachProject => eachProject.domain === domainFilter)
  }, [projects, domainFilter])

  // Grouped for the rail, preserving the tier order from the data module
  const grouped = useMemo(() => {
    return tierOrder
      .map(eachTier => ({
        tier: eachTier,
        items: visible.filter(eachProject => eachProject.tier === eachTier),
      }))
      .filter(eachGroup => eachGroup.items.length > 0)
  }, [visible])

  // Filtering away the selected project falls back to the first visible one.
  // Derived rather than synced through an effect, so there is no cascading
  // render and no frame where the panel is blank.
  const active = visible.find(eachProject => eachProject.slug === activeSlug) ?? visible[0]

  const move = useCallback(
    (direction: 1 | -1) => {
      const index = visible.findIndex(eachProject => eachProject.slug === active?.slug)
      if (index === -1) return

      const next = visible[(index + direction + visible.length) % visible.length]
      activeSlugSet(next.slug)

      // Keep the newly selected row in view inside the rail
      const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-slug="${next.slug}"]`)
      button?.scrollIntoView({ block: "nearest" })
      button?.focus()
    },
    [visible, active],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault()
      move(1)
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault()
      move(-1)
    }
  }

  if (active === undefined) return null

  return (
    <>
      {/* ---- Page header ------------------------------------------------ */}
      <header className={`shellWide ${styles.header}`}>
        <div>
          <p className="label labelSignal">The work</p>
          <h1 className={styles.title}>
            {counts.total} projects. {counts.caseStudies} worth a deep dive.
          </h1>
          <p className={styles.lede}>
            Pick anything from the index. Each entry carries its stack, what it
            proves, and — where there was one — the genuinely hard problem
            underneath it.
          </p>
        </div>

        <dl className={styles.counts}>
          <div>
            <dt className="label labelPlain">Total</dt>
            <dd className="readout">{counts.total}</dd>
          </div>
          <div>
            <dt className="label labelPlain">Live</dt>
            <dd className="readout">{counts.live}</dd>
          </div>
          <div>
            <dt className="label labelPlain">Case studies</dt>
            <dd className="readout">{counts.caseStudies}</dd>
          </div>
        </dl>
      </header>

      {/* ---- Domain filters --------------------------------------------- */}
      <div className={`shellWide ${styles.filters}`}>
        <span className="label labelPlain">Filter</span>

        <div className={`noScrollBar ${styles.filterRow}`}>
          {domains.map(eachDomain => (
            <button
              key={eachDomain}
              type="button"
              className={styles.filter}
              data-active={domainFilter === eachDomain}
              onClick={() => domainFilterSet(eachDomain)}
            >
              {eachDomain}
              {eachDomain !== "All" && (
                <span>{projects.filter(p => p.domain === eachDomain).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Rail + detail ---------------------------------------------- */}
      <div className={`shellWide ${styles.explorer}`}>
        <div
          className={styles.rail}
          ref={listRef}
          role="listbox"
          aria-label="Projects"
          aria-activedescendant={`rail-${active.slug}`}
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          {grouped.map(eachGroup => (
            <section key={eachGroup.tier} className={styles.railGroup}>
              <h2 className="label labelPlain">{tierLabels[eachGroup.tier as projectTier]}</h2>

              <ul>
                {eachGroup.items.map(eachProject => (
                  <li key={eachProject.slug}>
                    <button
                      type="button"
                      id={`rail-${eachProject.slug}`}
                      data-slug={eachProject.slug}
                      role="option"
                      aria-selected={eachProject.slug === active.slug}
                      className={styles.railItem}
                      data-active={eachProject.slug === active.slug}
                      onClick={() => activeSlugSet(eachProject.slug)}
                      onMouseEnter={() => activeSlugSet(eachProject.slug)}
                    >
                      <span className={styles.railName}>{eachProject.title}</span>
                      <span className={styles.railYear}>{eachProject.year}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className={styles.railHint}>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            to move
          </p>
        </div>

        {/* ---- Detail panel --------------------------------------------- */}
        <article className={styles.detail} key={active.slug} id={active.slug}>
          <div className={styles.detailShot}>
            <ProjectShot
              slug={active.slug}
              title={active.title}
              src={shots[active.slug] ?? null}
              sizes="(max-width: 1000px) 100vw, 60vw"
              priority
            />
          </div>

          <div className={styles.detailBody}>
            <div className={styles.detailHead}>
              <div>
                <p className="label labelPlain">{active.domain} · {active.year}</p>
                <h2 className={styles.detailTitle}>{active.title}</h2>
              </div>
              <StatusTag status={active.status} />
            </div>

            <p className={styles.detailTagline}>{active.tagline}</p>

            <p className={styles.detailSummary}>{active.summary}</p>

            {active.metrics && (
              <ul className={styles.metrics}>
                {active.metrics.map(eachMetric => (
                  <li key={eachMetric.label}>
                    <span className="readout">{eachMetric.value}</span>
                    <span>{eachMetric.label}</span>
                  </li>
                ))}
              </ul>
            )}

            {active.hardPart && (
              <section className={styles.hardPart}>
                <p className="label labelSignal">The hard part</p>
                <h3>{active.hardPart.title}</h3>
                <p>{active.hardPart.body}</p>
              </section>
            )}

            <div className={styles.columns}>
              <section>
                <p className="label labelPlain">What it does</p>
                <ul className={styles.bullets}>
                  {active.highlights.map(eachHighlight => (
                    <li key={eachHighlight}>{eachHighlight}</li>
                  ))}
                </ul>
              </section>

              <section>
                <p className="label labelPlain">What it proves</p>
                <ul className={styles.bullets} data-signal>
                  {active.proves.map(eachProof => (
                    <li key={eachProof}>{eachProof}</li>
                  ))}
                </ul>
              </section>
            </div>

            <section>
              <p className="label labelPlain">Stack</p>
              <ul className={`chipRow ${styles.stack}`}>
                {active.stack.map(eachTech => (
                  <li key={eachTech} className="chip">{eachTech}</li>
                ))}
              </ul>
            </section>

            <div className={styles.detailActions}>
              {active.caseStudy && (
                <Link href={`/projects/${active.slug}`} className="btn btnPrimary">
                  <span>Read the case study</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}

              {active.links?.map(eachLink => (
                <a
                  key={eachLink.href}
                  href={eachLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                >
                  <span>{eachLink.label}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </article>
      </div>
    </>
  )
}
