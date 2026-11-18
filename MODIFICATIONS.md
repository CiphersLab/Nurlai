# Modifications

This repository is a fork of **Rakazo** (`https://github.com/elie222/rakazo`),
licensed under the Apache License, Version 2.0. Ciphers Lab maintains this fork
and distributes it under the **Nurlai** brand.

Upstream copyright, the `LICENSE` file and the `NOTICE` file are retained
unmodified. The upstream project's third-party attributions (including the MIT
notice from Nous Research) remain in `NOTICE` and ship with the product.

Nurlai is not affiliated with, endorsed by, or sponsored by the Rakazo project.
"Rakazo" is used only to describe the origin of this work.

## 2026-11-18: Rebrand pass 1 (visible branding)

- Replaced the standalone display name `Rakazo` with `Nurlai` across web,
  desktop, mobile, shared UI copy and their translation catalogs (1,388
  occurrences in 180 files).
- Updated the web `<title>`, PWA title, Electron `productName` and author, and
  the Expo app name.
- Renamed the shared app icon bundle from `Rakazo.icon` to `Nurlai.icon` and
  updated every reference, including CI artifact paths.
- Left internal identifiers unchanged in that pass; they moved in pass 2 below.

## 2026-11-18: Rebrand pass 2 (internal identifiers)

- Renamed the workspace package scope from `@rakazo/*` to `@nurlai/*` across
  package manifests, imports, Turbo filters and scripts, and regenerated
  `pnpm-lock.yaml` (6,833 occurrences).
- Renamed the environment prefix from `RAKAZO_*` to `NURLAI_*` across the API,
  web, desktop, mobile, worker, compose files, installer scripts, CI workflows
  and documentation (2,067 occurrences).
- Pointed product domains at Nurlai: `rakazo.com` to `nurlai.cipherslab.com`
  and `app.rakazo.com` to `app.nurlai.cipherslab.com`.
- Renamed bundle identifiers and native namespaces from `com.rakazo.*` to
  `com.nurlai.*`, the Docker computer image from `rakazo/computer` to
  `nurlai/computer`, the database role from `rakazo_app` to `nurlai_app`, and
  the development container from `rakazo-dev-postgres` to
  `nurlai-dev-postgres`.
- Renamed request headers from `x-rakazo-*` to `x-nurlai-*`, the desktop and
  screen renderer bridges from `rakazoDesktop`/`rakazoScreen` to
  `nurlaiDesktop`/`nurlaiScreen`, and the session cookie key to
  `nurlai.session_token`.
- Changed the Expo slug and scheme to `nurlai`.
- Completed the display-name rename outside the first pass's scope (API,
  packages, docs, infrastructure, marketing site, tests).

Still on the old prefix on purpose, because they need platform builds to
verify: native module folders and file names (`apps/mobile/modules/rakazo-*`,
`Rakazo*.swift`, `Rakazo*.kt`), systemd unit and sandbox script file names,
Docker service names, and local storage keys other than the session cookie.

### Re-applying after an upstream merge

The rename is automated so it can be replayed on top of new upstream releases.
Run both passes in order:

```
node scripts/rebrand/brand.mjs --check        # display name, dry run
node scripts/rebrand/brand.mjs --write
node scripts/rebrand/identifiers.mjs --check  # scopes, env, domains, ids
node scripts/rebrand/identifiers.mjs --write
```

`LICENSE`, `NOTICE` and `CHANGELOG.md` are excluded from both codemods by
design. `identifiers.mjs` also protects native file references such as
`RakazoNotificationService.kt` so a rename cannot point at a file that does not
exist.
