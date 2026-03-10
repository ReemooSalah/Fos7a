
const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key missing' });
  }

  const body = JSON.stringify({
    model: req.body.model || 'claude-sonnet-4-20250514',
    max_tokens: req.body.max_tokens || 1000,
    messages: req.body.messages,
  });

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          res.status(response.statusCode).json(JSON.parse(data));
        } catch {
          res.status(500).json({ error: 'Parse error' });
        }
        resolve();
      });
    });

    request.on('error', () => {
      res.status(500).json({ error: 'Connection error' });
      resolve();
    });

    request.write(body);
    request.end();
  });
};
