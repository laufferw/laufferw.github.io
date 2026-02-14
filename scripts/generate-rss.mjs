import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dataPath = path.join(root, 'data', 'journal.json');
const outPath = path.join(root, 'rss.xml');

const siteUrl = 'https://laufferw.github.io';
const siteTitle = "William's Journal";
const siteDesc = 'A diary + space for exploration.';

const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const entries = (raw.entries || [])
  .slice()
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 50);

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const items = entries
  .map((e, idx) => {
    const slug = `${e.date}-${e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    const link = `${siteUrl}/#${slug}`;
    const description = esc((e.body || []).join(' '));
    const pubDate = new Date(e.date + 'T00:00:00Z').toUTCString();
    return `
    <item>
      <title>${esc(e.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
  })
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${esc(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${esc(siteDesc)}</description>
    <language>en-us</language>${items}
  </channel>
</rss>
`;

fs.writeFileSync(outPath, rss);
console.log('Generated', outPath);
