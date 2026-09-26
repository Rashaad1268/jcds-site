#!/usr/bin/env node

/**
 * Dependency-free production verification for the MUSUBI Astro site.
 *
 * Run this after `astro build` from the project root:
 *   node scripts/verify.mjs
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = process.cwd();
const expectedSlugs = [
	"japanese-singing",
	"article-writing",
	"presentation",
	"cosplay",
	"japanese-dictation",
	"japanese-speech",
	"japanese-quiz",
	"display-competition",
	"japanese-art",
];
const expectedRuleFiles = {
	"japanese-singing": "japanese-singing-rules.pdf",
	"article-writing": "article-writing-rules.pdf",
	presentation: "video-presentation-rules.pdf",
	cosplay: "cosplay-rules.pdf",
	"japanese-dictation": "japanese-dictation-rules.pdf",
	"japanese-speech": "japanese-speech-rules.pdf",
	"japanese-quiz": "japanese-quiz-rules.pdf",
	"display-competition": "japanese-display-rules.pdf",
	"japanese-art": "japanese-art-rules.pdf",
};
const onlineSlugs = ["japanese-singing", "article-writing", "presentation", "cosplay"];

const failures = [];
let checks = 0;

function fail(scope, message) {
	failures.push(`[${scope}] ${message}`);
}

function check(condition, scope, message) {
	checks += 1;
	if (!condition) fail(scope, message);
}

function readRequired(path, scope) {
	checks += 1;
	if (!existsSync(path)) {
		fail(scope, `Missing required file: ${relative(root, path)}`);
		return "";
	}
	return readFileSync(path, "utf8");
}

function walkFiles(directory) {
	if (!existsSync(directory)) return [];

	const files = [];
	for (const entry of readdirSync(directory)) {
		const path = join(directory, entry);
		if (statSync(path).isDirectory()) files.push(...walkFiles(path));
		else files.push(path);
	}
	return files;
}

function normalizeRoute(route) {
	if (route === "/") return "/";
	return `/${route.replace(/^\/+|\/+$/g, "")}`;
}

function routeHtmlCandidates(route) {
	const routePart = normalizeRoute(route).replace(/^\//, "");
	const bases = [resolve(root, "dist")];
	const candidates = [];

	for (const base of bases) {
		if (!routePart) {
			candidates.push(join(base, "index.html"));
			continue;
		}
		candidates.push(join(base, routePart, "index.html"));
		candidates.push(join(base, `${routePart}.html`));
	}

	return [...new Set(candidates)];
}

function findRouteHtml(route) {
	return routeHtmlCandidates(route).find(existsSync) ?? null;
}

function requireRouteHtml(route) {
	const path = findRouteHtml(route);
	checks += 1;
	if (!path) {
		fail(
			route,
			`Missing generated HTML. Expected one of: ${routeHtmlCandidates(route)
				.map((candidate) => relative(root, candidate))
				.join(", ")}`,
		);
		return { path: null, html: "" };
	}
	return { path, html: readFileSync(path, "utf8") };
}

function decodeBasicEntities(value) {
	return value
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">");
}

function stripHtml(html) {
	return decodeBasicEntities(
		html
			.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
			.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim(),
	);
}

function getAttribute(tag, name) {
	const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
	return decodeBasicEntities(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function findMetaContent(html, attribute, value) {
	const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
	const tag = tags.find(
		(candidate) => getAttribute(candidate, attribute).toLowerCase() === value.toLowerCase(),
	);
	return tag ? getAttribute(tag, "content").trim() : "";
}

function pageMetadata(html) {
	const title = decodeBasicEntities(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
		.replace(/\s+/g, " ")
		.trim();
	const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? []).find(
		(tag) => getAttribute(tag, "rel").toLowerCase() === "canonical",
	);

	return {
		title,
		description: findMetaContent(html, "name", "description"),
		canonical: canonicalTag ? getAttribute(canonicalTag, "href") : "",
	};
}

function canonicalMatchesRoute(canonical, route) {
	if (!canonical) return false;
	try {
		const pathname = new URL(canonical, "https://verify.invalid").pathname;
		const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
		return normalizedPath === normalizeRoute(route);
	} catch {
		return false;
	}
}

function assertPage(route, html, { requireCanonical = true } = {}) {
	if (!html) return null;

	const h1Count = (html.match(/<h1\b/gi) ?? []).length;
	check(h1Count === 1, route, `Expected exactly one <h1>; found ${h1Count}.`);
	check(
		/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html),
		route,
		"Missing html lang attribute.",
	);
	check(
		/<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(html),
		route,
		"Missing viewport metadata.",
	);

	const metadata = pageMetadata(html);
	check(Boolean(metadata.title), route, "Missing or empty <title>.");
	check(metadata.title.toLowerCase() !== "astro", route, "Starter title 'Astro' is still present.");
	check(Boolean(metadata.description), route, "Missing or empty meta description.");
	if (requireCanonical) {
		check(Boolean(metadata.canonical), route, "Missing canonical link.");
		check(
			canonicalMatchesRoute(metadata.canonical, route),
			route,
			`Canonical URL does not match route (found ${metadata.canonical || "none"}).`,
		);
	}

	check(
		!/(?:\bprovisional\b|\bprovincial\b)/i.test(stripHtml(html)),
		route,
		"Found a removed provisional-status label.",
	);

	return metadata;
}

function assertNoDummyRegistrationLinks(route, html) {
	if (!html) return;

	const hrefs = (html.match(/<a\b[^>]*>/gi) ?? []).map((tag) => getAttribute(tag, "href"));
	const invalid = hrefs.filter((href) => {
		const normalized = href.trim().toLowerCase();
		return (
			normalized === "" ||
			normalized === "#" ||
			normalized === "/#" ||
			normalized.startsWith("javascript:") ||
			normalized.includes("placeholder") ||
			normalized.includes("example.com") ||
			((normalized.includes("forms.gle") || normalized.includes("docs.google.com/forms")) &&
				!isGoogleFormUrl(href))
		);
	});

	check(
		invalid.length === 0,
		route,
		`Found dummy or unexpected registration href(s): ${[...new Set(invalid)].join(", ")}`,
	);
}

function isGoogleFormUrl(value) {
	try {
		const url = new URL(value);
		return (
			url.protocol === "https:" &&
			(url.hostname === "forms.gle" ||
				(url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/")))
		);
	} catch {
		return false;
	}
}

function findBuiltFile(fileName) {
	const candidates = [resolve(root, "dist", fileName)];
	return candidates.find(existsSync) ?? null;
}

// Hosting contract: a fully static Astro build configured for Netlify.
const astroConfig = readRequired(resolve(root, "astro.config.mjs"), "Netlify configuration");
const packageSource = readRequired(resolve(root, "package.json"), "Netlify configuration");
const netlifyConfig = readRequired(resolve(root, "netlify.toml"), "Netlify configuration");

check(
	/\boutput\s*:\s*["']static["']/.test(astroConfig),
	"Netlify configuration",
	"Astro output must be static.",
);
check(
	!astroConfig.includes("@openai/sites-vite-plugin") &&
		!astroConfig.includes("@astrojs/cloudflare") &&
		!astroConfig.includes("sites()"),
	"Netlify configuration",
	"Astro config still contains OpenAI Sites or Cloudflare adapter code.",
);
check(
	!packageSource.includes("@openai/sites-vite-plugin") &&
		!packageSource.includes("@astrojs/cloudflare") &&
		!packageSource.includes('"wrangler"'),
	"Netlify configuration",
	"package.json still contains OpenAI Sites or Cloudflare dependencies.",
);
check(
	/^\s*command\s*=\s*["']npm run build["']\s*$/m.test(netlifyConfig) &&
		/^\s*publish\s*=\s*["']dist["']\s*$/m.test(netlifyConfig),
	"Netlify configuration",
	"netlify.toml must build with npm run build and publish dist.",
);
check(
	!existsSync(resolve(root, ".openai/hosting.json")) &&
		!existsSync(resolve(root, "wrangler.jsonc")),
	"Netlify configuration",
	"OpenAI Sites or Wrangler configuration is still present.",
);

// Source contract: one canonical, typed competition data file.
const competitionSourcePath = resolve(root, "src/data/competitions.ts");
const competitionSource = readRequired(competitionSourcePath, "competition data");
const slugs = [...competitionSource.matchAll(/\bslug\s*:\s*(["'`])([a-z0-9-]+)\1/g)].map(
	(match) => match[2],
);
const uniqueSlugs = [...new Set(slugs)];

check(
	slugs.length === 9,
	"competition data",
	`Expected exactly 9 competition records; found ${slugs.length}.`,
);
check(
	uniqueSlugs.length === 9,
	"competition data",
	`Competition slugs must be unique; found ${uniqueSlugs.length} unique slugs.`,
);

const missingSlugs = expectedSlugs.filter((slug) => !uniqueSlugs.includes(slug));
const unexpectedSlugs = uniqueSlugs.filter((slug) => !expectedSlugs.includes(slug));
check(
	missingSlugs.length === 0 && unexpectedSlugs.length === 0,
	"competition data",
	`Slug set mismatch. Missing: ${missingSlugs.join(", ") || "none"}; unexpected: ${unexpectedSlugs.join(", ") || "none"}.`,
);

const rulesPdfUrls = [...competitionSource.matchAll(/\brulesPdfUrl\s*:\s*["']([^"']+)["']/g)].map(
	(match) => match[1],
);
check(
	rulesPdfUrls.length === 9 &&
		new Set(rulesPdfUrls).size === 9 &&
		rulesPdfUrls.every((url) => /^\/rules\/[a-z0-9-]+-rules\.pdf$/.test(url)),
	"competition data",
	`Expected 9 unique, descriptive /rules/*-rules.pdf URLs; found ${rulesPdfUrls.length}.`,
);

const schoolRegistrationData = readRequired(
	resolve(root, "src/data/site.ts"),
	"school registration data",
);
check(
	/schoolRegistrationFormUrl\s*:\s*null/.test(schoolRegistrationData),
	"school registration data",
	"Expected a blank school registration form URL to fill in later.",
);

check(
	existsSync(resolve(root, "dist/index.html")) && !existsSync(resolve(root, "dist/server")),
	"Netlify build",
	"Expected a flat static build at dist/index.html with no server bundle.",
);

const representativeMetadata = [];
const home = requireRouteHtml("/");
const homeMetadata = assertPage("/", home.html);
if (homeMetadata) representativeMetadata.push({ route: "/", ...homeMetadata });
assertNoDummyRegistrationLinks("/", home.html);
if (home.html) {
	const homeLinks = (home.html.match(/<a\b[^>]*>/gi) ?? []).map((tag) => ({
		href: getAttribute(tag, "href"),
		target: getAttribute(tag, "target"),
	}));
	const rulesLinks = homeLinks.filter(({ href }) => href.startsWith("/rules/"));
	check(
		rulesLinks.length === 9 && rulesLinks.every(({ target }) => target === "_blank"),
		"homepage competition cards",
		`Expected 9 new-tab rules links, found ${rulesLinks.length}.`,
	);
	check(
		/school registration form coming soon/i.test(stripHtml(home.html)),
		"homepage school registration",
		"Missing the school registration form placeholder.",
	);
}

for (const slug of expectedSlugs) {
	const route = `/competitions/${slug}`;
	const page = requireRouteHtml(route);
	const metadata = assertPage(route, page.html);
	if (metadata) representativeMetadata.push({ route, ...metadata });
	assertNoDummyRegistrationLinks(route, page.html);

	if (page.html) {
		const text = stripHtml(page.html);
		const ruleHref = `/rules/${expectedRuleFiles[slug]}`;
		const routeLinks = (page.html.match(/<a\b[^>]*>/gi) ?? []).map((tag) => ({
			href: getAttribute(tag, "href"),
			target: getAttribute(tag, "target"),
		}));
		check(
			routeLinks.some(({ href, target }) => href === ruleHref && target === "_blank"),
			route,
			`Missing the new-tab rules PDF link: ${ruleHref}.`,
		);
		check(
			existsSync(resolve(root, "public", ruleHref.slice(1))) &&
				existsSync(resolve(root, "dist", ruleHref.slice(1))),
			route,
			`Rules PDF must exist in source and build output: ${ruleHref}.`,
		);
		if (onlineSlugs.includes(slug)) {
			check(
				/participant google form coming soon|submit your entry/i.test(text),
				route,
				"Missing the participant submission form link or its placeholder.",
			);
		}
	}
}

const blog = requireRouteHtml("/blog");
const blogMetadata = assertPage("/blog", blog.html);
if (blogMetadata) representativeMetadata.push({ route: "/blog", ...blogMetadata });
assertNoDummyRegistrationLinks("/blog", blog.html);
if (blog.html) {
	const text = stripHtml(blog.html);
	check(
		/stories coming soon/i.test(text),
		"/blog",
		"Missing the intentional 'Stories coming soon' empty state.",
	);

	const publicPostLinks = (blog.html.match(/<a\b[^>]*>/gi) ?? [])
		.map((tag) => getAttribute(tag, "href"))
		.filter((href) => /^\/blog\/[^#?]+/.test(href));
	check(
		publicPostLinks.length === 0,
		"/blog",
		`Empty blog unexpectedly links to public posts: ${publicPostLinks.join(", ")}`,
	);
}

check(
	existsSync(resolve(root, "src/pages/blog/[...slug].astro")),
	"future blog",
	"Missing src/pages/blog/[...slug].astro for future Markdown/MDX articles.",
);
check(
	existsSync(resolve(root, "src/content.config.ts")),
	"future blog",
	"Missing src/content.config.ts for the typed blog content collection.",
);

const blogOutputRoots = [resolve(root, "dist/blog")].filter(existsSync);
const unexpectedBlogPages = blogOutputRoots
	.flatMap(walkFiles)
	.filter((path) => extname(path) === ".html")
	.filter((path) => !/[/\\]blog[/\\]index\.html$/.test(path));
check(
	unexpectedBlogPages.length === 0,
	"/blog",
	`Empty blog generated unexpected article pages: ${unexpectedBlogPages.map((path) => relative(root, path)).join(", ")}`,
);

const notFound = requireRouteHtml("/404");
assertPage("/404", notFound.html, { requireCanonical: false });
if (notFound.html) {
	check(
		/\bnoindex\b/i.test(findMetaContent(notFound.html, "name", "robots")),
		"/404",
		"404 page must include a robots noindex directive.",
	);
}

const rssPath = findBuiltFile("rss.xml");
check(Boolean(rssPath), "RSS", "Missing generated rss.xml in dist.");
if (rssPath) {
	const rss = readFileSync(rssPath, "utf8");
	check(
		/<rss\b/i.test(rss),
		"RSS",
		`${relative(root, rssPath)} does not contain an RSS root element.`,
	);
	check(
		(rss.match(/<item\b/gi) ?? []).length === 0,
		"RSS",
		"RSS must contain zero items while the public blog is empty.",
	);
}

const distRoots = [resolve(root, "dist")].filter(existsSync);
const sitemapPaths = [
	...new Set(
		distRoots
			.flatMap(walkFiles)
			.filter((path) => /^sitemap(?:-index|-\d+)?\.xml$/i.test(path.split(/[/\\]/).at(-1) ?? "")),
	),
];
check(sitemapPaths.length > 0, "sitemap", "Missing generated sitemap XML in dist.");
if (sitemapPaths.length > 0) {
	const sitemap = sitemapPaths.map((path) => readFileSync(path, "utf8")).join("\n");
	check(
		/<(?:urlset|sitemapindex)\b/i.test(sitemap),
		"sitemap",
		"Generated sitemap has no urlset or sitemapindex root.",
	);

	for (const route of ["/blog", ...expectedSlugs.map((slug) => `/competitions/${slug}`)]) {
		check(
			sitemap.includes(route),
			"sitemap",
			`Generated sitemap does not include required route ${route}.`,
		);
	}
	check(!sitemap.includes("/404"), "sitemap", "404 route must not be included in the sitemap.");
}

const titles = representativeMetadata.map(({ title }) => title);
const descriptions = representativeMetadata.map(({ description }) => description);
check(
	new Set(titles).size === titles.length,
	"metadata",
	"Home, blog, and competition page titles must be unique.",
);
check(
	new Set(descriptions).size === descriptions.length,
	"metadata",
	"Home, blog, and competition meta descriptions must be unique.",
);

if (failures.length > 0) {
	console.error(
		`MUSUBI verification failed with ${failures.length} issue(s) across ${checks} checks:\n`,
	);
	for (const failure of failures) console.error(`  - ${failure}`);
	process.exitCode = 1;
} else {
	console.log(`MUSUBI verification passed (${checks} checks, 9 competition routes).`);
}
