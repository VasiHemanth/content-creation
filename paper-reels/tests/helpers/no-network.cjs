// Loaded into every node process the posts tests start (NODE_OPTIONS=--require) and into the test process itself.
// Any attempt to open a network connection throws, so a bug in the code under test cannot reach Meta or Cloudinary,
// even if a real token were in the environment. Local pipes, files and child processes are untouched.
//
// NO_NETWORK_REPORT=<file>: on exit, write the names of the uploader and third-party modules this process loaded (JSON array).
// A test uses it to show that a dry run never loads axios, cloudinary, sqlite3, dotenv or the Meta, host and tracker code.
const fs = require('node:fs');
const net = require('node:net');
const dns = require('node:dns');

const blocked = (what) => function networkBlocked() { throw new Error(`network access is blocked in tests (${what})`); };
net.Socket.prototype.connect = blocked('net.Socket.connect');
net.connect = net.createConnection = blocked('net.connect');
dns.lookup = blocked('dns.lookup');
dns.resolve = blocked('dns.resolve');
if (dns.promises) { dns.promises.lookup = blocked('dns.promises.lookup'); dns.promises.resolve = blocked('dns.promises.resolve'); }

if (process.env.NO_NETWORK_REPORT) {
  process.on('exit', () => {
    const loaded = Object.keys(require.cache).filter((f) => /[\\/]uploader[\\/]/.test(f)).map((f) => f.replace(/^.*[\\/]uploader[\\/]/, ''));
    try { fs.writeFileSync(process.env.NO_NETWORK_REPORT, JSON.stringify(loaded)); } catch {}
  });
}
