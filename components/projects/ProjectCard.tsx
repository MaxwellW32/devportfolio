import Link from "next/link"
import type { project } from "@/lib/projects"
import ProjectShot from "./ProjectShot"
import StatusTag from "./StatusTag"
import styles from "./projectCard.module.css"

/**
 * Summary block used on the home page and anywhere a project needs a card.
 * Links through to the case study when there is one, otherwise to the entry
 * on the index page.
 */
export default function ProjectCard({ project, shot }: { project: project, shot: string | null }) {
  const href = project.caseStudy ? `/projects/${project.slug}` : `/projects#${project.slug}`

  return (
    <article className={`card ${styles.card}`}>
      <Link href={href} className={styles.hit} aria-label={`${project.title} — ${project.tagline}`}>
        <span />
      </Link>

      <div className={styles.shot}>
        <ProjectShot slug={project.slug} title={project.title} src={shot} />
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <p className="label labelPlain">{project.domain}</p>
          <StatusTag status={project.status} />
        </div>

        <h3 className={styles.title}>{project.title}</h3>

        <p className={styles.tagline}>{project.tagline}</p>

        <ul className={`chipRow ${styles.stack}`}>
          {project.stack.slice(0, 5).map(eachTech => (
            <li key={eachTech} className="chip">{eachTech}</li>
          ))}
          {project.stack.length > 5 && (
            <li className="chip">+{project.stack.length - 5}</li>
          )}
        </ul>

        <p className={styles.cue}>
          {project.caseStudy ? "Read the case study" : "See details"}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </p>
      </div>
    </article>
  )
}
