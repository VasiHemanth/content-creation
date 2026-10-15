#!/usr/bin/env node
/** One-time YouTube consent. Prints the channel the token belongs to. */
const { execFile } = require('child_process');
const { whoami } = require('../src/youtube');
require('../src/config');
(async () => {
  const origLog = console.log;
  console.log = (...a) => { origLog(...a); const m = String(a.join(' ')).match(/https:\/\/accounts\.google\.com\S+/); if (m) execFile('open', [m[0]]); };
  const me = await whoami();
  console.log = origLog;
  console.log('Authorized channel:', me);
})().catch((e) => { console.error(e.message); process.exit(1); });
