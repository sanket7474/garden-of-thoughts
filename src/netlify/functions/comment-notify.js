export default async (req) => {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const name = params.get('name');
  const comment = params.get('comment');
  const slug = params.get('slug');
  const website = params.get('website') || 'none';

  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `💬 New comment on "${slug}"`,
        fields: [
          { name: 'From', value: name, inline: true },
          { name: 'Website', value: website, inline: true },
          { name: 'Comment', value: comment },
        ],
        color: 0x57F287,
      }]
    }),
  });

  return new Response('ok', { status: 200 });
};

export const config = {
  path: '/api/comment-notify',
};
