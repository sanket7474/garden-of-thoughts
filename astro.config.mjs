// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    // needed for cloudflare pages to work properly 
    output: "static"
});
