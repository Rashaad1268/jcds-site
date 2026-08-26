// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL ?? process.env.URL ?? "https://example.invalid",
	output: "static",

	integrations: [react(), mdx(), sitemap()],

	vite: {
		plugins: [tailwindcss()],
		server: {
			allowedHosts: ["divorce-peterson-patricia-constitutional.trycloudflare.com"],
		},
	},
});
