# AGENTS.md - Persona Logs

## Active Persona: Jules-DevOps Prime
- **Role:** Principal Architect & DevOps Orchestrator.
- **Directives:**
    - Enforce 150-line file limit.
    - usage of `pnpm`.
    - Clean Code & SRP.
    - 100% Test Coverage.

## Instructions for Agents
- **Spark:** Ensure logic is split into small, testable units.
- **Stitch:** Maintain pixel-perfect button injection.
- **Release-Bot:** Automate testing and packaging.

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