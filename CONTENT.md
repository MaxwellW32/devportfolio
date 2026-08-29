# Editing this site

Everything you will want to change lives in **four files** and **one folder**.
No component edits, no CSS, no rebuild ritual — change the data, save, done.

| I want to… | Edit this |
| --- | --- |
| Add / remove / reorder a project | `lib/projects.ts` |
| Change my bio, principles, skills, achievements | `lib/profile.ts` |
| Add a playground toy | `lib/FunData.ts` |
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

**The title has to be the slug, spaced out.** `/fun/three` showing a card
called "Boids" meant the URL and the name disagreed, which is confusing in a
browser history and worse out loud. `checkFunSlugs()` in `lib/FunData.ts`
warns in development if they drift apart, and each toy's `layout.tsx` carries
the same title so the browser tab agrees too.

### Two of everything, on purpose

Some slugs are a pair: one keeps the original idea, one takes it the other way.

- `luckRanked` draws the winner **after** you click — pure chance, nothing to
  read. `shellGame` places the ball **before** the shuffle, so following it is
  possible. Same scoreboard maths, opposite claims.
- `musicBounce` maps slices of the spectrum onto what the cube does.
  `chimeBox` turns the walls into instruments and plays them by collision.

If you rewrite one of these, do not overwrite the other with it.

### Sound

The four audio toys share one synthesiser at
`app/fun/(fun)/_audio/synth.ts` — voices, scales, and the two schedulers.
Nothing on those pages is a sample; it is all oscillators and one noise buffer.
If you add another audio toy, use `createStepScheduler` or `createTransport`
from there rather than a `setInterval`. The comment at the top of that file
explains why that matters more than it sounds like it should.

The `_audio` folder starts with an underscore, so Next.js treats it as private
and never routes to it.

### The character

He lives in `components/player/` and is mounted once in the root layout, so he
walks the whole site rather than only `/fun`.

- **Waking him up:** `SpriteToggle`, or <kbd>Shift</kbd>+<kbd>P</kbd> anywhere.
  The state persists in localStorage.
- **Platforms:** any `h1`, `h2`, `h3`, `.card` or `.btn` inside `#main`, plus
  anything with `data-platform-enabled` or the class `platform`. Opt a subtree
  out with `data-platform-disabled`.
- **Float mode:** <kbd>F</kbd>. Gravity off, WASD in all four directions, and
  whatever is under his chest gets outlined so <kbd>E</kbd> can follow it.
- **Full-screen toys:** he suspends himself whenever `body[data-immersive]` is
  true, so the games keep their own WASD.

```tsx
<h2 data-platform-enabled>A heading he can stand on</h2>
<section data-platform-disabled>...nothing in here is landable...</section>
```

---

## 5. Adding a lab build

1. Add an entry to the `builds` array at the top of `app/lab/page.tsx`
2. Create `app/lab/(demos)/<slug>/page.tsx`

The `(demos)` group makes it full-bleed with a "show site nav" toggle.

### The landing-page studies moved out

The client-facing demo sites used to live at `/lab/pages`. They are now their
own Next.js project (`websiteprojects`, deployed alongside squaremaxtech.com),
where each one is a real multi-page site rather than a single route. `/lab`
links out to them.

---

## Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run check        # typecheck + lint, run this before deploying
npm run capture      # screenshot live sites
npm run perft        # verify the chess move generator against published counts
```

---

## Where things live

```
app/
  page.tsx                    home
  projects/                   the catalogue + case study pages
  fun/(fun)/                  playground toys (full-screen)
  fun/(fun)/_audio/           the shared synthesiser
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
  player/                     the character, mounted site-wide
public/shots/                 ← drop screenshots here, named by slug
scripts/capture.ts            the screenshot crawler
```

### Changing the look

`app/globals.css` is the design system, and the top of it is a token block. The
accent colour appears once, as `--color-signal`. Change that one value and the
whole site follows — buttons, links, labels, charts, the platformer hint, all of
it.
