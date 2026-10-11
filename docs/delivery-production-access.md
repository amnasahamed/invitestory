# Cloud production verification: access evidence

Checked from the cloud workspace only. No secrets were printed, no user computer was used, no restrictions were bypassed and no account/configuration changes were made. No publication occurred.

## Routes actually checked and outcomes

| Access route | Outcome | What it establishes |
| --- | --- | --- |
| Git HTTPS `ls-remote` for all three repositories | Succeeded; main remains website `50a1dae241971030772a50fdb9e0a2025258e1b8`, staff `d46fb571396c886a164e89a1f983dc8e1a706f88`, Dearly `8422091867db8952f31e9571552e39c5642ea6aa` | Repository source heads only, not deployed versions |
| Authenticated GitHub connector repository lookup | Succeeded; website reports main and push/admin permissions | Repository access, not provider access |
| GitHub connector combined status for those commits | Website has successful Vercel status; staff and Dearly status lists empty | A Vercel build reference exists; no proof of production domain assignment |
| GitHub connector commit workflow runs | All three return empty lists | This tool filters pull-request-triggered runs and only returns first page; cannot rule out push workflows or provider builds |
| Local `.github` workflow search | No workflow files found in checked repositories | Does not rule out provider-managed Git integration or automatic deployments |
| `gh api` reads for repository/check runs/status/workflows/deployments | Proxy returned Forbidden; deployments endpoint rechecked with same result | No deployment metadata was obtained via CLI |
| Existing Wrangler `whoami` | Reports unauthenticated; repeated in this turn | No authenticated Cloudflare account/deployment inspection possible. Separate missing log-directory warning does not explain away authentication failure |
| Available connector tool discovery | No customer Cloudflare account or Vercel deployment tools exposed; unrelated Sites tools excluded | No alternate authorized provider route found |
| Direct read-only live HTTP checks (website config, staff origin, Dearly page) | Tunnel connection failed: 403 Forbidden | Cannot confirm live capabilities or source equivalence |
| Web tool fallback | Config/staff inaccessible; Dearly returned previously crawled content | Cached content is not current production verification |

Website Vercel status target:
https://vercel.com/amnaskt05-9950s-projects/00-landing/6hZxyi4BVcRHt9W88HqqJdDwv1wE

## Configured targets versus verified targets

Checked-in Wrangler files name Cloudflare Worker `invitestorywebsite` with custom domains `invitestory.in` and `www.invitestory.in`; staff names Worker `accounts-portal` for `staff.invitestory.in`. Both point to the same configured account and use `keep_vars: true`. These are candidate targets, not proof of active production ownership or versions. Website configuration points checkout at `https://staff.invitestory.in`.

GitHub status identifies a Vercel project/build link. It does not establish whether that deployment serves the production domains, whether Cloudflare proxies or serves assets, which branches auto-deploy, or which version is safe to restore. A Git commit SHA is not a verified Cloudflare rollback version ID.

## Evidence still required before any push

Use authenticated read-only access to the existing production provider accounts to verify:

1. Actual production domain ownership/routing and which provider/project/Worker serves each component.
2. Active deployment/version IDs and their source/build equivalence, including the Dearly submodule commit.
3. Git integration branches, build commands, automatic deployment triggers and whether even a branch push can publish.
4. Effective checkout configuration and activation flag value; correct account/environment for a later flag change.
5. Exact available rollback version IDs and their contract compatibility. After any v2 attempt exists, rollback must retain v2 readers/reconciliation, immutable selections and idempotency records.

Cloudflare account access is required for Worker routes, active versions, bindings/variables and retained rollback versions if Cloudflare serves these targets. Vercel account access is also required if it owns any active production path or automatic build. GitHub metadata can help correlate source, but currently cannot prove these facts. Existing account access must be restored securely; do not paste credentials into chat or create replacement infrastructure.

## Separate cloud-browser investigation update

The coordinating thread independently confirmed the same three remote main heads and parent Dearly pin, found no GitHub Actions in website/staff and no separate Dearly deployment configuration. Its cloud-browser reviewer reached the Cloudflare login page; the user selected Google and identity confirmation is pending. This is not yet authenticated production version/route/config evidence. This implementation task did not initiate a parallel login. Publication remains gated until that investigation supplies verified provider evidence.
