"use server"

/* ============================================================================
   dictionaryapi.dev stopped sending an Access-Control-Allow-Origin header, so
   fetching it straight from the browser is blocked by CORS and fails silently.
   Going through a server action fixes it — the server is not bound by CORS —
   and it keeps the shape of the response under our control.
   ========================================================================= */

export type definitionEntry = {
  word: string
  phonetic?: string
  meanings: {
    partOfSpeech?: string
    definitions: { definition: string; example?: string }[]
  }[]
}

export type definitionResult =
  | { ok: true; entries: definitionEntry[] }
  | { ok: false; error: string }

export async function getDefinition(word: string): Promise<definitionResult> {
  const cleaned = word.trim().toLowerCase()

  if (cleaned === "") return { ok: false, error: "Type a word first" }
  if (!/^[a-z'-]{1,45}$/.test(cleaned)) {
    return { ok: false, error: "Letters, hyphens and apostrophes only" }
  }

  // dictionaryapi.dev is a free community service and its latency is wildly
  // uneven — measured here at 2ms cached versus 19.8s cold. Without a bound
  // the button sits on "…" indefinitely, which reads as a broken page.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleaned)}`,
      // A day's cache means a repeat lookup is instant even when the upstream is not
      { next: { revalidate: 86400 }, signal: controller.signal },
    )

    if (res.status === 404) {
      return { ok: false, error: `No entry for "${cleaned}"` }
    }

    if (!res.ok) {
      return { ok: false, error: `Dictionary is unavailable (${res.status})` }
    }

    const data: definitionEntry[] = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return { ok: false, error: `No entry for "${cleaned}"` }
    }

    return { ok: true, entries: data }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: "The dictionary is being slow — try again" }
    }

    console.error("Dictionary lookup failed:", error instanceof Error ? error.message : error)
    return { ok: false, error: "Could not reach the dictionary" }
  } finally {
    clearTimeout(timeout)
  }
}
