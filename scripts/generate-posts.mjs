// Writes one static page per journal entry to posts/<slug>.html, so links
// shared on LinkedIn, Slack, etc. get a real title, description, and preview,
// and search engines can read the text without running JavaScript.
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dataPath = path.join(root, 'data', 'journal.json');
const outDir = path.join(root, 'posts');

const siteUrl = 'https://laufferw.github.io';
const siteName = 'William Lauffer';

const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const entries = (raw.entries || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Must match entrySlug in js/journal.js and the slug in scripts/generate-rss.mjs.
const slugOf = (e) => `${e.date}-${e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

// Same rules as renderBody in js/journal.js. Body text is trusted HTML.
const renderBody = (body) =>
  body.map((p) => (p.startsWith('## ') ? `<h3>${p.slice(3)}</h3>` : `<p>${p}</p>`)).join('\n      ');

// First paragraph as plain text, cut to about 160 characters on a word boundary.
function summary(entry) {
  const first = (entry.body || []).find((p) => !p.startsWith('## ')) || '';
  const text = first.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  return text.slice(0, 157).replace(/\s+\S*$/, '') + '...';
}

function page(entry, newer, older) {
  const slug = slugOf(entry);
  const url = `${siteUrl}/posts/${slug}.html`;
  const title = `${entry.title} | ${siteName}`;
  const desc = summary(entry);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${esc(siteName)}" />
  <meta property="og:title" content="${esc(entry.title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${siteUrl}/icon-512x512.png" />
  <meta property="article:published_time" content="${entry.date}" />
  <meta name="twitter:card" content="summary" />
  <link rel="icon" href="../favicon.ico" />
  <link rel="manifest" href="../site.webmanifest" />
  <link rel="alternate" type="application/rss+xml" title="William's Journal" href="../rss.xml" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#d0c7b7" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#2a2621" media="(prefers-color-scheme: dark)" />
  <link rel="stylesheet" href="../css/modern_normalize.css" />
  <link rel="preload" href="../fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="../css/journal.css" />
</head>
<body>
  <div class="wrap">
    <header>
      <h1>William Lauffer</h1>
      <p class="sub">Builder. Things I am making, learning, and figuring out.</p>
      <nav class="site-nav"><a href="../">Latest</a> · <a href="../archive.html">Archive</a> · <a href="../rss.xml">RSS</a></nav>
    </header>

    <main>
      <article class="entry" id="${slug}">
      <h2>${esc(entry.title)}</h2>
      <div class="meta"><a href="${slug}.html">${entry.date}</a></div>
      ${renderBody(entry.body || [])}
      </article>
      <nav class="post-nav">
        ${newer ? `<a href="${slugOf(newer)}.html">&larr; Newer: ${esc(newer.title)}</a>` : '<span></span>'}
        ${older ? `<a href="${slugOf(older)}.html">Older: ${esc(older.title)} &rarr;</a>` : ''}
      </nav>
    </main>

    <footer>
      <p class="foot">
        <a href="https://github.com/laufferw" target="_blank">GitHub</a> ·
        <a href="https://linkedin.com/in/williamlauffer" target="_blank">LinkedIn</a>
      </p>
    </footer>
  </div>
</body>
</html>
`;
}

// Rebuild from scratch so renamed or deleted entries don't leave stale pages.
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir);
entries.forEach((entry, i) => {
  fs.writeFileSync(path.join(outDir, `${slugOf(entry)}.html`), page(entry, entries[i - 1], entries[i + 1]));
});
console.log(`Generated ${entries.length} pages in ${outDir}`);
