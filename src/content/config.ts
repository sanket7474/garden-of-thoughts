import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders';
// Define your collection(s)


// COllection for blog posts
// each post will have a title, date, tags, and an optional draft status
// The schema ensures that each post has the required fields and validates their types
const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',  // ← picks up both
    base: './src/content/posts',
  }),
  // z is a schema validation library that Astro uses to define the shape of your content
  // it is called "zod" and allows you to specify the expected structure of 
  // your content entries
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    excerpt: z.string().optional(),
    draft: z.boolean().optional().default(false),
    noComments: z.boolean().optional().nullable(),
    minutesRead: z.number().optional()
  })
})


const comment = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.number(),
  html: z.string(),
  createdBy: z.object({
    fullName: z.string(),
  }),
});

const commentsCollection = defineCollection({
  loader: glob({
    pattern: '*.json',
    base: './src/content/comments',
  }),
  schema: z.object({
    comments: z.array(comment),
  }),
});

export const collections = { posts , comments: commentsCollection}