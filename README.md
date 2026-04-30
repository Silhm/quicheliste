# 🎁 Wishlist

A self-hosted wishlist app for family and friends. Create gift wishlists, share them with a link, and let people reserve items without spoiling the surprise.

## Features

- **No passwords** — each user gets a personal access link to bookmark
- **Wishlists** — create multiple lists with items grouped by category
- **Gift items** — name, price, link, description, image preview (via Open Graph)
- **Share links** — shareable read-only URL per wishlist; no account needed to view
- **Reservations** — friends reserve items anonymously; the wishlist owner never sees who reserved what
- **Admin panel** — recover anyone's access link without a password reset flow
- **Multilingual** — English and French built-in, easy to extend
- **Zero infrastructure** — PHP 8+ and flat JSON files, no database required

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Vue 3, Vite, Pinia, Vue Router, vue-i18n |
| Styling | Tailwind CSS |
| Backend | PHP 8+ (no framework) |
| Storage | JSON files |
| Tests | Vitest, @vue/test-utils |

## Requirements

- **Node.js** 18+ (frontend build)
- **PHP** 8.0+ (backend, with `file_get_contents` enabled)
- A web server with `.htaccess` / `mod_rewrite` support (Apache or compatible)

## Local development

```bash
# 1. Install JS dependencies
npm install

# 2. Start the PHP dev server (terminal 1)
php -S localhost:8080 -t .

# 3. Start the Vite dev server (terminal 2)
npm run dev
# → http://localhost:5173
```

Vite proxies all `/api/*` requests to the PHP server automatically.

> **First run:** visit the app, enter your name — the first registered user becomes admin automatically.

## Deployment (FTP / shared hosting)

```bash
# Run tests then build + prepare the deploy folder
npm run deploy
```

Upload the contents of the generated `deploy/` folder to your server webroot:

```
public_html/
├── index.html       ← from deploy/
├── assets/          ← from deploy/assets/
├── api/             ← PHP API files
├── data/            ← JSON storage (auto-protected from direct access)
└── .htaccess
```

> **First deploy:** upload the `data/` folder too (creates the empty structure).  
> **Updates:** skip `data/` — it contains your live users and wishlists.

### Subdirectory install

If the app lives at `yoursite.com/wishlist/` rather than the root:

1. Add `base: '/wishlist/'` to `vite.config.js`
2. Add `RewriteBase /wishlist/` near the top of `.htaccess`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build frontend to `dist/` |
| `npm run deploy` | Run tests, build, and prepare `deploy/` folder |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run coverage` | Run tests with coverage report |
| `npm run clean` | Reset all data (users + wishlists) for a clean slate |

## Project structure

```
├── api/                  PHP REST API
│   ├── config.php        Data path config
│   ├── helpers.php       Shared utilities (auth, JSON I/O)
│   ├── auth.php          POST  /api/auth.php       — register
│   ├── me.php            GET   /api/me.php          — current user
│   ├── users.php         GET   /api/users.php       — all users (admin)
│   ├── wishlists.php     GET   /api/wishlists.php   — list + create
│   ├── wishlist.php      GET/PUT/DELETE             — single wishlist
│   ├── items.php         POST  /api/items.php       — add item
│   ├── item.php          PUT/DELETE                 — update/delete item
│   ├── share.php         GET   /api/share.php       — public wishlist view
│   ├── reserve.php       POST  /api/reserve.php     — reserve an item
│   └── preview.php       GET   /api/preview.php     — og:image scraper
├── data/
│   ├── users.json        All registered users (with tokens)
│   └── wishlists/        One JSON file per wishlist
├── src/
│   ├── api/              Axios instance
│   ├── composables/      usePreview (og:image cache)
│   ├── i18n/             en.js, fr.js translations
│   ├── router/           Vue Router + navigation guard
│   ├── stores/           Pinia stores (auth, wishlists)
│   ├── views/            Register, Home, WishlistDetail, ShareView, Admin
│   ├── components/       NavBar, ItemModal
│   └── __tests__/        Vitest test suites
├── deploy.mjs            Deploy script
├── clean.mjs             Data reset script
└── .htaccess             SPA routing + data protection
```

## Data storage

Everything is stored as JSON files in `data/`. No database setup is required.

- `data/users.json` — array of user objects (id, name, token, is_admin)
- `data/wishlists/{id}.json` — one file per wishlist, contains all items inline

The `data/` directory is blocked from direct HTTP access via `.htaccess`.

> **Admin tip:** if a family member loses their access link, open `data/users.json`, find their entry, copy the `token` field, and send them `https://yoursite.com/?token=<token>`.

## Adding a language

1. Create `src/i18n/{locale}.js` by copying `src/i18n/en.js` and translating the values
2. Add the locale to `src/i18n/index.js`:
   ```js
   import de from './de'
   // add 'de' to LOCALES array and messages object
   ```
3. Add the flag emoji to `LOCALE_FLAGS`:
   ```js
   export const LOCALE_FLAGS = { fr: '🇫🇷', en: '🇬🇧', de: '🇩🇪' }
   ```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Simon Florentin

## Vibe coded

Built entirely through pair programming with [Claude](https://claude.ai).
