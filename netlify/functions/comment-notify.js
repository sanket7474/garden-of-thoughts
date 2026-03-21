export default async (req) => {
  const body = await req.json(); // ← was req.text()

  const name = body.data?.name;
  const comment = body.data?.comment;
  const slug = body.data?.slug;

  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `💬 New comment on "${slug}"`,
        fields: [
          { name: 'From', value: name, inline: true },
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