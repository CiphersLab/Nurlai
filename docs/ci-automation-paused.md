# CI automation paused in this fork

The scheduled and main-branch automation below is **turned off in this fork for now**. Each run
that failed sent the maintainer an email for work this fork cannot act on: several jobs need
secrets only the canonical repository has, and the dependency audit fails on the hosted runners
while it passes on a local machine (see [Open before re-enabling](#open-before-re-enabling)).

Nothing was deleted. Each workflow keeps its file, its jobs and its manual `workflow_dispatch`
trigger, so any paused run can still be started by hand from the Actions tab. Only the `on:`
entry that starts it on its own was commented out, with a pointer to this file.

## What is paused

| Workflow | Trigger that was removed | Why it was noisy |
| --- | --- | --- |
| `.github/workflows/nightly-verification.yml` | daily `schedule` | Runs the web screenshot and performance suites nightly; failures have no owner in this fork yet. |
| `.github/workflows/dependency-security.yml` | nightly `schedule` and `push` to `main` | The audit job exits 1 on the hosted runners even though `pnpm audit --audit-level high` plus `scripts/checks/dependency-audit.mjs` pass on a local checkout of the same lockfile. |
| `.github/workflows/model-catalog-bump.yml` | weekly `schedule` | Opens its pull request with `GH_DEPENDENCY_UPDATES_PAT`; without that secret it now reports a notice and skips, so the weekly run only adds noise. |
| `.github/workflows/weekly-dependencies.yml` | weekly `schedule` | Needs the Codex subscription secret to raise its update pull request. |
| `.github/workflows/exploratory-qa.yml` | weekly `schedule` | Needs `EXPLORATORY_AGENT_ENABLED` plus model secrets and spends real money. |
| `.github/workflows/preview-cleanup.yml` | daily `schedule` | Needs the Fly preview token for a sweep this fork never creates previews for. |
| `.github/workflows/security.yml` | daily `schedule` | Scheduled CodeQL repeat of the runs that already happen on every push and pull request. |

Push and pull-request checks are **not** paused: `ci.yml`, the test suites, CodeQL on push, and
the image workflows still run as before. The screenshot and catalog bot workflows keep their
push trigger, but they now exit with a notice when the repository has no dependency PAT instead
of failing (see `GH_DEPENDENCY_UPDATES_PAT` below).

## How to re-enable

For each workflow you want back, uncomment the `on:` entry that the marker comment points at:

```yaml
on:
  # Paused while this fork's automation is off; see docs/ci-automation-paused.md.
  # schedule:
  #   - cron: "23 2 * * *"
  workflow_dispatch:
```

Then remove that marker comment and the workflow runs on its cron again. Nothing else changed,
so the process is the same for every file in the table above. To check one run first, start it
from the Actions tab with **Run workflow** before restoring the schedule.

## Open before re-enabling

- **Dependency audit.** `dependency-security.yml` fails on GitHub's runners while the same
  commands pass locally. Open the failed job's log, then either fix the cause or (if it is a
  known advisory) add it to the audit configuration the workflow's header points at. Its
  `pull_request` trigger is still enabled, so a pull request that changes the lockfile still
  gets audited.
- **`GH_DEPENDENCY_UPDATES_PAT`.** The model catalog and translation catalog workflows open
  their pull requests with this secret, which is not configured here. Without it they skip
  instead of failing, so the catalog pull requests stay unopened until it is added.
- **Nightly verification secrets.** `nightly-verification.yml` passes `S3_ACCESS_KEY_ID` and
  `S3_SECRET_ACCESS_KEY` to the screenshot workflow, and the performance scorecard needs its
  runner lines re-based for this fork.
- **Bot pull requests need a PAT, not `GITHUB_TOKEN`.** A branch pushed with the workflow token
  does not start CI, which is why both catalog workflows ask for a personal access token.

## Related

- `.github/workflows/translation-catalogs.yml` and `.github/workflows/model-catalog-bump.yml`
  contain the missing-secret guard that keeps a fork quiet on push.
- `MODIFICATIONS.md` records what this fork changes from upstream; this pause belongs with it
  until the automation is turned back on.
