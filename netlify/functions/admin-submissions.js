export default async (req) => {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
  const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

  const { action, password, submissionId } = await req.json();

  // ─── Auth ─────────────────────────────────────────────────────────
  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers = {
    Authorization: `Bearer ${NETLIFY_API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // ─── Get submissions ──────────────────────────────────────────────
  if (action === 'list') {
    const formsRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/forms`,
      { headers }
    );
    if (!formsRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch forms' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const forms = await formsRes.json();
    const commentForm = forms.find((f) => f.name === 'comment');
    if (!commentForm) {
      return new Response(JSON.stringify({ submissions: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const subsRes = await fetch(
      `https://api.netlify.com/api/v1/forms/${commentForm.id}/submissions`,
      { headers }
    );
    const submissions = await subsRes.json();

    return new Response(JSON.stringify({ submissions }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── Delete submission ────────────────────────────────────────────
  if (action === 'delete') {
    const res = await fetch(
      `https://api.netlify.com/api/v1/submissions/${submissionId}`,
      { method: 'DELETE', headers }
    );
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to delete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  path: '/api/admin-submissions',
};