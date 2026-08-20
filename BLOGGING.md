# Blog authoring guide

The public blog is intentionally empty. Add future articles to `src/content/blog/` as Markdown (`.md`) or MDX (`.mdx`) files. A published file automatically appears at `/blog/<file-name>/` and in `/rss.xml`.

Nested folders are supported. For example, `src/content/blog/events/musubi-recap.md` becomes `/blog/events/musubi-recap/`.

## Frontmatter template

Start new work as a draft so it cannot appear publicly before review:

```yaml
---
title: "Article title"
description: "A concise summary for the blog index, search results, and RSS."
publishDate: 2026-11-04
updatedDate: 2026-11-06 # Optional
author: "Japanese Club of D. S. Senanayake College"
tags:
  - MUSUBI
  - Japanese culture
featured: false
draft: true
# Optional cover image, resolved relative to this article:
# cover:
#   image: ./cover.jpg
#   alt: "A specific description of the image"
---
```

Required fields are `title`, `description`, and `publishDate`. The author defaults to the club, tags default to an empty list, and both `featured` and `draft` default to `false`. Cover-image alt text is required whenever a cover is supplied.

## Publishing workflow

1. Create the article and keep `draft: true` while writing and reviewing it.
2. Use headings in order, beginning with `##` because the page template supplies the article title as its single `h1`.
3. Confirm names, dates, links, image rights, and image descriptions.
4. Set `draft: false` or remove the draft field when the article is approved.
5. Run `npm run build` before deployment. Invalid frontmatter fails content validation.

Drafts are excluded from generated article routes, the blog index, and RSS in every environment. Deleting a published source file also removes its generated route on the next build.
