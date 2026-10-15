// Import this module FIRST in every entry point of the posts engine.
//
// hf/lib/hfcli.mjs copies process.env once, when it is loaded, so these switches have to be set before that import
// runs. ES modules evaluate in import order, which makes `import './env.mjs'` as the first line enough.
//
// What they do:
//   HYPERFRAMES_NO_TELEMETRY / _NO_UPDATE_CHECK / _NO_AUTO_INSTALL  the pinned CLI makes no network call of its own and
//                                                                   never installs another version in the background
//   npm_config_offline                                              npx resolves hyperframes@<pin> from its cache only;
//                                                                   a missing cache fails loudly instead of downloading
//   GEMINI_API_KEY (removed)                                        `snapshot` would call a vision API when a key is set
// Set POST_ALLOW_NETWORK=1 once, on purpose, to let npx fill an empty cache (a first-time setup).
process.env.HYPERFRAMES_NO_TELEMETRY = '1';
process.env.HYPERFRAMES_NO_UPDATE_CHECK = '1';
process.env.HYPERFRAMES_NO_AUTO_INSTALL = '1';
if (process.env.POST_ALLOW_NETWORK !== '1') process.env.npm_config_offline = 'true';
delete process.env.GEMINI_API_KEY;
delete process.env.GOOGLE_API_KEY;
