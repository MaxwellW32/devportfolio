/* ============================================================================
   THE PROJECT CATALOGUE
   One source of truth for every project on the site.

   Editorial rules I hold this file to:
   - Never claim a result the project has not measured. Where a system was
     shut down because the evidence said so, that IS the story worth telling.
   - "hardPart" is the load-bearing field. Anyone can list a stack; the hard
     part is what shows the engineering.
   - "proves" answers the recruiter's real question: what does this say about
     how this person works?
   ========================================================================= */

export type projectTier = "flagship" | "product" | "client" | "experiment"

export type projectStatus = "live" | "private" | "archived" | "building"

export type projectLink = {
  label: string
  href: string
  kind: "live" | "repo" | "store"
}

export type projectMetric = {
  value: string
  label: string
}

export type project = {
  slug: string
  title: string
  /** One line. Shown under the title everywhere. */
  tagline: string
  year: string
  tier: projectTier
  status: projectStatus
  /** Grouping label used by the index rail filters. */
  domain: string
  /** 2–4 sentences. What it is and who it is for. */
  summary: string
  /** The genuinely difficult engineering problem, and how it was solved. */
  hardPart?: {
    title: string
    body: string
  }
  /** What the project does, in concrete terms. */
  highlights: string[]
  /** What building it demonstrates. */
  proves: string[]
  stack: string[]
  metrics?: projectMetric[]
  links?: projectLink[]
  /** Path under /public/shots — captured by `npm run capture`. */
  shot?: string
  /** Renders a dedicated deep-dive page at /projects/[slug]. */
  caseStudy?: boolean
}

export const projects: project[] = [
  /* ==========================================================================
     FLAGSHIP
     ======================================================================== */
  {
    slug: "polyedge",
    title: "Polyedge",
    tagline: "An autonomous market maker that is built to prove itself wrong.",
    year: "2026",
    tier: "flagship",
    status: "private",
    domain: "Trading systems",
    caseStudy: true,
    summary:
      "A market-making and prediction engine for Polymarket, running as a singleton booted inside the Next.js server process and controlled through its own dashboard. Every bot defaults to paper mode. The interesting part is not the trading logic — it is the measurement apparatus built around it, which has killed more of my own strategies than it has kept.",
    hardPart: {
      title: "Making a simulation admit it is lying",
      body:
        "Paper trading flatters you. My paper runs said one strategy earned +$12 a window; the same window traded live lost $16.44. Closing that gap became the actual project. Journals now record the order book at the moment of every decision, so a fill can be audited after the fact instead of assumed. Estimates are scored only against what actually rested on the book, and every number carries a provenance label — measured-live, measured-paper, derived, or modelled — because pooling those four is how you fool yourself. After an accounting rewrite the reward estimator went from capturing 14–21% of what the exchange actually paid to 93%.",
    },
    highlights: [
      "Paper-first engine: every bot ships with dryRun defaulted on, and live mode is gated behind an accounting reconciliation that must balance against the exchange",
      "Circuit breakers on position drift, cancel refusals, loss streaks and single-trade anomalies",
      "Relayed on-chain auto-redemption of resolved positions, after finding and working around an SDK bug that hid closed markets",
      "Tape-replay harness that re-runs a strategy against thousands of real recorded market windows",
      "A written accuracy protocol, added after four avoidable analysis failures, that the system and I both follow",
    ],
    proves: [
      "Building the instrument before trusting the reading",
      "Reconciling a live financial system against an external source of truth",
      "Killing my own work when the evidence says to",
      "Long-running process design, on-chain integration, and failure containment",
    ],
    metrics: [
      { value: "1,423", label: "real market windows replayed for one verdict" },
      { value: "93%", label: "reward-estimate accuracy after the accounting rewrite" },
      { value: "30k+", label: "lines of TypeScript" },
    ],
    stack: ["TypeScript", "Next.js 16", "Polymarket CLOB", "ethers", "viem", "WebSockets", "PM2", "Linux VPS"],
  },

  {
    slug: "polymtrade",
    title: "Polymtrade",
    tagline: "A fleet of trading strategies, each one on trial.",
    year: "2026",
    tier: "flagship",
    status: "private",
    domain: "Trading systems",
    caseStudy: true,
    summary:
      "A multi-strategy trading fleet where every strategy is an experiment with a written verdict. Strategies are spawned as variants with knob-level differences, journalled independently, and judged against a bar set before the test runs. Most of them are now deleted — and each deletion has a note explaining the evidence that killed it.",
    hardPart: {
      title: "Pre-registering the bar before seeing the result",
      body:
        "The failure mode in trading research is finding a pattern after the fact and believing it. So tests here are pre-registered: the sample size, the success threshold and the decision rule are written down before the run starts. One strategy looked like it had a +6 point edge; the pre-registered read gave +2.2 points with roughly a one-in-four chance the true edge was zero or negative. A favourite pocket that appeared strong at 441 windows vanished at 1,423 — it was noise from counting shares as the sample size when the real unit is windows. Getting the denominator right is most of the work.",
    },
    highlights: [
      "Per-strategy journals with era stamps, so results from before and after an engine change are never pooled blindly",
      "A/B variant spawning through a control API — identical code, explicit knob diffs, compared per tag",
      "Analysis CLI tools that render a verdict from the journals rather than from memory",
      "Hard halts on loss streak, session loss percentage and single-trade anomaly",
      "An archive of deleted strategies, each with the note that retired it",
    ],
    proves: [
      "Experimental design and statistical honesty under financial incentive to self-deceive",
      "Separating engine, strategy and analysis so each can change independently",
      "Writing decisions down so the next session cannot relitigate them from vibes",
    ],
    metrics: [
      { value: "5,006", label: "market rounds behind a single retired-strategy verdict" },
      { value: "25k+", label: "lines of TypeScript" },
    ],
    stack: ["TypeScript", "Next.js", "Polymarket API", "Chainlink TWAP", "WebSockets", "PM2", "Linux VPS"],
  },

  {
    slug: "squaremax",
    title: "Squaremax",
    tagline: "A multi-tenant website builder that emits real sites, not templates.",
    year: "2025—2026",
    tier: "flagship",
    status: "live",
    domain: "Platform",
    caseStudy: true,
    summary:
      "A hosted website platform where a business signs up, builds its site from a live component picker, and gets a real multi-tenant site at its own slug or custom domain. Add-ons — booking, notifications, store and inventory — switch on per tenant and bill automatically.",
    hardPart: {
      title: "A component instance that owns its own data",
      body:
        "The invariant that makes the whole builder work: a site is rows of placed components, and each row has a unique id that owns its data blob. Two navbars on one site are two independent rows. Swapping a component's visual design within its category never touches its content, because the category fixes the data shape and the variant only chooses how it is drawn. That one decision is why a user can redesign a section without losing what they typed, and why adding a new design is one component file plus one registry line. Twenty-eight component categories share a single typed props contract, and every visual style resolves through CSS custom properties inlined on the tenant root — never on :root, so two tenants can render on one page without bleeding into each other.",
    },
    highlights: [
      "28 component categories in a Zod discriminated union, each with multiple hot-swappable designs",
      "Per-instance style overrides with CSS scoped by prefixing every selector, so tenant custom CSS cannot escape its own component",
      "Custom-domain rendering through a host-header proxy that rewrites to per-domain routes",
      "Tenant-scoped customer accounts with scrypt password hashing and DB-backed per-tenant session cookies",
      "Accounting-grade inventory add-on: cost and tax tracked per line, discounts apportioned before tax, refunds that restock",
    ],
    proves: [
      "Designing a data model that stays correct as the product grows",
      "Multi-tenancy done properly — isolation at the data, style and session layers",
      "Turning a hard architectural idea into something a non-technical user can operate",
    ],
    metrics: [
      { value: "28", label: "component categories" },
      { value: "29k+", label: "lines of TypeScript" },
      { value: "5", label: "pages per tenant site" },
    ],
    links: [{ label: "squaremaxtech.com", href: "https://squaremaxtech.com", kind: "live" }],
    stack: ["Next.js 16", "React 19", "TypeScript", "Drizzle", "PostgreSQL", "Tailwind 4", "Zod 4", "next-auth", "sharp"],
  },

  {
    slug: "street-market",
    title: "Jamaican Online Market",
    tagline: "An offline-first marketplace for vendors with unreliable data.",
    year: "2026",
    tier: "flagship",
    status: "private",
    domain: "Platform",
    caseStudy: true,
    summary:
      "A progressive web app putting Jamaican street vendors online. Built on the assumption that the merchant's phone has spotty signal, so the dashboard is local-first: every action applies instantly against local state and syncs later, and the sync is designed to be correct when ops arrive hours out of order.",
    hardPart: {
      title: "Conflict resolution that respects what the vendor actually knew",
      body:
        "Every user action is an op with a client-generated id and a client timestamp — the moment the vendor actually acted, which matters when it syncs three hours later. The subtle rule is that sales and stock counts resolve differently. A sale is a commutative fact, so it is always ledgered; but it only decrements exact stock if the sale postdates the vendor's last absolute stock assertion. A vendor who counted twelve left at 3pm has already accounted for the 1pm sale that is only now syncing. Absolute stock sets are last-write-wins by client time, and losing to a later write returns 'stale' rather than an error — the other device simply spoke last. Undo works by deleting the queued op before the server ever sees it, so there are no compensating negative sales lying in the ledger.",
    },
    highlights: [
      "IndexedDB outbox with exponential backoff, flush on reconnect and on visibility change",
      "Sync exposed as a route handler, not a server action — server-action ids rotate across deploys, and an op queued for days would 404",
      "Idempotency keyed on client-generated op ids: first writer wins, replays acknowledged as duplicates",
      "Pure, unit-tested conflict reducer shared by client and server",
      "PostGIS for geo, pg_trgm for fuzzy search, MapLibre with keyless tiles",
    ],
    proves: [
      "Distributed-systems reasoning applied to a real constraint, not a hypothetical one",
      "Designing for the user's actual network, not the developer's",
      "Knowing when a framework's convenience feature is the wrong tool",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "PostGIS", "Drizzle", "IndexedDB", "MapLibre GL", "SSE", "Zod 4"],
  },

  {
    slug: "track-jutc",
    title: "JUTC Live",
    tagline: "Real-time bus tracking built for prepaid data and patchy signal.",
    year: "2026",
    tier: "flagship",
    status: "private",
    domain: "Realtime",
    caseStudy: true,
    summary:
      "Live tracking for Jamaica's public bus service. Driver phones run a PWA that queues GPS pings offline and uploads them in batches; riders poll a compact live view that shows where the bus is and how stale that answer is.",
    hardPart: {
      title: "Deriving a bus route from the buses themselves",
      body:
        "There was no route geometry to work from, so the corridors are derived from the traces. Nightly, each route's recent shifts are cleaned, projected into UTM 18N so the maths is metric, and the consensus route is taken as the medoid — the trace with the lowest mean Hausdorff distance to all the others. It is robust at tens-of-traces scale without any clustering machinery. Segments that escape a 150m buffer around the consensus and run at least 300m are kept as offshoots with a support count, and drawn thinner on the rider map. I also chose HTTP polling over WebSockets deliberately: driver uploads are batched every 30 to 60 seconds anyway, so polling matches the real freshness with far less machinery and behaves better on prepaid data.",
    },
    highlights: [
      "Crash-safe IndexedDB ping queue that preserves the original recording time",
      "Server-side plausibility filter: Jamaica bounds, timestamp windows, accuracy ceiling, teleport rejection against a max plausible speed",
      "Live store in Redis holding latest position plus a ten-point trail, ageing out at ten minutes",
      "Compact array payloads with an explicit staleness value, so markers fade honestly instead of lying",
      "Every architectural decision logged with its reasoning in a decision changelog",
    ],
    proves: [
      "Choosing boring technology on purpose, and being able to justify it",
      "Geospatial analysis with PostGIS beyond storing a point",
      "Designing honestly for degraded conditions rather than the happy path",
    ],
    stack: ["Next.js 16", "TypeScript", "PostgreSQL", "PostGIS", "Redis", "Google Maps", "Web Push", "PWA"],
  },

  {
    slug: "cheers",
    title: "Cheers",
    tagline: "A cash-first services marketplace with a worker-safety spine.",
    year: "2026",
    tier: "flagship",
    status: "private",
    domain: "Platform",
    caseStudy: true,
    summary:
      "A Jamaica-wide open services marketplace running three interlocking models at once — a gig marketplace, a reverse marketplace where customers post budgets, and a ride marketplace where drivers counter-offer. Threaded through all three is a safety system: PIN-verified job starts, timed check-ins, a live map and an SOS path monitored from a staff safety desk.",
    hardPart: {
      title: "Three marketplaces that resolve into one booking",
      body:
        "Gigs, job requests and rides are three different negotiation shapes — fixed price, budget-and-counter, and route-and-counter — but they all have to land on the same booking object with the same safety guarantees and the same money rules. Getting that convergence right meant the safety spine, the payout ledger and the review system could each be built once. The money model is genuinely awkward in a good way: it is cash-first, so workers keep what they collect and the platform fee is netted against their weekly payout, which means a cash-heavy week produces a negative payout the system has to represent honestly rather than hide.",
    },
    highlights: [
      "Five roles with sub-roles, including a dedicated safety-monitor desk",
      "SSE over ReadableStream as the realtime channel, since the deployment has no WebSocket path in route handlers",
      "Cash-first payout ledger where a negative weekly payout is a first-class state",
      "Access control layered as layout-level UX plus server-action guards for actual security",
      "Documented codebase map, safety architecture and demo walkthrough kept current alongside the code",
    ],
    proves: [
      "Holding a large product surface coherent — this is the biggest codebase here",
      "Modelling money and trust carefully, including the uncomfortable states",
      "Writing documentation good enough for someone else to take over",
    ],
    metrics: [
      { value: "49k+", label: "lines of TypeScript" },
      { value: "3", label: "marketplaces on one booking model" },
      { value: "5", label: "roles with distinct permissions" },
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Drizzle", "PostgreSQL", "next-auth", "Stripe", "Web Push", "Google Maps"],
  },

  {
    slug: "dynamic-story",
    title: "Dynamic Story",
    tagline: "An AI narrator that runs a persistent world and can say no.",
    year: "2025",
    tier: "flagship",
    status: "private",
    domain: "AI systems",
    caseStudy: true,
    summary:
      "An interactive narrative engine where the player is the main character of a generated book. An AI game master narrates a world that persists in a database — locations, characters, goals — and characters remember what happened. Built early, when getting structured JSON back from a model reliably was still the hard part.",
    hardPart: {
      title: "Letting the model mutate the world without letting it corrupt it",
      body:
        "A narrator that can only produce prose is a toy. This one emits a typed mutation array alongside its narration — changes to characters, to the player, to sub-goals, to the chapter — which the server validates and applies. That turns storytelling into a state machine the database can hold. Travel is adjudicated rather than assumed: the narrator can deny a move in-fiction, because you are still fighting the dragon. Locations form a three-level hierarchy with a connection graph carrying travel descriptions, so the world is navigable rather than a list of scenes. It is a multi-agent pipeline in practice — a quest-designer model, a narrator model and a chat model, each with a different job.",
    },
    highlights: [
      "Typed mutation array emitted by the narrator and validated server-side before it touches state",
      "Area connection graph with travel descriptions, plus a pannable and zoomable map",
      "Character memories persisted so NPCs reference what actually happened",
      "Goals and sub-goals as the story spine, with a checklist the player can also ignore",
      "Zod schemas as the contract between model output and the database",
    ],
    proves: [
      "Working with LLMs as unreliable components inside a system with invariants",
      "Multi-agent decomposition before it was a common pattern",
      "Schema-first thinking applied to non-deterministic output",
    ],
    stack: ["Next.js", "TypeScript", "OpenAI API", "Zod", "Drizzle", "PostgreSQL", "next-auth", "Jotai"],
  },

  /* ==========================================================================
     PRODUCTS / SELF-DIRECTED
     ======================================================================== */
  {
    slug: "wordbound",
    title: "Wordbound",
    tagline: "Language learning as an RPG the AI runs for you.",
    year: "2025—2026",
    tier: "product",
    status: "private",
    domain: "AI systems",
    summary:
      "The second iteration of the narrative engine, refocused on language learning. Vocabulary in the language you are learning is woven into narration and dialogue, and combat is a language challenge rather than a stat check. Built after writing an architecture document analysing what the first prototype got wrong.",
    hardPart: {
      title: "Rebuilding on an honest post-mortem",
      body:
        "Rather than restarting, I wrote an analysis of both prototypes first — what the shared vision was, which weaknesses were structural, and the reasoning behind each decision in the redesign. The first version had a rich world model and no learning layer; the second had to weave vocabulary in without breaking the fiction.",
    },
    highlights: [
      "Vocabulary surfaced inside narration and dialogue rather than in drills",
      "Language challenges as the combat mechanic",
      "Architecture and roadmap documents written before the rebuild",
    ],
    proves: ["Learning from my own prototypes deliberately", "Documenting a redesign before writing it"],
    stack: ["Next.js", "TypeScript", "OpenAI API", "Drizzle", "PostgreSQL", "Zod", "next-auth"],
  },

  {
    slug: "polyscout",
    title: "Polyscout",
    tagline: "A market monitor that watches while I do not.",
    year: "2026",
    tier: "product",
    status: "private",
    domain: "Trading systems",
    summary:
      "A monitoring service over prediction markets with a worker running outside the Next.js process, so watching continues whether or not anyone has the app open. Uses Claude for structured analysis of what it finds.",
    highlights: [
      "Standalone worker process that must keep running independently of the web app",
      "Strict TypeScript with no any and no type assertions, enforced as a project rule",
      "Email alerting on conditions the worker detects",
    ],
    proves: ["Separating a long-running worker from a web process cleanly", "Holding a strict type discipline"],
    stack: ["Next.js", "TypeScript", "Anthropic SDK", "Drizzle", "PostgreSQL", "next-auth", "Zod", "tsx"],
  },

  {
    slug: "binance-trader",
    title: "Binance Trader",
    tagline: "Spot trading automation with the same paper-first discipline.",
    year: "2026",
    tier: "product",
    status: "private",
    domain: "Trading systems",
    summary:
      "An automated trading system for Binance, built with the measurement habits carried over from the Polymarket work: journal everything, simulate before risking, and label what has actually been measured.",
    highlights: ["Instrumentation booted with the server process", "Journalled decisions for after-the-fact audit", "Deployed to a Linux VPS under PM2"],
    proves: ["Transferring hard-won discipline between domains", "Exchange API integration and rate-limit handling"],
    stack: ["Next.js", "TypeScript", "Binance API", "PM2", "Linux VPS"],
  },

  {
    slug: "paperless",
    title: "Paperless",
    tagline: "Replacing a paper tracking process with a real system.",
    year: "2025",
    tier: "product",
    status: "live",
    domain: "Platform",
    summary:
      "A document and request tracking platform built to replace a paper-based workflow — the same problem I solved with WebSockets as a NOC engineer, rebuilt properly as a product with accounts, roles and an audit trail.",
    highlights: ["Role-based access over a document lifecycle", "Server-action mutations validated with Zod", "Deployed on a custom Linux VPS"],
    proves: ["Turning an operational pain I lived through into a product", "Auth and authorisation done with a real session model"],
    stack: ["Next.js", "TypeScript", "Drizzle", "PostgreSQL", "next-auth", "Zod", "Jotai"],
  },

  {
    slug: "rideflow",
    title: "RideFlow",
    tagline: "Ride dispatch with live maps and negotiated fares.",
    year: "2026",
    tier: "product",
    status: "private",
    domain: "Realtime",
    summary:
      "A ride-hailing dispatch system with live driver positions, fare negotiation and trip lifecycle management — the standalone predecessor of the rides marketplace that later folded into Cheers.",
    highlights: ["Live driver positions on Google Maps", "Fare counter-offer flow", "Session-backed roles for riders and drivers"],
    proves: ["Realtime state synchronised across two very different clients", "Recognising when a project should become part of a bigger one"],
    stack: ["Next.js", "TypeScript", "Drizzle", "PostgreSQL", "Google Maps", "next-auth", "Zod"],
  },

  {
    slug: "gameoflife",
    title: "Game of Life",
    tagline: "Conway's automaton, built to run smoothly at scale.",
    year: "2026",
    tier: "product",
    status: "live",
    domain: "Simulation",
    summary:
      "An implementation of Conway's Game of Life focused on the performance problem rather than the rules — keeping a large grid stepping and rendering at a steady frame rate.",
    highlights: ["Generation stepping decoupled from render", "Pattern seeding and playback controls"],
    proves: ["Optimising a hot loop", "Knowing when the interesting problem is the rendering, not the algorithm"],
    stack: ["Next.js", "TypeScript", "Canvas"],
  },

  /* ==========================================================================
     CLIENT WORK
     ======================================================================== */
  {
    slug: "paramount-couriers",
    title: "Paramount Couriers",
    tagline: "Courier operations and customer-facing tracking.",
    year: "2025",
    tier: "client",
    status: "live",
    domain: "Client work",
    summary:
      "A production courier platform handling shipment intake and tracking, deployed to a custom Linux VPS with its own database and backup routine.",
    highlights: ["Shipment lifecycle and tracking", "Deployed and maintained on a client-owned VPS", "Regular database backups as part of the operational handover"],
    proves: ["Owning a system in production, not just shipping it", "Working to a real business process"],
    links: [{ label: "paramount-couriers.com", href: "https://paramount-couriers.com", kind: "live" }],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Linux VPS", "nginx"],
  },

  {
    slug: "thesourcebps",
    title: "The Source BPS",
    tagline: "Business services site with booking and enquiry flows.",
    year: "2025",
    tier: "client",
    status: "live",
    domain: "Client work",
    summary: "A production business services website with structured enquiry handling and transactional email.",
    highlights: ["Validated enquiry forms with server-side handling", "Transactional email delivery", "Deployed to a custom VPS"],
    proves: ["Delivering to a client brief on a deadline"],
    links: [{ label: "thesourcebps.com", href: "https://thesourcebps.com", kind: "live" }],
    stack: ["Next.js", "TypeScript", "Zod", "nodemailer", "Linux VPS"],
  },

  {
    slug: "sourceproperty",
    title: "Source Property Services",
    tagline: "Property services with payments and authenticated accounts.",
    year: "2026",
    tier: "client",
    status: "live",
    domain: "Client work",
    summary:
      "A property services platform with customer accounts, Stripe payments and a service request pipeline, running on a custom VPS.",
    highlights: ["Stripe payment integration", "Authenticated customer accounts over Drizzle and Postgres", "Service request workflow"],
    proves: ["Handling money in production", "Full-stack delivery from schema to deployment"],
    stack: ["Next.js", "TypeScript", "Drizzle", "PostgreSQL", "Stripe", "next-auth", "Linux VPS"],
  },

  {
    slug: "angelrose",
    title: "Angel Rose Adult Care",
    tagline: "Care services site built for clarity and trust.",
    year: "2025",
    tier: "client",
    status: "live",
    domain: "Client work",
    summary:
      "A care services website where the design job was trust and legibility for an audience that is often reading it under stress, on a phone, for a family member.",
    highlights: ["Accessible, high-legibility layout", "Validated contact and enquiry handling", "Deployed to a custom VPS"],
    proves: ["Designing for the reader's real circumstances", "Restraint where restraint is the right answer"],
    links: [{ label: "angelroseadultcare.com", href: "https://angelroseadultcare.com", kind: "live" }],
    stack: ["Next.js", "TypeScript", "Zod", "nodemailer", "Linux VPS"],
  },

  {
    slug: "pines-dental",
    title: "Pines Dental",
    tagline: "Dental practice site with appointment enquiry.",
    year: "2024",
    tier: "client",
    status: "live",
    domain: "Client work",
    summary: "A dental practice website with service listings and an appointment enquiry flow.",
    highlights: ["Service and treatment presentation", "Appointment enquiry with email delivery", "Responsive layout tuned for mobile-first traffic"],
    proves: ["Clean delivery of a focused brief"],
    stack: ["Next.js", "TypeScript", "Tailwind", "Zod", "EmailJS"],
  },

  {
    slug: "student-dashboard",
    title: "Student Dashboard",
    tagline: "Coursework, schedules and progress in one view.",
    year: "2024",
    tier: "client",
    status: "archived",
    domain: "Client work",
    summary: "A student-facing dashboard bringing coursework, schedules and progress together in a single interface.",
    highlights: ["Component-driven dashboard layout", "Custom element library built alongside the app"],
    proves: ["Early component-system thinking"],
    links: [{ label: "GitHub", href: "https://github.com/MaxwellW32/studentDashboard", kind: "repo" }],
    stack: ["Next.js", "JavaScript", "CSS Modules"],
  },

  /* ==========================================================================
     EXPERIMENTS
     ======================================================================== */
  {
    slug: "playstore-apps",
    title: "Play Store Apps",
    tagline: "Video Splitter and Reading Practice, shipped to Android.",
    year: "2024",
    tier: "experiment",
    status: "live",
    domain: "Mobile",
    summary:
      "Two React Native apps published to the Google Play Store: a video splitter for cutting long recordings into shareable segments, and a reading practice app.",
    highlights: ["Published through the full Play Store review process", "Native media handling on device"],
    proves: ["Shipping to a store, not just to a URL", "Working outside the web platform"],
    stack: ["React Native", "JavaScript", "Android"],
  },

  {
    slug: "excel-extension",
    title: "Excel Request Extension",
    tagline: "A browser extension that automates a spreadsheet workflow.",
    year: "2024",
    tier: "experiment",
    status: "archived",
    domain: "Automation",
    summary:
      "A browser extension that reads and writes structured spreadsheet data to remove a repetitive manual step from a daily workflow — the same instinct behind the VBA automations I wrote as a NOC engineer.",
    highlights: ["Manifest v3 extension with a background service worker", "Spreadsheet parsing and generation in the browser"],
    proves: ["Automating my own drudgery rather than tolerating it"],
    stack: ["TypeScript", "Chrome Extension API", "SheetJS"],
  },

  {
    slug: "websocket-comms",
    title: "WebSocket Comms Platform",
    tagline: "Replacing a paper tracking system inside a live NOC.",
    year: "2023",
    tier: "experiment",
    status: "archived",
    domain: "Realtime",
    summary:
      "As a NOC engineer I designed and deployed a WebSocket-based real-time communication platform connecting internal departments directly to clients, replacing a paper-based tracking system. I also wrote VBA automations that compiled information out of email to cut manual effort for the team.",
    highlights: [
      "Real-time channel between internal departments and external clients",
      "Replaced a paper process that was already load-bearing for the business",
      "VBA automation over email to compile reporting information",
    ],
    proves: ["Shipping into a live operational environment with real users on day one", "Finding the automation nobody had asked for"],
    stack: ["Node.js", "WebSockets", "VBA"],
  },
]

/* ============================================================================
   DERIVED VIEWS
   ========================================================================= */

export const tierLabels: Record<projectTier, string> = {
  flagship: "Flagship",
  product: "Products",
  client: "Client work",
  experiment: "Experiments",
}

export const tierOrder: projectTier[] = ["flagship", "product", "client", "experiment"]

export const statusLabels: Record<projectStatus, string> = {
  live: "Live",
  private: "Private",
  archived: "Archived",
  building: "Building",
}

export function getProject(slug: string) {
  return projects.find(eachProject => eachProject.slug === slug)
}

export function getCaseStudies() {
  return projects.filter(eachProject => eachProject.caseStudy)
}

export function getProjectsByTier(tier: projectTier) {
  return projects.filter(eachProject => eachProject.tier === tier)
}

/** Every distinct stack entry, ordered by how often it appears. */
export function getStackFrequency() {
  const counts = new Map<string, number>()

  for (const eachProject of projects) {
    for (const eachTech of eachProject.stack) {
      counts.set(eachTech, (counts.get(eachTech) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }))
}
