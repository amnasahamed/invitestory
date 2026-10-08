# PostHog Error Tracking

## What you still need to do

1. Configure the external production service that actually builds and runs the Node server. Its build command must be `npm run build`; the checked-in Wrangler and Vercel paths currently deploy a Worker/static site and do not run this Node build.
2. Add the existing PostHog personal API key to that provider's masked/secret build environment as `POSTHOG_CLI_API_KEY`. Also provide `POSTHOG_CLI_PROJECT_ID` and `POSTHOG_CLI_HOST` under those exact names. The local credentials are already configured in `.env`; do not commit them.
3. Ensure the external build runs from a Git checkout, or supplies the provider's Git commit/branch/repository variables, so the `invitestory` release receives a resolvable release version. At runtime, provide `POSTHOG_API_KEY` and `POSTHOG_HOST` to the service launching `dist/serve.mjs`.

## What is working now

The Node server's PostHog singleton enables SDK exception autocapture in `posthog.js`, covering uncaught exceptions and unhandled promise rejections. Errors caught by the server's centralized top-level request boundary are sent with `posthog.captureException(err)` and flushed before the 500 response in `serve.mjs`. No duplicate process-level listeners were added.

The project now includes and initializes the PostHog Node SDK as part of this setup, and the source-map upload tooling is installed. The relevant capture behavior is carried by `posthog.js` and `serve.mjs`.

## Source maps

Source-map upload is wired into the production build. Changed files are:

- `package.json`
- `package-lock.json`
- `serve.mjs`
- `.gitignore`

Run this exact production build command:

```sh
npm run build
```

Every production build using that command bundles `serve.mjs`, generates external source maps, processes them with `posthog-cli`, uploads them using `POSTHOG_CLI_API_KEY`, `POSTHOG_CLI_PROJECT_ID`, and `POSTHOG_CLI_HOST`, and removes the served map file from `dist/`. The build was wired, but it was not executed during setup. No checked-in CI pipeline currently invokes it.

## Verify in PostHog

Trigger any server error, then open [Error Tracking](https://us.posthog.com/project/652540/error_tracking). Uploaded symbol sets appear at [Error Tracking configuration](https://us.posthog.com/project/652540/error_tracking/configuration).
