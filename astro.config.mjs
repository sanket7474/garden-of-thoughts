// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    // needed for cloudflare pages to work properly 
    output: "static",
    server: { port: 4321 },
  integrations: [sitemap(),mdx()],
  site: 'https://sanketmaske.dev',
  markdown: {
    shikiConfig: {
      theme: 'material-theme-lighter',
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          properties: {
            className: ['external'],
          },
          rel: [],
        },
      ],
    ],
  },
});
