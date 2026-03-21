export default async (req) => {
  const body = await req.json();

  // Netlify sends form data inside body.data
  const data = body.data;
  const name = data?.name;
  const comment = data?.comment;
  const slug = data?.slug;
  const website = data?.website || null;

  if (!name || !comment || !slug) {
    return new Response('Missing fields', { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. "sanketmaske/garden-of-thoughts"
  const BRANCH = process.env.GITHUB_BRANCH || 'main';

  const filePath = `src/content/comments/${slug}.json`;
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  };

  // Check if file already exists
  let existingComments = [];
  let fileSha = null;

  const existingRes = await fetch(apiUrl, { headers });

  if (existingRes.ok) {
    const existingFile = await existingRes.json();
    fileSha = existingFile.sha;
    const decoded = JSON.parse(atob(existingFile.content.replace(/\n/g, '')));
    existingComments = decoded.comments || [];
  }
console.log('GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
console.log('GITHUB_REPO:', process.env.GITHUB_REPO);
console.log('GITHUB_BRANCH:', process.env.GITHUB_BRANCH);
console.log('body received:', JSON.stringify(body));
  // Build new comment object
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
  const encoded = btoa(unescape(encodeURIComponent(fileContent)));

  // Create or update the file via GitHub API
  const payload = {
    message: `add comment on ${slug}`,
    content: encoded,
    branch: BRANCH,
    ...(fileSha && { sha: fileSha }),
  };

  const pushRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (!pushRes.ok) {
    const err = await pushRes.text();
    console.error('GitHub API error:', err);
    return new Response('Failed to push to GitHub', { status: 500 });
  }

  return new Response('Comment added', { status: 200 });
};

// Minimal markdown to HTML converter
// Handles: bold, italic, inline code, paragraphs
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