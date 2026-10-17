// Shared by index.html (one post) and archive.html (list of all posts).
let entries = [];

const postEl = document.getElementById('post');
const archiveEl = document.getElementById('archive');

// Must match the slug in scripts/generate-rss.mjs so feed links land on the entry.
function entrySlug(entry) {
  const title = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${entry.date}-${title}`;
}

function renderBody(body) {
  return body.map((p) => (p.startsWith('## ') ? `<h3>${p.slice(3)}</h3>` : `<p>${p}</p>`)).join('');
}

// Show the post named in the URL hash, or the newest post if there isn't one.
function renderPost() {
  const id = decodeURIComponent(location.hash.slice(1));
  let index = entries.findIndex((e) => entrySlug(e) === id);
  if (index === -1) index = 0;

  const entry = entries[index];
  const newer = entries[index - 1];
  const older = entries[index + 1];
  const slug = entrySlug(entry);

  postEl.innerHTML = `
    <article class="entry" id="${slug}">
      <h2>${entry.title}</h2>
      <div class="meta"><a href="#${slug}">${entry.date}</a></div>
      ${renderBody(entry.body)}
    </article>
    <nav class="post-nav">
      ${newer ? `<a href="#${entrySlug(newer)}">&larr; Newer: ${newer.title}</a>` : '<span></span>'}
      ${older ? `<a href="#${entrySlug(older)}">Older: ${older.title} &rarr;</a>` : ''}
    </nav>
  `;
  document.title = index === 0 && !id ? 'William Lauffer' : `${entry.title} | William Lauffer`;
  window.scrollTo(0, 0);
}

function renderArchive() {
  archiveEl.innerHTML = `<ul class="archive-list">${entries
    .map((e) => `<li><span class="archive-date">${e.date}</span><a href="./#${entrySlug(e)}">${e.title}</a></li>`)
    .join('')}</ul>`;
}

async function loadJournal() {
  const res = await fetch('data/journal.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load journal data (${res.status})`);

  const payload = await res.json();
  entries = (payload.entries || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (archiveEl) {
    renderArchive();
  } else {
    renderPost();
    window.addEventListener('hashchange', renderPost);
  }
}

loadJournal().catch((err) => {
  console.error(err);
  (postEl || archiveEl).innerHTML = '<p>Could not load journal entries right now.</p>';
});
