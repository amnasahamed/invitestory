import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

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

const posthogLogProvider = apiKey && host
  ? new LoggerProvider({
      resource: resourceFromAttributes({
        "service.name": "invitestory-node-server",
        "deployment.environment": process.env.NODE_ENV || "development",
      }),
      processors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: `${host.replace(/\/$/, "")}/i/v1/logs`,
            headers: { Authorization: `Bearer ${apiKey}` },
          })
        ),
      ],
    })
  : null;

// This provider is intentionally not registered globally: only log records emitted
// through this dedicated logger are sent to PostHog.
export const posthogLogger = posthogLogProvider?.getLogger("invitestory-posthog-logs") || null;

export async function flushPostHogLogs() {
  await posthogLogProvider?.forceFlush();
}
