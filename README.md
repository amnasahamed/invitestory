# InviteStory Landing Page

A standalone Vite + React + Tailwind site that showcases all 20 wedding invitation templates. Share this URL with enquiries so they can browse samples in one place.

## Run locally

```bash
cd 00-landing
npm install   # or bun install
npm run dev   # http://localhost:5173
```

## Build & deploy

```bash
npm run build
```

The output goes to `dist/`. Drag the folder into Netlify Drop, or push to a Netlify/Vercel project - `base: './'` is set in `vite.config.ts` so the build works from any subpath.

## How previews work

Each template card embeds an `<iframe>` that points at:

- **Placeholder mode (default):** a `data:` URL with a soft "Live preview" pill - works without any deployment.
- **Live mode:** set `USE_PLACEHOLDER = false` in `src/App.tsx` once the 20 template folders are deployed next to this landing page (e.g. each at `/{folder}/index.html`). The iframes will then load each template directly.

## Where the previews should live

When you deploy, the easiest layout is:

```
/
├── index.html              ← this landing page (built from 00-landing/)
├── template-rajwada-royale/
│   └── index.html
├── template-marigold-bhavan/
│   └── index.html
└── … (one folder per template, each the `dist/` of its template)
```

Each template's `vite.config.ts` is already set to `base: './'`, so they work from any subpath without rebuilding.

## Contact

- Instagram: [@invitestory.in](https://www.instagram.com/invitestory.in/)
- WhatsApp: [+91 82815 83882](https://wa.me/918281583882) (wired in `src/contact.ts`)

## Background music (YouTube)

Every template supports hidden YouTube audio with a **Play music** / **Pause** / **Mute** control (bottom-left). No video is shown.

1. Customer sends you a YouTube link (song or instrumental).
2. Open that template folder under `public/templates/<folder>/music.json`.
3. Paste the link:

```json
{
  "youtube": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

4. Refresh the invite. Guests tap **Play music** (required by mobile browsers - autoplay is blocked until a tap).

Leave `"youtube": ""` to hide the control.

After rebuilding templates into `public/templates/`, re-run:

```bash
npm run inject:music
npm run inject:fonts
```

That copies `yt-bg-music.js`, re-injects the music script tag if needed, and restores Google Fonts on SPA-converted template shells.