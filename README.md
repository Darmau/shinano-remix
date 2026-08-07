# Firewood (Shinano Remix)

Firewood — also published under its Chinese name “积薪” — is a highly opinionated personal blog that highlights long‑form essays, photo essays, reading notes, and short “thought” snippets. Content is modeled and published from [shinano-cms](https://github.com/darmau-co/shinano-cms), a SvelteKit admin that writes to Supabase. This repository is the Remix front end that serves the public site from Cloudflare Pages/Workers, with Tailwind-driven UI and a heavy emphasis on multilingual publishing (Chinese, English, and Japanese).

The project is intentionally bespoke: it mirrors my own writing workflow, integrates tightly with my media storage, and is not meant to be a generic starter.

## Highlights

- **Multilingual everywhere** – Every route under `app/routes/$lang.*` reads locale strings from `app/locales`, generates `hreflang` tags, and exposes zh/en/jp versions of pages, feeds, and sitemaps.
- **Multiple content streams** – Long-form articles, photography albums (with EXIF + Mapbox maps), micro “thoughts”, RSS exports, and a public reading log live side by side while sharing Supabase as the data source.
- **Rich reader experience** – Article pages ship a live reading progress bar, table of contents, next/previous navigation, and paginated comments guarded by Cloudflare Turnstile. Photo albums render lightbox galleries, shooting metadata, and location pins.
- **Membership & messaging** – Visitors authenticate via passwordless email magic links or GitHub OAuth, leave comments as guests or authenticated users, and send private messages through the contact form once logged in.
- **Edge-first architecture** – Remix renders on Cloudflare Pages, Supabase SSR clients are created per request, media is served from object storage via `IMG_PREFIX` (Cloudflare Images/R2), and auxiliary tasks (notifications, AI utilities, uploads) are handled by Workers described on `/site`.
- **Syndication & SEO** – Per-language RSS feeds for articles, photo albums, and thoughts (`app/routes/$lang.*.[rss.xml].tsx`), sitemap indexes, and structured meta tags keep the content crawlable.

## Content & Pages

- **Articles** (`app/routes/$lang.article.$slug.tsx`): long-form writing with featured images, topics, reading progress, table of contents (`<Catalog />`), Supabase RPC-backed view counters, comment threads, and adjacent post navigation.
- **Thoughts** (`$lang.thoughts.tsx`): lightweight JSON-based micro posts with infinite “load more” pagination and optional inline imagery.
- **Photography albums** (`$lang.album.$slug.tsx`): gallery/lightbox experience powered by Yet Another React Lightbox, EXIF overlays, Mapbox maps, and location badges. Comments, page views, and tagging mirror the article experience.
- **Bookshelf** (`$lang.book._index.tsx`): a reading journal listing ratings, capsule reviews, and outbound links, pulled from Supabase and paginated via fetcher actions.
- **Meta pages** (`$lang.about.tsx`, `$lang.site.tsx`, `$lang.contact.tsx`): showcase biography content, explain the tech stack, and provide a logged-in contact form that stores submissions in Supabase.
- **Authentication flows** (`$lang.login.tsx`, `auth.callback.tsx`, `auth.confirm.tsx`): passwordless email magic links and GitHub OAuth built on Supabase Auth with tasteful UI components (`EmailLogin`, `GithubLogin`).

## Architecture

1. **shinano-cms**: A dedicated CMS (SvelteKit + Supabase) is used to create content, trigger AI helpers (for translations, summaries, alt text, and slugs), and manage media uploads. The CMS and blog are fully decoupled.
2. **Supabase**: Acts as the primary database, storage metadata layer, and auth provider. The Remix loaders create SSR clients (`app/utils/supabase/server.ts`) to query typed relations and invoke RPC helpers such as `article_page_view`.
3. **Cloudflare stack**: Remix runs on Cloudflare Pages with a Workers-based adapter (`functions/[[path]].ts`). Edge bindings expose environment variables for Supabase credentials, Mapbox tokens, Cloudflare Turnstile keys, Bark server endpoints, and image CDN prefixes.
4. **Media & maps**: Images are stored in object storage and served through Cloudflare Image Resizing using `IMG_PREFIX`, while Mapbox tokens unlock per-photo maps and EXIF visualizations.
5. **Comments & anti-abuse**: `CommentEditor` enforces Turnstile challenges for anonymous visitors and supports threaded replies/pagination. Authenticated submissions inherit Supabase session context.

## Tech Stack & Integrations

- Remix (SSR) + Vite + TypeScript
- Cloudflare Pages/Workers, Wrangler, and Pages Functions
- Tailwind CSS with custom components and Heroicons
- Supabase (Postgres, Auth, Edge Functions/RPC)
- shinano-cms (authoring), Tiptap editor, and OpenAI-powered utilities (as described on `/site`)
- Mapbox GL for location-aware photography
- Cloudflare Turnstile for form protection
- Resend + Bark notifications for transactional messaging

## Running the Site Locally

Even though this repository is tailored for my deployment, you can boot it for exploration:

```sh
pnpm install
pnpm dev          # starts remix vite:dev on Cloudflare Pages adapter
pnpm build        # creates the /build artifacts for Pages
pnpm start        # runs wrangler pages dev ./build/client
```

Required environment variables live in your Cloudflare project (and `.dev.vars` when emulating locally):

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Connect Remix loaders/actions to the shinano-cms Supabase instance |
| `IMG_PREFIX` | Base URL for object storage / Cloudflare Image delivery |
| `BASE_URL` | Canonical site origin used in meta tags, RSS, and sitemaps |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile validation for comments/contact |
| `MAPBOX_TOKEN` | Mapbox GL token for album maps & EXIF visualizations |

Because Firewood is tightly coupled to my Supabase schema and CMS workflows, adapting it requires mirroring that data model. The `/site` route (and `app/locales/site.tsx`) documents the reasoning, architecture choices, and trade-offs if you’re curious about the broader system.

---

If you’re mostly after the CMS experience, visit **shinano-cms**; if you’re here to read, [firewood (积薪)](https://darmau.co) is the canonical deployment powered by this codebase.
