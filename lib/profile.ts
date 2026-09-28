/* ============================================================================
   PROFILE — the "about me" content in one editable place.
   Everything here renders on the home and about pages. Plain data, no JSX.
   ========================================================================= */

export const profile = {
  name: "Maxwell Wedderburn",
  role: "Full-stack developer",
  location: "Kingston, Jamaica",
  email: "maxwellwedderburn32@gmail.com",
  github: "https://github.com/MaxwellW32",
  linkedin: "https://www.linkedin.com/in/maxwell-wedderburn/",
  /** Shown as the hero pitch on the about page. */
  bio: [
    "I've been coding since I was six, and problem solving is still the part I love most. If something is broken, I want to know why. If something doesn't exist yet, I want to try building it.",
    "My background is in troubleshooting. I've worked as a systems engineer, travelling to client sites to fix hardware, software and network problems, and as a NOC engineer, keeping a data centre running. While working in the NOC I built a real-time platform to replace a paper-based tracking system, and wrote VBA scripts that pulled report information out of email so the team didn't have to do it by hand.",
    "Now I build full-stack apps with Next.js, PostgreSQL and Drizzle ORM, Zod and Three.js. So far that includes a website builder, AI story games, Polymarket trading bots and sites for real businesses. My favourite projects usually start with a problem I want to fix or an idea I want to test.",
    "I'm open to full-time roles and freelance work. If you have either, I'd like to hear about it.",
  ],
}

/* ---- Hero strip --------------------------------------------------------- */
export const capabilities: { value: string; label: string }[] = [
  { value: "5+", label: "Years building for the web" },
  { value: "20+", label: "Projects built" },
  { value: "8", label: "Sites live right now" },
]

/* ---- How I work --------------------------------------------------------- */
export const principles: { title: string; body: string }[] = [
  {
    title: "Find the real problem first",
    body:
      "Troubleshooting taught me to work out what's actually wrong before I change anything. I reproduce the problem, narrow down where it comes from, and then fix the cause.",
  },
  {
    title: "Build it to find out",
    body:
      "When I have an idea, I build a small version and see if it works. Most of the playground and the lab started that way. It's the quickest way I know to find out if an idea is any good.",
  },
  {
    title: "Let the tools catch mistakes",
    body:
      "I use Zod to check everything that comes into an app, including forms, API responses and AI output. Drizzle and TypeScript keep my code in step with the PostgreSQL database, so when I change a table I can see everything that needs updating.",
  },
  {
    title: "Build for the people using it",
    body:
      "Many of my apps are made for Jamaica, where a lot of people are on prepaid data with patchy signal. So the vendor marketplace keeps working offline and syncs later, and the bus tracker is light on data.",
  },
  {
    title: "Explain it in plain language",
    body:
      "I explain what I'm building and why in words anyone can follow. I write things down as I go, and I raise problems early so nobody gets a surprise later.",
  },
  {
    title: "Look after it once it's live",
    body:
      "I deploy most of my projects myself on Linux servers, with nginx, PM2, backups and deploy scripts. When something goes wrong in production, I'm the one who fixes it.",
  },
]

/* ---- Track record ------------------------------------------------------- */
export const achievements: { year: string; title: string; body: string; stack: string[] }[] = [
  {
    year: "2026",
    title: "Polymarket trading bots",
    body:
      "Polyedge and Polymtrade are bots that trade on Polymarket, a crypto prediction market. Polyedge is a market maker that I control from its own dashboard, and every bot on it starts in paper mode so I can test without real money. Polymtrade runs several strategies side by side so I can compare them. Both shut themselves down on a losing streak. I built them with Claude.",
    stack: ["TypeScript", "Next.js 16", "ethers", "viem", "WebSockets", "PM2"],
  },
  {
    year: "2026",
    title: "Apps that keep working offline",
    body:
      "A marketplace for Jamaican street vendors and a live tracker for JUTC buses, both built for phones that lose signal. The marketplace saves every action on the phone and syncs when the connection comes back. The bus tracker queues GPS pings on the driver's phone, and works out each route from where the buses actually drive.",
    stack: ["Next.js 16", "PostGIS", "IndexedDB", "Redis", "Drizzle", "MapLibre"],
  },
  {
    year: "2025—2026",
    title: "Squaremax, a website builder",
    body:
      "A business signs up, builds its site from a component picker and gets a real site on its own domain. Every section keeps its own content, so you can change how a section looks without losing what you typed. It has 28 kinds of component, plus add-ons for booking, notifications and inventory.",
    stack: ["Next.js 16", "React 19", "Drizzle", "PostgreSQL", "Tailwind 4", "Zod 4"],
  },
  {
    year: "2025",
    title: "Story-to-video system",
    body:
      "Pick a theme and it generates the characters, locations and scenes for a story. It keeps the characters consistent by giving the AI the right details each time, sometimes as images. ElevenLabs does the voices, and a script drives Adobe After Effects to put the dialogue, artwork and audio together into a finished video.",
    stack: ["Next.js", "TypeScript", "OpenAI", "ElevenLabs", "After Effects scripting"],
  },
  {
    year: "2025",
    title: "YouTube automation platform",
    body:
      "An app that scraped trending topics, wrote video scripts with GPT and produced videos that were ready to publish. I used Zod to check the AI's output before the app did anything with it.",
    stack: ["Next.js", "TypeScript", "Zod", "PostgreSQL", "GPT"],
  },
  {
    year: "2025",
    title: "AI story game",
    body:
      "A story game where you're the main character and an AI narrator runs the world. The world is saved in a database, so characters remember what happened and the story carries on from where you left it. Every change the AI wants to make is checked with Zod before it's saved.",
    stack: ["Next.js", "OpenAI", "Zod", "Drizzle", "PostgreSQL"],
  },
  {
    year: "2023",
    title: "Real-time platform that replaced paper",
    body:
      "While working as a NOC engineer, I built a WebSocket platform that connected internal departments directly to clients. It replaced a paper-based tracking system. I also wrote VBA scripts that pulled report information out of email, which saved the team from compiling it by hand.",
    stack: ["Node.js", "WebSockets", "VBA"],
  },
  {
    year: "2023—2026",
    title: "Websites for real businesses",
    body:
      "I've built and deployed sites for a courier company, property services, a care provider and a dental practice. I handle the backend, the logins and the frontend, and I host them on Linux servers I set up myself.",
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
    title: "Troubleshooting",
    items: ["Debugging", "Networking", "Hardware", "IT support", "Incident response", "Documentation"],
  },
]
