import { PostHog } from "posthog-node";

const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST;
const isProduction = process.env.NODE_ENV === "production";

function requireConfiguration(name, value) {
  if (!value && !isProduction) {
    throw new Error(
      `${name} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${name} is configured`
    );
  }
}

requireConfiguration("POSTHOG_API_KEY", apiKey);
requireConfiguration("POSTHOG_HOST", host);

export const posthog = apiKey && host
  ? new PostHog(apiKey, { host, enableExceptionAutocapture: true })
  : null;
