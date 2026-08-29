"use server"

/* ============================================================================
   The random search term that seeds the video feed.

   This used to call Wordnik from the browser with the API key written into the
   client bundle — visible to anyone who opened devtools. It now runs on the
   server and reads the key from the environment.

   WORDNIK_KEY is optional. Without it (or if Wordnik is down) the local list
   below is used instead, so the demo works with no configuration at all.
   ========================================================================= */

const fallbackWords = [
  "aurora", "basalt", "cadence", "driftwood", "ember", "fathom", "glacier",
  "harbour", "indigo", "junction", "kestrel", "lantern", "meridian", "nocturne",
  "obsidian", "prairie", "quartz", "ripple", "sonar", "thicket", "umbra",
  "vellum", "willow", "xenon", "yonder", "zephyr", "monsoon", "trellis",
  "compass", "granite", "lattice", "mosaic", "plumage", "quarry", "solstice",
]

function pickFallback() {
  return fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
}

export async function getRandomWord(): Promise<string> {
  const apiKey = process.env.WORDNIK_KEY

  if (!apiKey) return pickFallback()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const url = new URL("https://api.wordnik.com/v4/words.json/randomWords")
    url.searchParams.set("hasDictionaryDef", "true")
    url.searchParams.set("minCorpusCount", "0")
    url.searchParams.set("minLength", "5")
    url.searchParams.set("maxLength", "15")
    url.searchParams.set("limit", "1")
    url.searchParams.set("api_key", apiKey)

    const res = await fetch(url, { signal: controller.signal, cache: "no-store" })
    if (!res.ok) return pickFallback()

    const data: { word?: string }[] = await res.json()
    return data?.[0]?.word ?? pickFallback()
  } catch {
    // Any failure at all just falls back — a word is never worth an error state
    return pickFallback()
  } finally {
    clearTimeout(timeout)
  }
}
