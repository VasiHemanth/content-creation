const fs = require('fs');
const path = require('path');
const http = require('http');
const { google } = require('googleapis');
const { ROOT } = require('./config');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly', // lets us confirm which channel we post to
];
const TOKEN_PATH = path.join(ROOT, 'youtube_tokens.json');

/** Catch the OAuth redirect on a loopback port (the old copy-paste "oob" flow is deprecated). */
function waitForCode(server) {
  return new Promise((resolve, reject) => {
    server.on('request', (req, res) => {
      const url = new URL(req.url, 'http://localhost');
      const code = url.searchParams.get('code');
      const err = url.searchParams.get('error');
      res.end(code ? 'Authorized. You can close this tab.' : `Authorization failed: ${err}`);
      server.close();
      code ? resolve(code) : reject(new Error(err || 'no code returned'));
    });
  });
}

async function authorize() {
  const credFile = path.resolve(ROOT, process.env.YOUTUBE_CLIENT_SECRET_FILE || './client_secret.json');
  if (!fs.existsSync(credFile)) throw new Error(`Missing YouTube credentials at ${credFile}`);
  const creds = JSON.parse(fs.readFileSync(credFile, 'utf8'));
  const { client_id, client_secret } = creds.installed || creds.web;

  if (fs.existsSync(TOKEN_PATH)) {
    const client = new google.auth.OAuth2(client_id, client_secret);
    client.on('tokens', (t) => {
      const prev = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')) : {};
      fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...prev, ...t }));
    });
    client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
    try {
      await client.getAccessToken();
      return client;
    } catch (e) {
      if (e.message?.includes('invalid_grant') || e.response?.data?.error === 'invalid_grant') {
        console.warn('Stored YouTube token is expired or revoked. Starting re-authorization...');
        fs.unlinkSync(TOKEN_PATH);
      } else {
        throw e;
      }
    }
  }

  const server = http.createServer().listen(+process.env.YOUTUBE_REDIRECT_PORT || 8085); // fixed port so a Web client can register the exact redirect URI
  const redirect = `http://localhost:${server.address().port}`;
  const client = new google.auth.OAuth2(client_id, client_secret, redirect);

  // Persist refreshed access tokens so the stored file doesn't go stale.
  client.on('tokens', (t) => {
    const prev = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')) : {};
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...prev, ...t }));
  });

  const authUrl = client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES });
  console.log(`\nAuthorize YouTube in your browser:\n${authUrl}\n`);
  const code = await waitForCode(server);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log(`Token stored at ${TOKEN_PATH}`);
  return client;
}

/**
 * @param {object} p { video, title, description, tags, thumbnail, privacy }
 */
async function uploadYouTube(p) {
  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });

  const res = await youtube.videos.insert({
    part: 'id,snippet,status',
    notifySubscribers: false,
    requestBody: {
      snippet: {
        title: (p.title || 'Untitled').slice(0, 100),
        description: p.description || '',
        tags: p.tags || [],
        categoryId: p.categoryId || '27', // 27 = Education
      },
      status: { privacyStatus: p.privacy || 'public', selfDeclaredMadeForKids: false },
    },
    media: { body: fs.createReadStream(p.video) },
  });

  const id = res.data.id;
  if (p.thumbnail && fs.existsSync(p.thumbnail)) {
    try {
      await youtube.thumbnails.set({ videoId: id, media: { body: fs.createReadStream(p.thumbnail) } });
    } catch (e) {
      console.warn(`   Thumbnail not set: ${e.message}`);
    }
  }
  return `https://youtube.com/shorts/${id}`;
}

/** Returns the channel the stored token posts to. */
async function whoami() {
  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });
  const { data } = await youtube.channels.list({ part: 'snippet', mine: true });
  const c = data.items && data.items[0];
  if (!c) throw new Error('No channel found for this token');
  return { id: c.id, title: c.snippet.title, handle: c.snippet.customUrl };
}

module.exports = { uploadYouTube, whoami, authorize };
