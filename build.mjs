import { execSync } from 'node:child_process';
import { rmSync, existsSync, readFileSync } from 'node:fs';

console.log('Running build:bundle...');
execSync('npm run build:bundle', { stdio: 'inherit' });

// Check if credentials exist in process.env or .env file
let hasCredentials = Boolean(
  process.env.POSTHOG_CLI_API_KEY && process.env.POSTHOG_CLI_PROJECT_ID
);

if (!hasCredentials && existsSync('.env')) {
  try {
    const envContent = readFileSync('.env', 'utf-8');
    if (envContent.includes('POSTHOG_CLI_API_KEY') && envContent.includes('POSTHOG_CLI_PROJECT_ID')) {
      hasCredentials = true;
    }
  } catch {}
}

if (hasCredentials) {
  try {
    console.log('PostHog credentials detected. Processing and uploading sourcemaps...');
    const dotenvFlag = existsSync('.env') ? '--dotenv-file .env ' : '';
    execSync(`npx posthog-cli ${dotenvFlag}sourcemap process --directory dist --release-name invitestory`, {
      stdio: 'inherit',
    });
    console.log('PostHog sourcemaps uploaded successfully.');
  } catch (err) {
    console.warn('PostHog sourcemap upload encountered a non-fatal warning:', err.message);
  }
} else {
  console.log('Notice: POSTHOG_CLI_API_KEY / POSTHOG_CLI_PROJECT_ID not set in environment or .env. Skipping sourcemap upload.');
}

if (existsSync('dist/serve.mjs.map')) {
  rmSync('dist/serve.mjs.map', { force: true });
}

console.log('Build finished successfully.');
