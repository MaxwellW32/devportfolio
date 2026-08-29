/* ============================================================================
   SCREENSHOT CAPTURE

     npm run capture:install     # once — downloads a Chromium build
     npm run capture             # shoot every project with a live link
     npm run capture -- squaremax paramount-couriers    # or just these

   For every project in lib/projects.ts carrying a link with kind "live", this
   opens the page, waits for it to settle, and writes public/shots/<slug>.png.

   WHY SCREENSHOTS RATHER THAN LIVE EMBEDS
   A screenshot is a frozen record of the work as it shipped. Client sites get
   redesigned, domains lapse, and a dead iframe on a portfolio is worse than no
   iframe at all. The capture is the durable artefact; the link is a bonus.

   Existing files are skipped unless --force is passed, so a manual screenshot
   of something the crawler cannot reach is never clobbered.
   ========================================================================= */

import fs from "node:fs/promises"
import path from "node:path"
import { chromium, type Browser } from "playwright"

import { projects } from "../lib/projects"

const OUT_DIR = path.join(process.cwd(), "public", "shots")

const VIEWPORT = { width: 1440, height: 900 }
const NAV_TIMEOUT = 45_000
/** Give lazy images, fonts and entrance animations time to land. */
const SETTLE_MS = 3_500

type target = { slug: string; title: string; url: string }

function collectTargets(filter: string[]): target[] {
  const out: target[] = []

  for (const eachProject of projects) {
    const live = eachProject.links?.find(eachLink => eachLink.kind === "live")
    if (live === undefined) continue

    if (filter.length > 0 && !filter.includes(eachProject.slug)) continue

    out.push({ slug: eachProject.slug, title: eachProject.title, url: live.href })
  }

  return out
}

async function alreadyCaptured(slug: string) {
  for (const eachExtension of [".png", ".jpg", ".jpeg", ".webp", ".avif"]) {
    try {
      await fs.access(path.join(OUT_DIR, `${slug}${eachExtension}`))
      return true
    } catch {
      // Not there — keep looking
    }
  }
  return false
}

async function capture(browser: Browser, target: target) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    // Some hosts serve a stripped page to unknown agents
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  })

  const page = await context.newPage()

  try {
    const response = await page.goto(target.url, {
      waitUntil: "networkidle",
      timeout: NAV_TIMEOUT,
    })

    if (response !== null && response.status() >= 400) {
      throw new Error(`HTTP ${response.status()}`)
    }

    // Scroll the full height once so anything lazy-loaded actually loads,
    // then return to the top for the shot.
    await page.evaluate(async () => {
      await new Promise<void>(resolve => {
        let travelled = 0
        const step = 600
        const timer = setInterval(() => {
          window.scrollBy(0, step)
          travelled += step
          if (travelled >= document.body.scrollHeight) {
            clearInterval(timer)
            window.scrollTo(0, 0)
            resolve()
          }
        }, 90)
      })
    })

    await page.waitForTimeout(SETTLE_MS)

    // Hide the usual obstructions so the shot is of the site, not a banner
    await page.addStyleTag({
      content: `
        [class*="cookie" i], [id*="cookie" i],
        [class*="consent" i], [id*="consent" i],
        [class*="gdpr" i] { display: none !important; }
        * { scrollbar-width: none !important; }
        *::-webkit-scrollbar { display: none !important; }
      `,
    })

    await fs.mkdir(OUT_DIR, { recursive: true })

    await page.screenshot({
      path: path.join(OUT_DIR, `${target.slug}.png`),
      type: "png",
    })

    return true
  } finally {
    await context.close()
  }
}

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes("--force")
  const filter = args.filter(eachArg => !eachArg.startsWith("--"))

  const targets = collectTargets(filter)

  if (targets.length === 0) {
    console.log("Nothing to capture.")
    console.log('Projects need a link with kind: "live" in lib/projects.ts.')
    return
  }

  console.log(`Capturing ${targets.length} site${targets.length === 1 ? "" : "s"} at ${VIEWPORT.width}x${VIEWPORT.height} @2x\n`)

  const browser = await chromium.launch()

  let captured = 0
  let skipped = 0
  const failed: { slug: string; reason: string }[] = []

  for (const eachTarget of targets) {
    if (!force && (await alreadyCaptured(eachTarget.slug))) {
      console.log(`  skip   ${eachTarget.slug} — already has an image (--force to replace)`)
      skipped++
      continue
    }

    process.stdout.write(`  shoot  ${eachTarget.slug} … `)

    try {
      await capture(browser, eachTarget)
      console.log("ok")
      captured++
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      console.log(`FAILED — ${reason}`)
      failed.push({ slug: eachTarget.slug, reason })
    }
  }

  await browser.close()

  console.log(`\n${captured} captured · ${skipped} skipped · ${failed.length} failed`)

  if (failed.length > 0) {
    console.log("\nCould not reach:")
    for (const eachFailure of failed) {
      console.log(`  ${eachFailure.slug} — ${eachFailure.reason}`)
    }
    console.log("\nSave a screenshot manually as public/shots/<slug>.png for these.")
  }

  // A failed capture is not a failed build — the placeholder covers it
  console.log("\nProjects without an image fall back to a generated placeholder.")
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
