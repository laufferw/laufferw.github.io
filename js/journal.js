let entries = [];
let allTopics = ['all'];
let active = 'all';

const topicsEl = document.getElementById('topics');
const entriesEl = document.getElementById('entries');

// Must match the slug in scripts/generate-rss.mjs so feed links land on the entry.
function entrySlug(entry) {
  const title = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${entry.date}-${title}`;
}

function scrollToHashEntry() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  if (active !== 'all' && !document.getElementById(id)) {
    active = 'all';
    renderTopics();
    renderEntries();
  }
  const el = document.getElementById(id);
  if (!el) return;
  // :target doesn't match entries rendered after load, so mark it ourselves.
  document.querySelectorAll('.entry.is-target').forEach((e) => e.classList.remove('is-target'));
  el.classList.add('is-target');
  el.scrollIntoView();
}

function renderTopics() {
  topicsEl.innerHTML = '';
  allTopics.forEach((topic) => {
    const btn = document.createElement('button');
    btn.className = `tag ${topic === active ? 'active' : ''}`;
    btn.textContent = topic;
    btn.onclick = () => {
      active = topic;
      renderTopics();
      renderEntries();
    };
    topicsEl.appendChild(btn);
  });
}

function renderEntries() {
  const filtered = active === 'all' ? entries : entries.filter((e) => e.topics.includes(active));
  entriesEl.innerHTML = '';

  filtered.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'entry';
    article.id = entrySlug(entry);

    article.innerHTML = `
      <h2>${entry.title}</h2>
      <div class="meta"><a href="#${article.id}">${entry.date}</a></div>
      ${entry.body.map((p) => `<p>${p}</p>`).join('')}
      <div class="topics">
        ${entry.topics.map((t) => `<span class="topic-chip">${t}</span>`).join('')}
      </div>
    `;

    entriesEl.appendChild(article);
  });
}

async function loadJournal() {
  const res = await fetch('data/journal.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load journal data (${res.status})`);

  const payload = await res.json();
  entries = (payload.entries || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  allTopics = ['all', ...new Set(entries.flatMap((e) => e.topics || []))];

  renderTopics();
  renderEntries();
  scrollToHashEntry();
}

window.addEventListener('hashchange', scrollToHashEntry);

loadJournal().catch((err) => {
  console.error(err);
  entriesEl.innerHTML = '<p>Could not load journal entries right now.</p>';
});
