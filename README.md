# MUSUBI 2026

The website for MUSUBI 2026 and the Japanese Club of D. S. Senanayake College.

The site is built with Astro, Tailwind CSS, React, and a small set of shadcn components. Most pages are rendered as static HTML. React is available for future interactive features without adding unnecessary browser JavaScript today.

## Local development

Install the dependencies and start Astro:

```sh
nvm use
npm install
npm run dev -- --host 127.0.0.1 --port 4321
```

The site is available at `http://localhost:4321`.

The current TryCloudflare hostname is allow-listed in `astro.config.mjs`. In a second terminal, run:

```sh
cloudflared tunnel --protocol http2 --url http://localhost:4321
```

## Project checks

Run these before sharing or publishing a new version:

```sh
npm run format
npm run check
npm run build
npm run verify
```

`npm run verify` checks the routes, metadata, competition data, registration state, empty blog, RSS feed, sitemap, and build output.

## Competition registrations

Competition details live in `src/data/competitions.ts`. Every `registrationUrl` is currently `null`, so the interface shows that the registration link is coming soon.

When a Google Form is ready, replace the matching value:

```ts
registrationUrl: "https://forms.gle/your-form-id";
```

The schedule remains subject to confirmation until the club approves the final dates and arrangements.

## Blog

The public blog is intentionally empty. Instructions and a frontmatter example are in `BLOGGING.md`.

New articles belong in `src/content/blog/` as Markdown or MDX files. Keep `draft: true` while editing. A post becomes public after it has real content, a suitable publish date, and `draft: false`.

## Images and credits

Prepared website assets are in `public/assets/`. Source files and attribution notes are listed in `ASSET_SOURCES.md` and displayed on the site at `/credits/`.

The reproducible image preparation script is `scripts/prepare_assets.py`. Its local Python environment and original source downloads are ignored by Git.

## Production URL

Netlify supplies its primary site address to Astro through the `URL` build variable. After adding a custom domain, the next production build will use it for canonical links, the sitemap, and RSS metadata.

You can also override the address for a local production build:

```sh
SITE_URL="https://your-domain.example" npm run build
```

The static site is generated in `dist/`. Netlify reads `netlify.toml`, runs `npm run build`, and publishes that directory.

## Connect Netlify

Push the project to GitHub, GitLab, Bitbucket, or Azure DevOps. In Netlify, choose **Add new project**, then **Import an existing project**, and select the repository.

The committed `netlify.toml` supplies the settings:

- Build command: `npm run build`
- Publish directory: `dist`

Netlify will build the production branch automatically and create previews for other branches and pull requests.
