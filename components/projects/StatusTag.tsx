import type { projectStatus } from "@/lib/projects"

const statusText: Record<projectStatus, string> = {
  live: "Live",
  private: "Private",
  archived: "Archived",
  building: "Building",
}

const statusClass: Record<projectStatus, string> = {
  live: "statusLive",
  private: "statusPrivate",
  archived: "statusArchived",
  building: "statusPrivate",
}

/**
 * Honest labelling. "Private" means the code runs but is not public — a
 * trading system or a client's internal tool. It is not a euphemism for
 * unfinished; "Building" is.
 */
export default function StatusTag({ status }: { status: projectStatus }) {
  return (
    <span className={`status ${statusClass[status]}`}>
      {statusText[status]}
    </span>
  )
}
