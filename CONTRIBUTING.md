# Contributing

Contributions are welcome — bug fixes, new languages, UI improvements, or new features.

## Getting started

```bash
git clone https://github.com/your-username/wishlist-app
cd wishlist-app
npm install
```

Start the dev environment (two terminals):

```bash
php -S localhost:8080 -t .   # terminal 1
npm run dev                  # terminal 2
```

Reset test data at any time:

```bash
npm run clean
```

## Before opening a pull request

- **Tests must pass** — `npm run test:run`
- **New behaviour should have tests** — stores, composables, and components all have test coverage under `src/__tests__/`
- **Keep PHP dependency-free** — no Composer, no frameworks; the backend must run on plain shared hosting
- **Keep the frontend lean** — avoid adding heavy dependencies; the app is intentionally simple

## Adding a language

See the *Adding a language* section in [README.md](README.md). Please open a PR with both the translation file and the flag added to `LOCALE_FLAGS`.

## Reporting a bug

Open an issue with:
- Steps to reproduce
- Expected vs actual behaviour
- PHP version and server type if it's a backend issue

## Code style

- Vue components use `<script setup>` and the Composition API
- PHP files use strict types where possible and no global state outside `helpers.php`
- No comments that just restate what the code does — only explain *why* when it's non-obvious
