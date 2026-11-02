# Voter guide worksheet

A personal, neutral ballot worksheet built with Astro, React, and TypeScript. The supplied San Francisco November 3, 2026 mock contains **fictional contests and candidates**. Nothing in this project is an official ballot or a recommendation.

## Local development

Use Node.js 22.23.4+ (Node 24 recommended; `.nvmrc` is provided).

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro. No account, server database, analytics, or external font service is required.

```sh
npm run check
npm test
npm run build
npm run preview
```

`dist/` is the static site output. Deployment is intentionally left to the repository owner.

## Implemented flows

- A full worksheet becomes a desktop side panel when a contest opens. Escape or Expand returns to all contests.
- Each contest has a statically generated URL under `/contest/`. Browser Back and direct-link refresh work without a server-side routing fallback.
- Yes/No and single-choice contests toggle one selection. Multiple choice enforces its declared limit. Ranked choice moves an occupied rank to the new candidate and retains skipped ranks.
- On phones, the header has section progress ticks and All navigation; the bottom bar has Previous, Notes, Next, and quick Yes/No controls. The final contest leads to `/complete/`.
- Selections and notes save immediately in `localStorage`, using a versioned key specific to the ballot. No initial write happens before restoration. Invalid candidate IDs and ranks are discarded during restoration; unavailable storage produces a visible warning.
- About saving & privacy explains storage and offers an erase action with confirmation. Erasing affects this ballot only.
- Print / PDF offers selections alone or selections with notes. The print stylesheet hides application controls and formats the nine-contest sample as a compact list. Long notes can extend beyond one page without truncation.

## Source layout and verification

`src/pages/` provides static Astro entry points, `src/components/` contains the React interface, `src/lib/selections.ts` holds voting and restoration rules, and `src/styles/global.css` contains responsive and print styles. Use `npm run format` for consistent formatting.

`npm test` covers choice replacement, selection limits, rank reassignment, skipped ranks, restoration, print ordering, and invalid content. Type checking and a static production build are available through `npm run check` and `npm run build`.

Browser checks cover desktop and 320px phone layouts, saved selections and notes after refresh, browser Back, the worksheet return marker, Notes navigation, and the print-options dialog. Native print-preview rendering still needs a manual check in your preferred browser; the automated browser could not inspect that system dialog.

## Ballot content

Edit `src/data/ballot.json` and rebuild. Array order is ballot order; numbering and section counts are generated automatically. The schema in `src/data/schema.ts` validates the data during the build. Each contest has a stable ID and a URL slug; each candidate has a stable ID independent of their display name.

Supported contest types are `yesno`, `single`, `multi`, and `ranked`. Multi-choice and ranked contests declare a `max`. Source and candidate links use a label, an HTTPS URL (or `null` for an unavailable mock source), and an `arguments` or `sources` group. Do not invent source URLs for fictional ballot content.

Keep `isMock: true` while using sample content. When replacing it with a verified ballot, use a new ballot `id` so old mock selections cannot be restored into real contests. Remove the no-index meta tag in `src/layouts/Layout.astro` only when ready for public indexing.

## Design assets

Public Sans and IBM Plex Mono font files were extracted from the supplied standalone design mock and are served locally. Both font families are distributed under the SIL Open Font License; notices are included in `public/fonts/`. The visual design and sample ballot copy follow the supplied feature spec and mock.
