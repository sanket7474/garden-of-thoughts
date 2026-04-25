# 🌿 Garden of Thoughts

Personal blog by [Sanket Maske](https://sanketmaske.dev) — built with Astro 5, deployed on Netlify.

URL : [sanketmaske.dev](https://sanketmaske.dev)

---

## Tech Stack

- **[Astro 5](https://astro.build)** — static site generator
- **MDX** — markdown with component support
- **Netlify** — hosting + serverless functions
- **Netlify Blobs** — view counter storage
- **Resend** — newsletter emails via GitHub Actions

---

## Project Structure

```
/
├── netlify/
│   └── functions/
│       ├── admin-submissions.js   # fetch & manage pending comments
│       ├── comment-approved.js    # push approved comment to GitHub → triggers redeploy
│       ├── comment-notify.js      # Discord webhook on new comment
│       ├── page-hit.js            # track page views
│       ├── post-view.js           # read/write view count via Netlify Blobs
│       └── subscribe.js           # newsletter subscription via Resend
├── public/
│   ├── assets/
│   │   ├── images/                # static images
│   │   └── scripts/
│   │       └── cursorTrails.js    # custom cursor trail effect
│   ├── styles/
│   │   └── global.css             # global styles
│   ├── cursor.png / cursor-dark.svg
│   └── pointer.png / pointer-dark.png
└── src/
    ├── components/
    │   ├── Blockquote.astro       # prop-based blockquote (center, author, accent)
    │   └── Youtube.astro          # lite-youtube-embed wrapper
    ├── content/
    │   ├── comments/              # approved comments as JSON (auto-committed)
    │   ├── posts/                 # MDX blog posts
    │   └── config.ts              # content collection schema
    ├── data/
    │   └── postConfig.ts          # post-level config
    ├── layouts/
    │   ├── Layout.astro           # main page shell
    │   ├── Sidebar.astro
    │   ├── Footer.astro
    │   ├── Comments.astro         # comment form + list
    │   ├── CommentsList.astro
    │   ├── AboutPage.astro
    │   ├── HomeNotes.astro
    │   └── ...
    ├── pages/
    │   ├── index.astro
    │   ├── about.astro
    │   ├── subscribe.astro
    │   ├── tags.astro
    │   ├── 404.astro
    │   ├── admin.astro            # comment moderation panel
    │   └── blog/[slug].astro      # dynamic post route
    └── plugins/
        └── remarkReadingTime.mjs  # remark plugin for reading time
```

---

## Features

**Content**
- MDX posts with reading time, tags, and view counts
- Sitemap + Open Graph meta via `@astrojs/sitemap`
- Syntax highlighting via Shiki (`material-theme-lighter`)
- External links auto-marked with `rehype-external-links`

**Comments system**
- Visitors submit via Netlify Forms
- Discord webhook notifies on new submission
- Admin panel at `/admin` for moderation
- Approved comments are committed to the repo as JSON → triggers Netlify redeploy

**Newsletter**
- Subscribe form → Netlify function → Resend API
- Handled via GitHub Actions

**UI**
- Dark mode
- Custom SVG cursors + cursor trail effect
- Animated peacock brand image (canvas pixel-displacement)
- Rainbow gradient border on subscribe input
- Prop-based `<Blockquote>` component (see below)

---

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview production build locally |

---

## Writing Posts

Create a `.mdx` file in `src/content/posts/`:

```mdx
---
title: Post Title
date: 2026-01-01
excerpt: Short description
slug: post-slug
tags: ['tag1', 'tag2']
draft: false
minutesRead: 3
---

Post content here.
```

---

## Environment Variables

Set these in Netlify → Site settings → Environment variables. Never hardcode.

| Variable | Used by |
| :--- | :--- |
| `DISCORD_WEBHOOK_URL` | `comment-notify.js` |
| `GITHUB_TOKEN` | `comment-approved.js` |
| `GITHUB_REPO` | `comment-approved.js` |
| `ADMIN_PASSWORD` | `admin.astro` |
| `RESEND_API_KEY` | `subscribe.js` |

---

## Deployment

Pushes to `main` → auto-deploy on Netlify.

Approved comments also trigger a redeploy via the GitHub API commit in `comment-approved.js`.