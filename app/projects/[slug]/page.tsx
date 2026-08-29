import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getCaseStudies, getProject, projects } from "@/lib/projects"
import { resolveShot } from "@/lib/shots"
import ProjectShot from "@/components/projects/ProjectShot"
import StatusTag from "@/components/projects/StatusTag"
import Reveal from "@/components/ui/Reveal"
import styles from "./caseStudy.module.css"

export function generateStaticParams() {
  return getCaseStudies().map(eachProject => ({ slug: eachProject.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)

  if (project === undefined) return { title: "Not found" }

  return {
    title: project.title,
    description: project.tagline,
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)

  if (project === undefined || !project.caseStudy) notFound()

  const shot = resolveShot(project)

  // Neighbours for the footer pager, within the case-study set only
  const studies = getCaseStudies()
  const index = studies.findIndex(eachStudy => eachStudy.slug === project.slug)
  const previous = studies[(index - 1 + studies.length) % studies.length]
  const next = studies[(index + 1) % studies.length]

  const related = projects.filter(
    eachProject => eachProject.domain === project.domain && eachProject.slug !== project.slug,
  )

  return (
    <main>
      {/* ---- Hero -------------------------------------------------------- */}
      <header className={styles.hero}>
        <div className="gridlines" aria-hidden="true" />

        <div className={`shell ${styles.heroInner}`}>
          <Link href="/projects" className={styles.back}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H6M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All work
          </Link>

          <div className={styles.heroMeta}>
            <p className="label labelPlain">{project.domain} · {project.year}</p>
            <StatusTag status={project.status} />
          </div>

          <h1 className={styles.title}>{project.title}</h1>

          <p className={styles.tagline}>{project.tagline}</p>

          <div className={styles.actions}>
            {project.links?.map(eachLink => (
              <a key={eachLink.href} href={eachLink.href} target="_blank" rel="noreferrer" className="btn">
                <span>{eachLink.label}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ---- Screenshot -------------------------------------------------- */}
      <div className="shellWide">
        <div className={styles.shot}>
          <ProjectShot
            slug={project.slug}
            title={project.title}
            src={shot}
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* ---- Metrics ----------------------------------------------------- */}
      {project.metrics && (
        <div className="shellWide">
          <ul className={styles.metrics}>
            {project.metrics.map(eachMetric => (
              <li key={eachMetric.label}>
                <span className="readout">{eachMetric.value}</span>
                <span>{eachMetric.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---- Body -------------------------------------------------------- */}
      <div className={`shell ${styles.body}`}>
        <Reveal as="section" className={styles.block}>
          <p className="label">Overview</p>
          <p className={styles.prose}>{project.summary}</p>
        </Reveal>

        {project.hardPart && (
          <Reveal as="section" className={styles.hardPart}>
            <p className="label labelSignal">The hard part</p>
            <h2>{project.hardPart.title}</h2>
            <p>{project.hardPart.body}</p>
          </Reveal>
        )}

        <Reveal as="section" className={styles.block}>
          <p className="label">What it does</p>
          <ul className={styles.bullets}>
            {project.highlights.map(eachHighlight => (
              <li key={eachHighlight}>{eachHighlight}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" className={styles.block}>
          <p className="label">What it proves</p>
          <ul className={styles.bullets} data-signal>
            {project.proves.map(eachProof => (
              <li key={eachProof}>{eachProof}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" className={styles.block}>
          <p className="label">Stack</p>
          <ul className={`chipRow ${styles.stack}`}>
            {project.stack.map(eachTech => (
              <li key={eachTech} className="chip chipSignal">{eachTech}</li>
            ))}
          </ul>
        </Reveal>

        {related.length > 0 && (
          <Reveal as="section" className={styles.block}>
            <p className="label">Related</p>
            <ul className={styles.related}>
              {related.map(eachRelated => (
                <li key={eachRelated.slug}>
                  <Link
                    href={eachRelated.caseStudy ? `/projects/${eachRelated.slug}` : `/projects#${eachRelated.slug}`}
                    className="link"
                  >
                    {eachRelated.title}
                  </Link>
                  <span>{eachRelated.tagline}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      {/* ---- Pager ------------------------------------------------------- */}
      <nav className={styles.pager} aria-label="More case studies">
        <div className={`shellWide ${styles.pagerInner}`}>
          <Link href={`/projects/${previous.slug}`} className={styles.pagerLink} data-direction="prev">
            <span className="label labelPlain">Previous</span>
            <span>{previous.title}</span>
          </Link>

          <Link href={`/projects/${next.slug}`} className={styles.pagerLink} data-direction="next">
            <span className="label labelPlain">Next</span>
            <span>{next.title}</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
