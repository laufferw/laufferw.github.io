const entries = [
  {
    title: 'Why this journal exists',
    date: '2026-02-14',
    body: [
      'I want this space to feel more like a workbench than a portfolio.',
      'This is where I capture what I am building, what I am learning, and where I get stuck.',
      'The goal is consistency, not polish.'
    ],
    topics: ['journal', 'meta']
  },
  {
    title: 'forHumanity reached operational baseline',
    date: '2026-02-14',
    body: [
      'Shipped CI, hardening, observability, backup/recovery, and launch checklists.',
      'The biggest shift: this stopped being “just code” and became an operable system.',
      'Next question is user adoption and real-world feedback loops.'
    ],
    topics: ['forhumanity', 'build-log', 'ops']
  },
  {
    title: 'What I want to explore next',
    date: '2026-02-14',
    body: [
      'I am interested in building practical AI operators that help run projects end to end.',
      'Not demos. Systems that can deploy, monitor, and recover.',
      'This journal is where those experiments will be tracked.'
    ],
    topics: ['ai', 'ideas', 'exploration']
  }
];

const allTopics = ['all', ...new Set(entries.flatMap((e) => e.topics))];
let active = 'all';

const topicsEl = document.getElementById('topics');
const entriesEl = document.getElementById('entries');

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

    article.innerHTML = `
      <h2>${entry.title}</h2>
      <div class="meta">${entry.date}</div>
      ${entry.body.map((p) => `<p>${p}</p>`).join('')}
      <div class="topics">
        ${entry.topics.map((t) => `<span class="topic-chip">${t}</span>`).join('')}
      </div>
    `;

    entriesEl.appendChild(article);
  });
}

renderTopics();
renderEntries();
