import "server-only"

import fs from "node:fs"
import path from "node:path"
import type { project } from "./projects"

/* ============================================================================
   HOW IMAGES WORK ON THIS SITE
   ---------------------------------------------------------------------------
   Drop a file at  public/shots/<slug>.<png|jpg|jpeg|webp|avif>  and it appears.
   Nothing else to wire up — no import, no config, no data edit.

   `npm run capture` fills this folder automatically for any project that has a
   live link. For private or archived work, save a screenshot yourself using
   the project's slug as the filename.

   If no file exists, a deterministic generated placeholder renders instead, so
   a project without a screenshot still looks intentional rather than broken.
   ========================================================================= */

const SHOT_DIR = path.join(process.cwd(), "public", "shots")
const EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".avif"]

/** Resolves the public URL of a project's screenshot, or null if there is none. */
export function resolveShot(project: project): string | null {
  // An explicit `shot` on the project always wins
  if (project.shot) return project.shot

  for (const eachExtension of EXTENSIONS) {
    const candidate = path.join(SHOT_DIR, `${project.slug}${eachExtension}`)

    try {
      if (fs.existsSync(candidate)) return `/shots/${project.slug}${eachExtension}`
    } catch {
      // Reading the filesystem is best-effort; fall through to the placeholder
    }
  }

  return null
}

/** Slug → screenshot URL (or null), for passing into client components. */
export function resolveShots(list: project[]): Record<string, string | null> {
  const map: Record<string, string | null> = {}

  for (const eachProject of list) {
    map[eachProject.slug] = resolveShot(eachProject)
  }

  return map
}
