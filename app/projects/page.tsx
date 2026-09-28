import type { Metadata } from "next"
import ProjectExplorer from "@/components/projects/ProjectExplorer"
import { projects } from "@/lib/projects"
import { resolveShots } from "@/lib/shots"

export const metadata: Metadata = {
  title: "Work",
  description:
    "Trading bots, AI apps, a website builder and client sites. Each one shows what it does and the hardest problem I solved while building it.",
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
