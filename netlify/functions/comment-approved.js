export default async (req) => {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('Invalid JSON body', { status: 400 });
  }

  console.log('body received:', JSON.stringify(body));

  const data = body.data || body;
  const name = data?.name;
  const comment = data?.comment;
  const slug = data?.slug;
  const website = data?.website || null;

  console.log('parsed fields:', { name, slug, hasComment: !!comment });

  if (!name || !comment || !slug) {
    return new Response('Missing fields: ' + JSON.stringify({ name: !!name, comment: !!comment, slug: !!slug }), { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const BRANCH = process.env.GITHUB_BRANCH || 'main';

  console.log('env check:', { hasToken: !!GITHUB_TOKEN, repo: GITHUB_REPO, branch: BRANCH });

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return new Response('Missing env vars: GITHUB_TOKEN or GITHUB_REPO', { status: 500 });
  }

  const normalizedSlug = slug.toLowerCase();
  const filePath = `src/content/comments/${normalizedSlug}.json`;
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  };

  let existingComments = [];
  let fileSha = null;

  const existingRes = await fetch(apiUrl, { headers });
  console.log('existing file status:', existingRes.status);

  if (existingRes.ok) {
    const existingFile = await existingRes.json();
    fileSha = existingFile.sha;
    // Use Buffer instead of atob — works on all Node versions
    const decoded = JSON.parse(Buffer.from(existingFile.content, 'base64').toString('utf-8'));
    existingComments = decoded.comments || [];
    console.log('existing comments count:', existingComments.length);
  }

  const newComment = {
    id: `${Date.now()}`,
    parentId: null,
    createdBy: { fullName: name },
    ...(website && { website }),
    html: markdownToHtml(comment),
    createdAt: Date.now(),
  };

  const updatedComments = [...existingComments, newComment];
  const fileContent = JSON.stringify({ comments: updatedComments }, null, 2);
  // Use Buffer instead of btoa
  const encoded = Buffer.from(fileContent, 'utf-8').toString('base64');

  const payload = {
    message: `add comment on ${normalizedSlug}`,
    content: encoded,
    branch: BRANCH,
    ...(fileSha && { sha: fileSha }),
  };

  const pushRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  console.log('GitHub push status:', pushRes.status);

  if (!pushRes.ok) {
    const err = await pushRes.text();
    console.error('GitHub API error:', err);
    return new Response(`GitHub error ${pushRes.status}: ${err}`, { status: 500 });
  }

  return new Response('Comment added', { status: 200 });
};

function markdownToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let paragraph = '';
  for (const line of lines) {
    if (line.trim() === '') {
      if (paragraph.trim()) {
        html += `<p>${formatInline(paragraph.trim())}</p>\n`;
        paragraph = '';
      }
    } else {
      paragraph += (paragraph ? ' ' : '') + line;
    }
  }
  if (paragraph.trim()) {
    html += `<p>${formatInline(paragraph.trim())}</p>\n`;
  }
  return html;
}

function formatInline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export const config = {
  path: '/api/comment-approved',
};