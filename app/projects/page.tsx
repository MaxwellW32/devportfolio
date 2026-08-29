import type { Metadata } from "next"
import ProjectExplorer from "@/components/projects/ProjectExplorer"
import { projects } from "@/lib/projects"
import { resolveShots } from "@/lib/shots"

export const metadata: Metadata = {
  title: "Work",
  description:
    "Trading systems, AI products, multi-tenant platforms and client work — with the hard part of each one written down.",
}

export default function Page() {
  const liveCount = projects.filter(eachProject => eachProject.status === "live").length
  const caseStudyCount = projects.filter(eachProject => eachProject.caseStudy).length

  return (
    <main>
      <ProjectExplorer
        projects={projects}
        shots={resolveShots(projects)}
        counts={{ total: projects.length, live: liveCount, caseStudies: caseStudyCount }}
      />
    </main>
  )
}
