# AGENTS.md

Instructions for AI coding agents working on this repository. Human contributors, please read the [contribution guidelines](.github/CONTRIBUTING.md), which also apply to agents.

## Project

ThirdStats is a Thunderbird add-on (MailExtension) for visualized email account stats, built with Vue 3, Vite and Chart.js.

- `src/` contains the three entry points `Popup.vue`, `Stats.vue` and `Options.vue` and the background script `background.js`
- `src/engines/` contains the stats processing logic, `src/composables/` the data preparation for charts and pages
- `src/ui/` contains generic UI components (prefixed `Ts`), `src/options/`, `src/sections/`, `src/charts/` and `src/parts/` contain feature components
- `public/_locales/<code>/messages.json` contains the translations, `public/manifest.json` the add-on manifest
- `test/` contains the Vitest tests, mirroring the structure of `src/`

Thunderbird WebExtension APIs (`messenger.*`) are not available in the browser dev server, test those changes with a production build loaded as a temporary add-on in Thunderbird.

## Commands

- `pnpm install` to install dependencies
- `pnpm dev` to start the dev server, `pnpm build` to create a production build in `dist/`
- `pnpm lint` to lint (fix all warnings, CI treats them as errors)
- `pnpm format` to format code
- `pnpm test` to run the tests

Run `pnpm lint`, `pnpm format` and `pnpm test` before considering a change done.

## Conventions

- Keep changes small and focused on the issue, no unrelated refactoring or drive-by "improvements"
- Follow the existing architecture and code style, don't add dependencies without asking the maintainer
- Use the Composition API with `<script setup>`, PascalCase for component imports and dash-case in templates
- Use tabs for indentation, `const` over `let`, destructuring and template literals where reasonable
- Keep comments short, starting with a capital letter, breaking only at 120 characters
- Add or extend tests in `test/` for new or changed logic
- Add new translation keys to `public/_locales/en/messages.json`, other languages are updated by translators
- When adding a permission, update `public/manifest.json`, the README and `SECURITY.md`

## Commits and pull requests

Start commit messages with one of the emojis listed in the [contribution guidelines](.github/CONTRIBUTING.md#git-commit-messages), use the imperative mood and limit the first line to 72 characters. Pull requests must reference a previously discussed issue and fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md), including the disclosure of how much was AI generated.
