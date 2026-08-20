import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

function escapeXml(value: string): string {
	return value.replace(
		/[<>&'\"]/g,
		(character) =>
			({
				"<": "&lt;",
				">": "&gt;",
				"&": "&amp;",
				"'": "&apos;",
				'"': "&quot;",
			})[character] ?? character,
	);
}

export const GET: APIRoute = async ({ request, site }) => {
	const baseUrl = site ?? new URL(request.url).origin;
	const blogUrl = new URL("/blog/", baseUrl).href;
	const feedUrl = new URL("/rss.xml", baseUrl).href;
	const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
		(a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
	);

	const items = posts
		.map((post) => {
			const postUrl = new URL(`/blog/${post.id}/`, baseUrl).href;
			const categories = post.data.tags
				.map((tag) => `<category>${escapeXml(tag)}</category>`)
				.join("");

			return `<item>
	<title>${escapeXml(post.data.title)}</title>
	<link>${escapeXml(postUrl)}</link>
	<guid isPermaLink="true">${escapeXml(postUrl)}</guid>
	<description>${escapeXml(post.data.description)}</description>
	<dc:creator>${escapeXml(post.data.author)}</dc:creator>
	<pubDate>${post.data.publishDate.toUTCString()}</pubDate>
	${categories}
</item>`;
		})
		.join("\n");

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
	<title>Japanese Club of D. S. Senanayake College: Stories</title>
	<link>${escapeXml(blogUrl)}</link>
	<description>News, reflections, and cultural stories from the Japanese Club of D. S. Senanayake College.</description>
	<language>en</language>
	<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
	${items}
</channel>
</rss>`;

	return new Response(feed, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
};
