#!/usr/bin/env node
/**
 * Refresh the long-lived Threads token and save it to uploader/.env.
 *   node scripts/threads_refresh.js
 * Meta rules: the token must be at least 24 hours old and not expired. A refresh gives
 * 60 more days. Writes THREADS_ACCESS_TOKEN and THREADS_TOKEN_EXPIRES_AT. Never prints the token.
 */
require('../src/config');
const fs = require('fs');
const path = require('path');

(async () => {
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) throw new Error('THREADS_ACCESS_TOKEN is not set in .env');
  const res = await fetch('https://graph.threads.net/refresh_access_token?' + new URLSearchParams({ grant_type: 'th_refresh_token', access_token: token }));
  const j = await res.json();
  if (!res.ok) throw new Error(`refresh failed: ${res.status} code ${j.error && j.error.code}: ${j.error && j.error.message}`);
  const exp = new Date(Date.now() + j.expires_in * 1000).toISOString();
  const envPath = path.join(__dirname, '..', '.env');
  let txt = fs.readFileSync(envPath, 'utf8').replace(/\n*$/, '\n');
  for (const [k, v] of [['THREADS_ACCESS_TOKEN', j.access_token], ['THREADS_TOKEN_EXPIRES_AT', exp]]) {
    const re = new RegExp('^' + k + '=.*$', 'm');
    txt = re.test(txt) ? txt.replace(re, `${k}=${v}`) : txt + `${k}=${v}\n`;
  }
  fs.writeFileSync(envPath, txt);
  console.log('token refreshed; expires', exp);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
