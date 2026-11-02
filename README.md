# Voter guide worksheet

A personal, neutral ballot worksheet built with Astro, React, and TypeScript. It contains the **November 3, 2026 San Francisco election** for Congressional District 11, Assembly District 19, Supervisorial District 7, and BART District 8. Nothing in this project is an official ballot or a recommendation.

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
- Print / PDF offers selections alone or selections with notes. The print stylesheet hides application controls and formats the 55-contest worksheet as a compact list across pages. Long notes can extend beyond one page without truncation.

## Source layout and verification

`src/pages/` provides static Astro entry points, `src/components/` contains the React interface, `src/lib/selections.ts` holds voting and restoration rules, and `src/styles/global.css` contains responsive and print styles. Use `npm run format` for consistent formatting.

`npm test` covers choice replacement, selection limits, rank reassignment, skipped ranks, restoration, print ordering, and invalid content. Type checking and a static production build are available through `npm run check` and `npm run build`.

Browser checks cover desktop and 320px phone layouts, saved selections and notes after refresh, browser Back, the worksheet return marker, Notes navigation, and the print-options dialog. Native print-preview rendering still needs a manual check in your preferred browser; the automated browser could not inspect that system dialog.

## Ballot content

Edit `src/data/ballot.json` and rebuild. Array order is worksheet order, grouped into Federal, State, and Local; it does not reproduce the order on a printed ballot. Numbering and section counts are generated automatically. The schema in `src/data/schema.ts` validates the data during the build. Each contest has a stable ID and a URL slug; each candidate has a stable ID independent of their display name.

Supported contest types are `yesno`, `single`, `multi`, and `ranked`. Multi-choice and ranked contests declare a `max`. Source and candidate links use a label, an HTTPS URL (or `null` for an unavailable mock source), and an `arguments` or `sources` group. Do not invent source URLs for fictional ballot content.

The active ballot uses `isMock: false` and a new ballot ID, isolating it from the old demo's saved selections. The old data exists only as a test fixture. Real ballots require provenance and an official source for every contest. Keep the no-index meta tag in `src/layouts/Layout.astro` until ready for public indexing.

### November 2026 verification

Sources checked November 1, 2026:

- [SF district lookup](https://sfelections.org/tools/districts_lookup/) matched Congressional 11, Assembly 19, Senate 11, Board of Equalization 2, Supervisor 7, and BART 8. Only district numbers are stored; the residential address is not included in source or generated pages.
- [SF voter pamphlet](https://media.api.sf.gov/documents/N26_EN_VIP.pdf), printed page 4, establishes the contest inventory: no supervisor race in odd-numbered districts, BART District 8 on the ballot, and distinct full-term and partial-term City College races. PDF source links use physical page numbers (printed page + 2).
- [California certified candidate list](https://elections.cdn.sos.ca.gov/statewide-elections/2026-general/cert-list-candidates.pdf) supplies the state/federal candidate names, party preferences, ballot designations, and all 13 judicial retention questions (Supreme Court and First Appellate District).
- [SF qualified candidates](https://www.sf.gov/candidates-november-3-2026-general-election) and [official local ballot designations](https://api.sf.gov/documents/63094/November_2026_Local_Office_Names_and_Ballot_Designations.pdf) supply the local candidate lists. The city listed no qualified write-in candidates when checked. Assessor-Recorder and Public Defender retain ranked-choice controls with one listed candidate; this worksheet offers that candidate's first rank and does not reproduce unused columns from the paper ballot.
- [California voter guide](https://voterguide.sos.ca.gov/propositions/) supplies all 14 state measures (1–5 and 37–45). SF's impartial digests supply Regional Measure RTM and local measures A–J. Summaries describe the proposals neutrally; arguments and candidate statements are linked separately.

The 55 contests comprise 17 candidate races, 13 judicial retention questions, and 25 measures. `tests/ballot.test.ts` checks the inventory, district exclusions, separate City College terms, real-data selection/restoration, source requirements, and isolation from demo storage. Compare this worksheet with the official ballot before voting; candidate order can differ, and the district lookup does not verify voter registration.

## Design assets

Public Sans and IBM Plex Mono font files were extracted from the supplied standalone design mock and are served locally. Both font families are distributed under the SIL Open Font License; notices are included in `public/fonts/`. The visual design and sample ballot copy follow the supplied feature spec and mock.
