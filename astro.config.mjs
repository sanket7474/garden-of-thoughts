// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import mdx from '@astrojs/mdx';
import mermaid from 'astro-mermaid';
import { remarkReadingTime } from './src/plugins/remarkReadingTime.mjs';

// https://astro.build/config
export default defineConfig({
    // needed for cloudflare pages to work properly 
    output: "static",
    server: { port: 4321 },
  integrations: [
    mermaid({
      theme: 'neutral',
      autoTheme: true,
    }),
    sitemap(),
    mdx(),
  ],
  site: 'https://sanketmaske.dev',
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      themes: {
        light: 'material-theme-lighter',
        dark: 'material-theme-darker', // or 'one-dark-pro', 'github-dark', etc.
      },
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