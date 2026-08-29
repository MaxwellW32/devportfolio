# Editing this site

Everything you will want to change lives in **four files** and **one folder**.
No component edits, no CSS, no rebuild ritual — change the data, save, done.

| I want to… | Edit this |
| --- | --- |
| Add / remove / reorder a project | `lib/projects.ts` |
| Change my bio, principles, skills, achievements | `lib/profile.ts` |
| Add a playground toy | `lib/FunData.ts` |
| Add a landing-page study | `lib/landingPageExamplesData.ts` |
| Add a screenshot | drop a file in `public/shots/` |

---

## 1. Adding a project

Open `lib/projects.ts` and copy an existing entry. **Order in the array is the
order on the page** — to move a project up the list, move its block up.

```ts
{
  slug: "my-new-thing",           // URL-safe, unique. Also the image filename.
  title: "My New Thing",
  tagline: "One line. What it is, said plainly.",
  year: "2026",
  tier: "flagship",               // flagship | product | client | experiment
  status: "live",                 // live | private | archived | building
  domain: "Platform",             // groups the filter chips — reuse an existing one
  caseStudy: true,                // true = gets its own page at /projects/my-new-thing

  summary: "Two to four sentences. What it is and who it is for.",

  hardPart: {                     // OPTIONAL but this is the field that gets you hired
    title: "The one genuinely difficult problem",
    body: "What the obvious approach was, why it was wrong, and what you did instead.",
  },

  highlights: [                   // what it does, concretely
    "A thing it does",
    "Another thing it does",
  ],

  proves: [                       // what building it says about you
    "A skill this demonstrates",
  ],

  stack: ["Next.js 16", "TypeScript", "PostgreSQL"],

  metrics: [                      // OPTIONAL — shown as the big numbers
    { value: "49k+", label: "lines of TypeScript" },
  ],

  links: [                        // OPTIONAL
    { label: "example.com", href: "https://example.com", kind: "live" },
  ],
}
```

### The fields that matter most

**`hardPart`** is the one that does the work. Anyone can list a stack. This is
where you say: here was the problem where the obvious answer was wrong. Projects
without one still render fine, but the ones with it are the ones people
remember.

**`proves`** answers the question a recruiter is actually asking — not *what did
you build* but *what does this tell me about how you work*.

**`status`** is honest labelling, and it is worth keeping honest:
- `live` — anyone can visit it right now
- `private` — it runs, but the code or the deployment is not public (trading
  systems, client internals). **Not** a euphemism for unfinished.
- `archived` — it ran, it does not any more
- `building` — genuinely in progress

**`tier`** decides which group it appears under in the index rail:
- `flagship` — the ones you would defend in an interview
- `product` — self-directed things you built and shipped
- `client` — paid work
- `experiment` — smaller or older

Only the first four `flagship` entries appear on the home page.

### Removing a project

Delete its block. If it had `caseStudy: true`, its page disappears with it — no
other file mentions it.

---

## 2. Adding a screenshot

**Name the file after the slug and drop it in `public/shots/`.** That is the
entire process.

```
public/shots/my-new-thing.png
public/shots/squaremax.jpg
```

Works with `.png` `.jpg` `.jpeg` `.webp` `.avif`.

If there is no file, a generated placeholder renders instead — a plot figure
derived from the slug, unique per project and stable across builds. So a project
without artwork still looks deliberate, and you can add the image later without
touching any code.

### Capturing live sites automatically

```bash
npm run capture:install     # once — downloads a Chromium build
npm run capture             # shoots every project with a kind: "live" link
npm run capture -- squaremax paramount-couriers   # or just these
npm run capture -- --force  # replace images that already exist
```

It opens each site at 1440×900 at 2× density, scrolls the full page so lazy
images load, hides cookie banners, and writes `public/shots/<slug>.png`.

Existing files are never overwritten without `--force`, so a screenshot you took
by hand is safe.

**Why screenshots rather than live embeds:** a screenshot is a frozen record of
the work as it shipped. Client sites get redesigned and domains lapse; a dead
iframe on a portfolio is worse than no iframe. The capture is the durable
artefact, the link is the bonus. Re-run `npm run capture -- --force` whenever a
site changes and you want the newer look.

---

## 3. Editing the about page

`lib/profile.ts` holds:

- `profile` — name, location, email, social links, and the bio paragraphs
- `capabilities` — the four numbers in the strip under the hero
- `principles` — the "how I work" list (home page and about page)
- `achievements` — the dated track record on the home page
- `skillGroups` — the toolkit chips on the about page

The "most used, by project count" chart on the about page is **derived from
`lib/projects.ts`**, not hand-maintained. Add a project and it updates itself,
so that list can never drift away from what you have actually shipped.

---

## 4. Adding a playground toy

1. Add an entry to `lib/FunData.ts`
2. Create `app/fun/(fun)/<slug>/page.tsx`

The `(fun)` route group gives it full-screen chrome-free layout automatically.
Give each toy its own `← Playground` link back, as the existing ones do.

The `claim` field is the point of the entry — say what the toy sets out to
demonstrate, not what it is made of.

`state` is honest: `polished`, `playable`, or `sketch`.

### The platformer character

The character on `/fun` treats any element with `data-platform-enabled` as a
one-way platform. To make a new heading landable:

```tsx
<h2 data-platform-enabled>Some heading</h2>
```

It re-measures on layout changes, so this works on anything.

---

## 5. Adding a lab build

1. Add an entry to the `builds` array at the top of `app/lab/page.tsx`
2. Create `app/lab/(demos)/<slug>/page.tsx`

The `(demos)` group makes it full-bleed with a "show site nav" toggle.

---

## Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run check        # typecheck + lint, run this before deploying
npm run capture      # screenshot live sites
```

---

## Where things live

```
app/
  page.tsx                    home
  projects/                   the catalogue + case study pages
  fun/(fun)/                  playground toys (full-screen)
  lab/                        small builds + landing-page studies
  globals.css                 the whole design system
lib/
  projects.ts                 ← the project catalogue
  profile.ts                  ← bio, principles, skills, achievements
  FunData.ts                  ← playground index
  shots.ts                    screenshot resolution (server-only)
components/
  chrome/                     navbar, footer, immersive mode
  projects/                   card, explorer rail, screenshot, status tag
  hero/                       the animated signal plot
  player/                     the platformer character
public/shots/                 ← drop screenshots here, named by slug
scripts/capture.ts            the screenshot crawler
```

### Changing the look

`app/globals.css` is the design system, and the top of it is a token block. The
accent colour appears once, as `--color-signal`. Change that one value and the
whole site follows — buttons, links, labels, charts, the platformer hint, all of
it.
