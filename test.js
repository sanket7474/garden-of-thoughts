import https from 'https';

const RESEND_AUDIENCE_ID ='41dce5cc-5727-47d4-9e64-a57a371fd359';
const RESEND_API_KEY =  're_gZUooGfm_PUVEKhpvT4nTkTwWMgXrkao';

const data = await apiRequest(
    'api.resend.com',
    `/audiences/${RESEND_AUDIENCE_ID}/contacts`,
    {
      Authorization: `Bearer ${RESEND_API_KEY}`,
    }
  );



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