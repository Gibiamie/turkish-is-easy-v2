# V2 Deployment

The repository contains a GitHub Pages workflow that builds the static V2 PWA after pushes to `main`. Before the first release, enable **Pages → GitHub Actions** in the repository settings. The first successful `Deploy V2 PWA to GitHub Pages` workflow will expose the generated Pages URL in its deployment environment.

The deployment workflow runs the production bundle build. The independent CI workflow separately runs the production build, content/asset QA, and all regressions. A Pages deployment must not be treated as approval for an assessment provider, user-data collection, or any server-side feature.
