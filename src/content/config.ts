import { defineCollection, z } from 'astro:content'

// Define your collection(s)


// COllection for blog posts
// each post will have a title, date, tags, and an optional draft status
// The schema ensures that each post has the required fields and validates their types
const posts = defineCollection({
  type: 'content',
  // z is a schema validation library that Astro uses to define the shape of your content
  // it is called "zod" and allows you to specify the expected structure of 
  // your content entries
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional().default(false),
  })
})

export const collections = { posts }