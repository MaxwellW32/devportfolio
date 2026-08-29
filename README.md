# Maxwell Wedderburn — Portfolio

Full-stack engineer's portfolio. Next.js 16, React 19, Tailwind 4, TypeScript.

**To change the content, read [CONTENT.md](CONTENT.md).** Everything you will
want to edit lives in four data files and one folder — no component or CSS edits
needed.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run check` | typecheck + lint — run before deploying |
| `npm run capture` | screenshot every project with a live link |
| `npm run capture:install` | one-time Chromium download for the above |
| `npm run perft` | verifies the chess move generator against published node counts |

## Environment

Copy `.env.example` to `.env` and fill in the SMTP credentials. The naming
matches the other projects (cheers, polyedge), so one set of values works
across all of them.

```
EMAIL_SERVER_HOST     default smtp.gmail.com
EMAIL_SERVER_PORT     default 587
EMAIL_SERVER_USER
EMAIL_SERVER_PASSWORD
EMAIL_FROM            optional, "Name <addr>"
CONTACT_TO            optional, defaults to EMAIL_SERVER_USER
YT_KEY                optional, only the Random Player / Perspective demos
```

Without SMTP the site builds and runs fine — the contact form just reports that
it could not send rather than failing silently.

---

## The shape of it

```
/                     home — hero, principles, featured work, track record
/projects             the catalogue: index rail + morphing detail panel
/projects/[slug]      case study, for projects marked caseStudy: true
/fun                  playground index, with the platformer character
/fun/[toy]            full-screen playground pieces
/lab                  small builds
/lab/[demo]           the demos themselves
/aboutMe              bio, principles, toolkit
/contactUs            contact form
/blog                 writing
```

### Design system

`app/globals.css` holds the whole thing: colour tokens, a fluid type scale, and
a small set of primitives (`.btn`, `.chip`, `.card`, `.label`, `.readout`,
`.reveal`, `.status`). Components use CSS Modules on top of those tokens.

The accent colour is defined once as `--color-signal`. Change that value and the
entire site follows.

### Notable pieces

- **`components/projects/ProjectExplorer.tsx`** — the index rail plus detail
  panel, keyboard navigable with arrow keys.
- **`components/hero/SignalCanvas.tsx`** — the animated hero plot. Mean-reverting
  random walk with a moving average; cursor height drives volatility. Pauses
  when off-screen or when the tab is hidden.
- **`components/player/Player.tsx`** — the character. He is mounted in the root
  layout and walks the whole site: headings, cards and buttons are one-way
  platforms, and <kbd>F</kbd> turns gravity off so he becomes a slow, silly
  mouse that can follow links. He lives in a fixed, clipped overlay, which is
  what stops him extending the document as he walks toward its edge.
- **`app/fun/(fun)/chess/engine.ts`** — chess rules, verified by perft against
  the published node counts for six reference positions to depth five. The
  `Watch it play` mode picks a piece at random and then one of its legal
  moves at random, which is how a lone king and a pawn can beat a full roster.
- **`app/fun/(fun)/gameOfLife/automaton.ts`** — tiles that read their eight
  neighbours and move. The rule for a given neighbourhood is invented the first
  time that arrangement is ever seen, so the table is grown rather than written.
- **`app/fun/(fun)/musicBounce/page.tsx`** — slices of the spectrum mapped
  onto what the cube does, so the track draws its own path.
- **`app/fun/(fun)/_audio/synth.ts`** — the synthesiser behind all four audio
  toys, and the lookahead scheduler that keeps them in time.
- **`app/fun/(fun)/seedWorld/worldGen.ts`** — deterministic terrain. Every tile
  is a pure function of `(seed, x, y)`, so the world is infinite and stored
  nowhere.
- **`scripts/capture.ts`** — the screenshot crawler.

### Images

Drop a file at `public/shots/<slug>.png` and it appears on that project. No
import, no config. Missing images fall back to a generated placeholder derived
from the slug, so nothing ever renders broken. See CONTENT.md.
