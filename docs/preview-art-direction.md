# Invitation preview art direction

Implemented locally on 7 October 2026.

Each of the 35 catalogue designs has a manually selected palette based on its cover artwork. The shared viewer inherits its stage, panel, text, action, border and highlight colors. Paper, botanical, festive, illustrated and cinematic families provide restrained typography and trim differences while controls keep the same positions.

The palette follows artwork changes, including the four Dearly palette controls, and carries into the selected design’s booking review. Package-only booking resets to the neutral site palette. The catalogue itself keeps its browsing design.

Theming includes preview navigation, active collection tabs, saved state, loading/retry poster, exploration tools, FAQ, focus outlines and booking review. Color changes transition for 240ms; reduced-motion users receive immediate changes. Text and primary-action foregrounds meet a calculated 4.5:1 contrast minimum against their defined surfaces across every palette.

Verified in the browser: Magnolia mobile preview, Camellia palette switch and matching booking review, Something Blue preview and FAQ, 1440px desktop layout, Midnight Stargaze dark review, and a 320px phone layout without page-level horizontal overflow. Existing remote demos remain unchanged. These are browser checks, not physical-device certification.

Validation: 13 automated checks pass, including coverage/contrast for all 35 palettes and switching/resetting booking palettes. JavaScript syntax and diff whitespace checks passed.

Implementation: `preview-themes.js`, `preview-themes.css`, and integration hooks in `scripts.js` and `sales.js`. The existing invitation demos and pricing logic are retained.
