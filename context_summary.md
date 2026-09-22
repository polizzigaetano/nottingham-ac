# Context Summary

## Active Context
- Recently completed: registered 8 previously-missing blocks in the sidekick library (`tools/sidekick/library.json`); added a new `hero-card-dark` hero variant; fixed footer nav lists rendering as dash-separated text instead of real lists.
- Known open item: `tools/sidekick/library.html` has a race-condition bug causing "Invalid Configuration" in the sidekick Library plugin — diagnosed, fix proposed, not yet applied (deferred by user, not declined).
- Next up: nothing currently queued.

## Cross-Cutting Concerns
- Content migrated from the legacy nottingham.ac.uk site sometimes arrives as dash-separated `<p>` text (`- <a>...</a> - <a>...</a>`) instead of semantic `<ul><li>` lists, because the source site added the "-" purely via CSS. Any block consuming such fragments should normalize this in JS (see `blocks/footer/footer.js`) rather than assume authors will restructure content into real lists.
- The Franklin/xwalk components used by Universal Editor + Edge Delivery Services (`core/franklin/components/*`) are a simplified, separate set from AEM's classic Core WCM Components — classic-AEM features like Dynamic Media Smart Crop do not carry over, since EDS pages render statically via the edge/aem.live pipeline, not AEM's server-side rendering. Verify a classic-AEM feature actually applies to this component set before recommending it.

## Domain: Sidekick Tooling

### Gotchas
- `tools/sidekick/library.html` places `<sidekick-library></sidekick-library>` statically in markup and sets `.config` in a separate `<script type="module">` afterward. Module scripts execute in document order: `index.js` (external, defines the custom element) runs first and synchronously upgrades the already-parsed tag, firing `connectedCallback` — which reads `this.config` — before the second script has set it. Result: "Invalid Configuration" every time. Fix (matches aem.live's documented pattern): `document.createElement('sidekick-library')`, set `.config` on the detached element, then append it to the DOM — never place the tag statically in markup.
- Local dev server (`aem up`) crashes if this repo has a linked git worktree (e.g. `../nottingham-ac.worktrees/*`) with a stale fsmonitor socket under `.git/worktrees/<name>/fsmonitor--daemon.ipc` — chokidar can't watch Unix sockets on macOS. Workaround: run `aem up` from a throwaway rsync copy of the project (excluding `.git`/`node_modules`, `node_modules` symlinked, fresh `git init` + real `origin` remote added) instead of touching the real `.git` internals.

## Domain: Footer Block

### Decisions
- `blocks/footer/footer.js` normalizes dash-separated link paragraphs into real `<ul><li>` lists via a `dashParagraphToList()` helper, applied to the contact/social row, the four nav columns, and the legal bar, since the migrated footer fragment isn't authored as semantic lists. (2026-09-22)

### Gotchas
- The Alumni "Community" link's `<a>` boundary is a content typo in the CMS — the href only wraps "Communit", with "y" as a trailing text node. `dashParagraphToList()` reattaches the "y" to the same `<li>` so it *displays* correctly, but the link's clickable area still only covers "Communit". Needs a content fix, not a code fix.
- The social-icons row (facebook/instagram/linkedin/youtube/tiktok) is currently absent from the footer fragment's content entirely (no `<img>`/`<ul>` in section 0) — not a rendering bug, just missing content.

## Closed Work Streams
- Sidekick library: registered 8 previously-missing blocks in `tools/sidekick/library.json` — commit `d9492eb`.
- `hero-card-dark` block: new hero variant with an opaque navy card overlapping the top of the background image, built from `hero-minimal-dark-2` — commit `aa60d9c`.
- Footer dash-list fix — commit `f74548b`.
