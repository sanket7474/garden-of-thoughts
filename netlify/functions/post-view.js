import { getStore } from '@netlify/blobs';

export default async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug')?.toLowerCase();

  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const store = getStore('post-views');

  if (req.method === 'POST') {
    // Increment view count
    const current = await store.get(slug);
    const count = current ? parseInt(current) + 1 : 1;
    await store.set(slug, String(count));
    return new Response(JSON.stringify({ slug, views: count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'GET') {
    // Read view count
    const current = await store.get(slug);
    const count = current ? parseInt(current) : 0;
    return new Response(JSON.stringify({ slug, views: count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/post-view',
};