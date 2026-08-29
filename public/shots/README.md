# Project screenshots

Drop an image here named after the project's `slug` in `lib/projects.ts`:

    public/shots/polyedge.png
    public/shots/squaremax.jpg

Supported: .png .jpg .jpeg .webp .avif

That is the whole workflow. No import, no config, no data edit — the site
picks it up on the next build.

`npm run capture` fills this folder automatically for every project that has a
`kind: "live"` link. For private or archived work, save a screenshot manually
using the slug as the filename.

If no file exists for a project, a generated placeholder renders instead, so
the layout never breaks.
