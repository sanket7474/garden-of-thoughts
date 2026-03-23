// .github/workflows/ — this is a GitHub Actions script, not a Netlify function
// This file goes in: .github/scripts/send-newsletter.js

import https from 'https';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

console.log('keys:: '+ RESEND_API_KEY + " ::: " + RESEND_AUDIENCE_ID)

const POST_TITLE = process.env.POST_TITLE;
const POST_SLUG = process.env.POST_SLUG;
const POST_EXCERPT = process.env.POST_EXCERPT || '';
const SITE_URL = 'https://sanketmaske.dev';

async function fetchSubscribers() {
  const data = await apiRequest(
    'api.resend.com',
    `/audiences/${RESEND_AUDIENCE_ID}/contacts`,
    {
      Authorization: `Bearer ${RESEND_API_KEY}`,
    }
  );

  if (!data || !data.data) {
    console.log("No contacts found in audience");
    return [];
  }

  return data.data.map(c => c.email).filter(Boolean);
}

async function sendEmail(to, subject, html) {
  return apiRequest(
    'api.resend.com',
    '/emails',
    {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    'POST',
    JSON.stringify({
      from: 'Sanket Maske <newsletter@sanketmaske.dev>',
      to,
      subject,
      html,
    })
  );
}

function apiRequest(hostname, path, headers, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function buildEmailHtml(title, slug, excerpt) {
  const postUrl = `${SITE_URL}/blog/${slug}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</head>
<body style="background:#0f1128; color:#f2f0e9; font-family: monospace; padding: 2rem; max-width: 600px; margin: 0 auto;">
  <p style="color:#c76399; font-size:1.1rem; margin-bottom:0.5rem;">🌱 Garden of Thoughts</p>
  <h1 style="font-size:1.6rem; margin:0 0 1rem; color:#f2f0e9;">${title}</h1>
  ${excerpt ? `<p style="color:#c9c6d1; line-height:1.6; margin-bottom:1.5rem;">${excerpt}</p>` : ''}
  <a href="${postUrl}" style="display:inline-block; background:#c76399; color:white; padding:0.7rem 1.4rem; border-radius:8px; text-decoration:none; font-weight:600;">
    Read post →
  </a>
  <hr style="border:none; border-top:1px dashed rgba(199,99,153,0.3); margin:2rem 0;" />
  <p style="font-size:0.8rem; color:#9896a4;">
    You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#c76399;">${SITE_URL}</a>.
    <br/>To unsubscribe, reply with "unsubscribe" to this email.
  </p>
</body>
</html>
  `;
}

async function main() {
  console.log(`Sending newsletter for: ${POST_TITLE}`);

  const subscribers = await fetchSubscribers();
  console.log(`Found ${subscribers.length} subscribers`);

  if (subscribers.length === 0) {
    console.log('No subscribers, skipping');
    return;
  }

  const html = buildEmailHtml(POST_TITLE, POST_SLUG, POST_EXCERPT);
  const subject = `New post: ${POST_TITLE}`;

  let sent = 0;
  for (const email of subscribers) {
    try {
      await sendEmail(email, subject, html);
      console.log(`Sent to ${email}`);
      sent++;
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`Failed to send to ${email}:`, err);
    }
  }

  console.log(`Done. Sent ${sent}/${subscribers.length} emails.`);
}

main().catch(console.error);