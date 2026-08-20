import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({
		base: "./src/content/blog",
		pattern: "**/*.{md,mdx}",
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string().trim().min(1).max(120),
			description: z.string().trim().min(1).max(240),
			publishDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			author: z.string().trim().min(1).default("Japanese Club of D. S. Senanayake College"),
			tags: z.array(z.string().trim().min(1)).default([]),
			cover: z
				.object({
					image: image(),
					alt: z.string().trim().min(1),
				})
				.optional(),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
