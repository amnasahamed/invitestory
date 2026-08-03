# Landing Page Build Pipeline

This document explains how to (re)build the landing page with all 20 template previews working.

## What the landing page does

Each card on the landing page is an `<iframe>` pointing at `/templates/<folder>/index.html`. We deploy a built copy of each template into `00-landing/public/templates/<folder>/` so the iframes render the real app — not screenshots, not placeholders.

## One-shot rebuild

```bash
cd /Users/amnasahamed/Desktop/m3/lists
python3 /tmp/build_all_templates.py      # 5 Vite templates (dist/ → public/)
python3 /tmp/convert_to_spa.py           # 14 TanStack templates (SPA conversion + dist/)
python3 /tmp/fix_tanstack_routing.py     # rewrite URL → "/" so router matches
python3 /tmp/fix_router_paths.py         # same for Vite templates using react-router
python3 /tmp/fix_bundle_paths.py         # rewrite /images /assets /wedding /op-* asset paths to relative
python3 /tmp/snap_all.py                 # verify 20/20 with 0 broken images
```

Then restart `00-landing`'s dev server (or rebuild it).

Finally re-attach the shared YouTube music player (safe to re-run anytime):

```bash
cd 00-landing && npm run inject:music
```

Then restore Google Fonts on SPA-converted shells (TanStack conversion drops them):

```bash
cd 00-landing && npm run inject:fonts
```

## Per-template scripts (kept in /tmp)

| Script | Purpose |
|---|---|
| `/tmp/build_all_templates.py` | Builds the 5 Vite templates (templates 15, 16, 17, 18, 20) and copies `dist/` into `00-landing/public/templates/<folder>/`. |
| `/tmp/convert_to_spa.py` | Converts the 14 TanStack templates from TanStack Start (SSR) into true client-side SPAs: replaces `vite.config.ts`, deletes `src/server.ts` and `src/start.ts`, creates `src/main.tsx` with `createRoot`, and writes a custom `index.html`. |
| `/tmp/fix_tanstack_routing.py` | Injects `<base href="/templates/<folder>/">` + `history.replaceState("/", "")` into every TanStack shell so the router matches its `/` route inside an iframe. |
| `/tmp/fix_router_paths.py` | Same fix for the 4 Vite templates that use `react-router` with `<Route path="/">`. |
| `/tmp/fix_bundle_paths.py` | **Critical**: scans every JS bundle and rewrites absolute asset paths (`/images/foo.png`, `/assets/foo.png`, `/wedding/foo.png`, `/op-foo.png`, `/favicon.ico`, etc.) to **relative** paths. Without this step, `<img src="/images/foo.png">` resolves to origin root (`/images/foo.png`) instead of `/templates/<folder>/images/foo.png` — images appear as broken icons. |

## What changed in the TanStack templates

Each TanStack template's vite config and entry files were rewritten to make it a real SPA:

- `vite.config.ts` — replaced `@lovable.dev/vite-tanstack-config` with `@vitejs/plugin-react` + `vite-tsconfig-paths` + `@tailwindcss/vite`.
- `src/server.ts`, `src/start.ts` — deleted (TanStack Start SSR runtime, no longer needed).
- `src/main.tsx` — created with `createRoot` + `RouterProvider` + `QueryClientProvider`.
- `src/routes/__root.tsx` — removed the `shellComponent` so the app doesn't render its own `<html>` shell (which would conflict with the SPA shell).
- `index.html` — written with `<div id="root">` and a `/src/main.tsx` script tag.

The router, components, configs, and assets are untouched.

## Verifying

```bash
python3 /tmp/verify_iframes.py            # 20/20 should pass
python3 /tmp/verify_interactivity.py     # opens entry animations
```

## When you edit a template

1. Edit the template as usual (config, components, styles).
2. Run `cd <template> && npm run build`.
3. Copy the build output into the landing page's `public/templates/<template-folder>/`:
   - For Vite: copy `dist/` over.
   - For TanStack: re-run the SPA conversion (`/tmp/convert_to_spa.py`) then copy.
4. Re-run the routing fix (`/tmp/fix_router_paths.py` and `/tmp/fix_tanstack_routing.py`).
5. Refresh the landing page in the browser.

## Deployment

```bash
cd 00-landing
npm run build
```

The `dist/` output contains everything — the landing page UI + the 20 template previews under `templates/<folder>/index.html`. Drag `dist/` into Netlify Drop.

When the user clicks **Open ↗** on a card, it opens that template's iframe URL in a new tab. From the user's perspective it looks like the customer invite — same animations, same footer.