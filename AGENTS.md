# AGENTS.md

Instagram Simple Downloader: a browser extension (Manifest V2, Firefox and Chrome) that adds download and copy-link buttons to Instagram posts, stories and reels. Plain JavaScript with no bundler; `GEMINI.md` has the longer architecture notes.

## Stack
- Vanilla JavaScript (ES6+), HTML, CSS injected from JS. No build step: source files load directly.
- pnpm 9.1.0 (`packageManager`), ESLint 10 (flat config in `eslint.config.mjs`), Playwright for end-to-end tests, nyc for coverage.

## Commands
- Install: `pnpm install`
- Lint: `pnpm run lint`
- Tests: `pnpm run test` (runs `playwright install`, then `playwright test`)
- Coverage: `pnpm run coverage` (nyc over `*.js`, `tests/` excluded)

## Structure
- `manifest.json`: extension manifest (MV2)
- `background.js`, `background-utils.js`: background page logic and helpers
- `observer.js`: main observer logic (watches the DOM for posts and media)
- `ui.js`, `ui-base.js`: UI components and button injection (`ISD_UI` namespace)
- `utils.js`: shared utilities and constants (`ISD_UTILS` namespace)
- `aperture.js`: visual layer (glass dock, ring progress, spring animations), loaded after `utils.js`
- `tests/`: Playwright specs, one per behavior (`*.spec.js`), plus `test-helper.js`
- `.github/workflows/`: `validate.yml` (reusable from `juninmd/base-actions`), `sast.yml`, `security.yml`, `release-drafter.yml`

## Conventions
- Keep each file at or under 150 lines. Largest today: `observer.js` (150).
- Split logic into small, testable units with single responsibilities (Clean Code, SRP).
- Target 100% test coverage. nyc is configured with `all: true` but sets no threshold, so check the `coverage` report yourself.
- Use `pnpm`, not npm or yarn.
- Injected buttons must stay visually consistent with Instagram's UI (pixel-level), and must keep keyboard focus styles.
- Automate testing and packaging. No packaging script exists yet.

## Gotchas
- Inline styles fail accessibility checks (no `:focus-visible`); inject a scoped `<style>` block instead (see `.Jules/palette.md`).
- Default red and green fail contrast with white text; use the darker shades noted in `.Jules/palette.md`.
- The `test` script installs Playwright browsers on every run, so the first run is slow.
- `.Jules/palette.md` is an agent-generated notes file. It is not referenced by code. Do not extend it without owner review.

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.
