# rpg
RPG Game Prototype

A React + TypeScript app built with Vite, deployed to GitHub Pages.

## Stack

- **React + TypeScript** via Vite
- **Cucumber.js** for testing business logic use cases (BDD, `features/`)
- **GitHub Actions** deploys `main` to GitHub Pages via `.github/workflows/deploy.yml`

## Development

```bash
npm install
npm run dev          # start dev server
npm run typecheck    # type-check
npm run test:cucumber  # run Cucumber feature tests
npm run build         # production build to dist/
```

## Adding business logic use cases

1. Write a feature in `features/*.feature` describing the use case in Gherkin.
2. Implement step definitions in `features/step_definitions/*.steps.ts`, calling into the logic under `src/logic/`.
3. Implement/adjust the logic in `src/logic/` until the scenarios pass.

## Deployment

Pushing to `main` builds the app and publishes `dist/` to GitHub Pages via GitHub Actions.
One-time setup: in the repo's **Settings → Pages**, set the source to **GitHub Actions**.
