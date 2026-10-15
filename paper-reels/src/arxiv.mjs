// Fetch paper metadata from the arXiv Atom API.
export function parseId(input) {
  const m = String(input).match(/(\d{4}\.\d{4,5})(v\d+)?/);
  if (!m) throw new Error(`Not an arXiv id or URL: ${input}`);
  return m[1];
}

const text = (xml, tag) => { const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)); return m ? m[1].replace(/\s+/g, ' ').trim() : ''; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export async function fetchPaper(input) {
  const id = parseId(input);
  const res = await fetch(`https://export.arxiv.org/api/query?id_list=${id}`);
  if (!res.ok) throw new Error(`arXiv API ${res.status}`);
  const xml = await res.text();
  const entry = xml.split('<entry>')[1];
  if (!entry) throw new Error(`No arXiv entry for ${id}`);
  return {
    arxiv_id: id,
    title: decode(text(entry, 'title')),
    authors: [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => decode(m[1].trim())),
    abstract: decode(text(entry, 'summary')),
    primary_cat: (entry.match(/<arxiv:primary_category[^>]*term="([^"]+)"/) || [])[1] || null,
    published: text(entry, 'published'),
    version: (entry.match(/<id>[^<]*\/abs\/\d{4}\.\d{4,5}(v\d+)<\/id>/) || [])[1] || null,
    url: `https://arxiv.org/abs/${id}`,
  };
}
