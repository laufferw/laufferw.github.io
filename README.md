# laufferw.github.io

William Lauffer's personal site and journal, served by GitHub Pages at
[laufferw.github.io](https://laufferw.github.io).

The site is plain HTML, CSS, and JavaScript, with no build step. Journal entries live
in one JSON file and are rendered in the browser.

## Layout

| Path | What it is |
|------|------------|
| `index.html` | Home page: the latest journal entry |
| `posts/` | One static page per entry, generated from the journal |
| `archive.html` | All earlier entries |
| `data/journal.json` | Journal entries |
| `js/journal.js` | Renders entries from the JSON |
| `css/journal.css` | Site styles (Fraunces font, self-hosted in `fonts/`) |
| `rss.xml` | RSS feed, generated from the journal |

## Add a journal entry

1. Add an entry to `data/journal.json`, following the format in
   [journal-template.md](journal-template.md).
2. Regenerate the entry pages and the feed:
   `node scripts/generate-posts.mjs && node scripts/generate-rss.mjs`
3. Commit `data/journal.json`, `posts/`, and `rss.xml`, then push. Pages redeploys automatically.
