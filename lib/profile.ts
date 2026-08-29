/* ============================================================================
   PROFILE — the "about me" content in one editable place.
   Everything here renders on the home and about pages. Plain data, no JSX.
   ========================================================================= */

export const profile = {
  name: "Maxwell Wedderburn",
  role: "Full-stack engineer",
  location: "Kingston, Jamaica",
  email: "maxwellwedderburn32@gmail.com",
  github: "https://github.com/MaxwellW32",
  linkedin: "https://www.linkedin.com/in/maxwell-wedderburn/",
  /** Shown as the hero pitch on the about page. */
  bio: [
    "I started building because I wanted to automate my own drudgery. As a NOC engineer I replaced a paper-based tracking system with a real-time platform, and wrote VBA automations to compile information nobody wanted to compile by hand. That instinct never left.",
    "Since then I have built production sites for clients, a multi-tenant website platform, AI narrative engines, and — most recently — trading systems where being wrong costs money. That last one changed how I work. When a bug shows up as a number in a ledger rather than a red test, you learn very quickly to build the measuring device before you trust the measurement.",
    "I have been building AI into products since getting structured JSON back from a model reliably was still a real problem. I now build with Claude daily. I learn fast, I read the source when the docs are thin, and I would rather kill my own idea on evidence than defend it on pride.",
  ],
}

/* ---- Hero strip --------------------------------------------------------- */
export const capabilities: { value: string; label: string }[] = [
  { value: "5+", label: "Years building for the web" },
  { value: "20+", label: "Projects shipped" },
  { value: "8", label: "Sites live in production" },
  { value: "200k+", label: "Lines of TypeScript in current work" },
]

/* ---- How I work --------------------------------------------------------- */
export const principles: { title: string; body: string }[] = [
  {
    title: "Measure before you believe",
    body:
      "My trading work journals the state of the world at the moment of every decision, so a result can be audited later instead of assumed. Every number carries a label saying whether it was measured live, measured in simulation, derived or modelled — because pooling those four is how you fool yourself.",
  },
  {
    title: "Write the decision down",
    body:
      "Every project I run keeps a notes directory of one-fact files: what was tried, what the evidence said, and what was decided. It means the next session cannot quietly relitigate a settled question from memory, and it means someone else could pick the work up.",
  },
  {
    title: "Kill your own ideas",
    body:
      "I have deleted more trading strategies than I have kept, each with a written verdict explaining the evidence that retired it. One looked strong across 441 samples and vanished at 1,423 — it was noise from counting the wrong unit. Finding that out is the job.",
  },
  {
    title: "Design for the real user",
    body:
      "A merchant on a prepaid phone with patchy signal is not an edge case in Jamaica, it is the median. So the marketplace is local-first with a durable outbox, and the bus tracker polls rather than holding a socket open. The right architecture depends on whose hands it lands in.",
  },
  {
    title: "Learn in public, fast",
    body:
      "I was using Zod to coerce structured JSON out of OpenAI before it was a documented pattern, and moved to building whole systems with Claude as soon as that was better. New tools do not intimidate me; I read the source and find out.",
  },
  {
    title: "Own it in production",
    body:
      "Most of what I have built runs on Linux VPS boxes I configured, behind nginx, under PM2, with the backups and the deploy scripts written. Shipping is not the same as running, and I do both.",
  },
]

/* ---- Track record ------------------------------------------------------- */
export const achievements: { year: string; title: string; body: string; stack: string[] }[] = [
  {
    year: "2026",
    title: "Autonomous trading systems with honest accounting",
    body:
      "Built market-making and prediction engines for Polymarket that reconcile against the exchange, contain their own failures with circuit breakers, and refuse to go live until the books balance. The reward estimator went from capturing 14–21% of what was actually paid to 93% after an accounting rewrite. Several strategies were retired on the evidence, each with a written verdict.",
    stack: ["TypeScript", "Next.js 16", "ethers", "viem", "WebSockets", "PM2"],
  },
  {
    year: "2026",
    title: "Offline-first systems for unreliable networks",
    body:
      "A vendor marketplace and a live bus tracker, both built on the assumption that the device loses signal. Durable IndexedDB outboxes, idempotent sync keyed on client-generated ids, a pure conflict reducer that respects when the user actually acted, and route corridors derived from GPS traces with PostGIS.",
    stack: ["Next.js 16", "PostGIS", "IndexedDB", "Redis", "Drizzle", "MapLibre"],
  },
  {
    year: "2025—2026",
    title: "Multi-tenant website platform",
    body:
      "A hosted builder where each placed component instance owns its own data, so a business can swap a section's design without losing its content. 28 component categories in a typed discriminated union, per-instance style overrides with properly scoped CSS, custom-domain rendering, and billable add-ons for booking, notifications and inventory.",
    stack: ["Next.js 16", "React 19", "Drizzle", "PostgreSQL", "Tailwind 4", "Zod 4"],
  },
  {
    year: "2025",
    title: "Dynamic story-to-video system",
    body:
      "Architected a platform that generates characters, locations and scenes from a chosen theme, keeping the AI consistent about characters by feeding it the relevant details — sometimes as images. Integrated ElevenLabs for voice synthesis and scripted Adobe After Effects to compile dialogue, assets and audio into fully rendered videos.",
    stack: ["Next.js", "TypeScript", "OpenAI", "ElevenLabs", "After Effects scripting"],
  },
  {
    year: "2025",
    title: "YouTube automation platform",
    body:
      "A full-stack app that scraped trending topics, generated video scripts through GPT, and automatically produced ready-to-publish videos. One of the first places I leaned on schema validation to make model output safe to act on.",
    stack: ["Next.js", "TypeScript", "Zod", "PostgreSQL", "GPT"],
  },
  {
    year: "2025",
    title: "Interactive AI narrative engine",
    body:
      "A GPT-powered story platform with persistent world-building, branching dialogue and real-time character interaction. The narrator emits a typed mutation array the server validates before applying, which turns open-ended storytelling into state a database can hold.",
    stack: ["Next.js", "OpenAI", "Zod", "Drizzle", "PostgreSQL"],
  },
  {
    year: "2023",
    title: "Real-time comms platform inside a live NOC",
    body:
      "As a NOC engineer, designed and deployed a WebSocket-based platform connecting internal departments directly to clients, replacing a paper-based tracking system that the business already depended on. Also wrote VBA automations that compiled reporting information out of email.",
    stack: ["Node.js", "WebSockets", "VBA"],
  },
  {
    year: "2023—2026",
    title: "Production sites, deployed and maintained",
    body:
      "Designed and deployed secure, high-performance sites for couriers, property services, care providers and dental practices — backend logic, authentication flows and frontend performance, running on custom Linux VPS systems I set up and keep running.",
    stack: ["Next.js", "PostgreSQL", "nginx", "Linux VPS", "Stripe"],
  },
]

/* ---- Skills ------------------------------------------------------------- */
export const skillGroups: { title: string; items: string[] }[] = [
  {
    title: "Languages",
    items: ["TypeScript", "JavaScript", "SQL", "HTML", "CSS", "VBA"],
  },
  {
    title: "Frontend",
    items: ["React 19", "Next.js 16", "Tailwind 4", "CSS Modules", "Canvas", "Three.js", "PWA", "React Native"],
  },
  {
    title: "Backend & data",
    items: ["Node.js", "PostgreSQL", "PostGIS", "Drizzle", "Redis", "Zod", "next-auth", "WebSockets", "SSE"],
  },
  {
    title: "AI",
    items: ["Anthropic API", "OpenAI API", "Structured output", "Multi-agent pipelines", "ElevenLabs", "Prompt design"],
  },
  {
    title: "Infrastructure",
    items: ["Linux VPS", "nginx", "PM2", "Docker", "Vercel", "GitHub Actions", "Playwright"],
  },
  {
    title: "Practice",
    items: ["Experimental design", "Technical writing", "Documentation", "Code review", "Deployment ownership"],
  },
]
