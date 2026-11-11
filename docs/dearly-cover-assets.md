# Dearly catalogue covers

The website's `dearly` directory is an optional Git submodule. A normal checkout
can leave it empty. Catalogue cards previously referenced images inside that
directory, so deploying without initializing the submodule removed their covers.

All four commercial cover images are now ordinary files committed under
`assets/preview/dearly-{magnolia,camellia,iris,dahlia}.webp`. The catalogue,
homepage Dearly section, collection landing page and social-image metadata use
these files. Thumbnail delivery requires neither the submodule nor a request to
the invitation demo host. Full interactive Dearly previews continue to use
their existing hosted demo URLs.

The source covers were recovered on 11 November 2026 from each existing
`https://dearly-{magnolia,camellia,iris,dahlia}.invitestory.in/assets/envelope-first.webp`,
then resized to 780 px wide and encoded as WebP. These downloaded covers are
production assets, not files to be fetched at build time.

`tests/local-previews.test.mjs` checks that every catalogue cover is in normal
repository assets and exists, including when the Dearly submodule is empty.
`tools/check-dearly-covers.cjs` verifies the four actual rendered images on the
catalogue and collection page at mobile and desktop widths.

Production version for this fix: `62319949-3288-466e-9381-aa95a5724db0`.
Live checks passed at 390 px and 1440 px widths on both `/` and `/dearly`.
