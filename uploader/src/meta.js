const axios = require('axios');
const { GRAPH_VERSION } = require('./config');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const apiError = (e) => new Error(JSON.stringify(e.response?.data?.error || e.message));

async function waitUntilReady(base, containerId, token, maxTries = 40, intervalMs = 5000) {
  for (let i = 0; i < maxTries; i++) {
    await sleep(intervalMs);
    // IG exposes status_code; Threads exposes status. Ask for both.
    const { data } = await axios.get(`${base}/${containerId}`, {
      params: { fields: 'status_code,status', access_token: token },
    });
    const s = data.status_code || data.status;
    if (s === 'FINISHED') return;
    if (s === 'ERROR' || s === 'EXPIRED') throw new Error(`Container ${s}: ${data.status || ''}`);
  }
  throw new Error('Timed out waiting for video processing');
}

/** Publish a Reel. videoUrl and coverUrl must be public. */
async function uploadInstagram({ videoUrl, coverUrl, caption }) {
  const id = process.env.IG_ACCOUNT_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!id || !token) throw new Error('IG_ACCOUNT_ID / META_ACCESS_TOKEN not set');
  const base = `https://graph.facebook.com/${GRAPH_VERSION}`;
  try {
    const params = { access_token: token, media_type: 'REELS', video_url: videoUrl, caption: caption || '' };
    if (coverUrl) params.cover_url = coverUrl;
    const { data: c } = await axios.post(`${base}/${id}/media`, null, { params });
    await waitUntilReady(base, c.id, token);
    const { data: pub } = await axios.post(`${base}/${id}/media_publish`, null, {
      params: { creation_id: c.id, access_token: token },
    });
    // The media id is not a valid /p/ shortcode, so ask the API for the real permalink.
    const { data: m } = await axios.get(`${base}/${pub.id}`, { params: { fields: 'permalink', access_token: token } });
    return m.permalink;
  } catch (e) {
    throw e.response ? apiError(e) : e;
  }
}

/**
 * Publish a feed carousel of 2 to 10 images and videos. items: [{ kind: 'image' | 'video', url, alt }] in slide order, every url public.
 * Each child container has is_carousel_item=true and no caption (Meta does not support one there); the caption goes on the CAROUSEL container.
 * An image container is ready when the call returns, so only video children and the carousel container are polled. Polling is every
 * pollMs for up to maxTries (5 s and 60 tries: 5 minutes, the longest Meta recommends). alt_text is sent only with altText: true.
 * Returns the permalink. An error with published = true means the carousel is live but the permalink lookup failed (err.mediaId);
 * outcomeUnknown = true means media_publish got no response, so the carousel may be live.
 */
async function uploadInstagramCarousel({ items, caption, altText = false, pollMs = 5000, maxTries = 60 }) {
  const id = process.env.IG_ACCOUNT_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!id || !token) throw new Error('IG_ACCOUNT_ID / META_ACCESS_TOKEN not set');
  if (!Array.isArray(items) || items.length < 2 || items.length > 10) throw new Error('A carousel needs 2 to 10 items');
  items.forEach((it, i) => { if (!it || !['image', 'video'].includes(it.kind) || !it.url) throw new Error(`Carousel item ${i + 1} needs kind image or video and a public url`); });
  const base = `https://graph.facebook.com/${GRAPH_VERSION}`;
  const about = (e, what) => new Error(`${what}: ${e.response ? apiError(e).message : e.message}`);
  const children = [];
  try {
    for (const [i, it] of items.entries()) {
      const params = { access_token: token, is_carousel_item: true };
      if (it.kind === 'video') { params.media_type = 'VIDEO'; params.video_url = it.url; }
      else { params.image_url = it.url; if (altText && it.alt) params.alt_text = String(it.alt).slice(0, 1000); }
      try {
        const { data: c } = await axios.post(`${base}/${id}/media`, null, { params });
        children.push(c.id);
      } catch (e) { throw about(e, `carousel item ${i + 1} of ${items.length} (${it.kind}): container not created`); }
    }
    for (const [i, it] of items.entries()) {
      if (it.kind !== 'video') continue;
      try { await waitUntilReady(base, children[i], token, maxTries, pollMs); }
      catch (e) { throw about(e, `carousel item ${i + 1} of ${items.length} (video, container ${children[i]})`); }
    }
    const { data: car } = await axios.post(`${base}/${id}/media`, null, {
      params: { access_token: token, media_type: 'CAROUSEL', children: children.join(','), caption: caption || '' },
    });
    try { await waitUntilReady(base, car.id, token, maxTries, pollMs); }
    catch (e) { throw about(e, `carousel container ${car.id}`); }
    let pub;
    try {
      ({ data: pub } = await axios.post(`${base}/${id}/media_publish`, null, { params: { creation_id: car.id, access_token: token } }));
    } catch (e) {
      if (e.response) throw e;
      const err = new Error(`media_publish got no response, so the carousel may be live. Check the Instagram profile before trying again: ${e.message}`);
      err.outcomeUnknown = true;
      throw err;
    }
    try {
      const { data: m } = await axios.get(`${base}/${pub.id}`, { params: { fields: 'permalink', access_token: token } });
      return m.permalink;
    } catch (e) {
      const err = about(e, `The carousel is live (media id ${pub.id}) but the permalink lookup failed`);
      err.published = true;
      err.mediaId = pub.id;
      throw err;
    }
  } catch (e) {
    throw e.response ? apiError(e) : e;
  }
}

/** Publish a video post to Threads. videoUrl must be public. */
async function uploadThreads({ videoUrl, text }) {
  const id = process.env.THREADS_USER_ID;
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!id || !token) throw new Error('THREADS_USER_ID / THREADS_ACCESS_TOKEN not set');
  const base = 'https://graph.threads.net/v1.0';
  try {
    const { data: c } = await axios.post(`${base}/${id}/threads`, null, {
      params: { media_type: 'VIDEO', video_url: videoUrl, text: (text || '').slice(0, 500), access_token: token },
    });
    await waitUntilReady(base, c.id, token);
    const { data: pub } = await axios.post(`${base}/${id}/threads_publish`, null, {
      params: { creation_id: c.id, access_token: token },
    });
    const { data: m } = await axios.get(`${base}/${pub.id}`, { params: { fields: 'permalink', access_token: token } });
    return m.permalink;
  } catch (e) {
    throw e.response ? apiError(e) : e;
  }
}

module.exports = { uploadInstagram, uploadInstagramCarousel, uploadThreads };
