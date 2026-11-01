# Voter guide worksheet

A personal, neutral ballot worksheet built with Astro, React, and TypeScript. The supplied San Francisco November 3, 2026 mock contains **fictional contests and candidates**. Nothing in this project is an official ballot or a recommendation.

## Local development

Use Node.js 22.12+ (Node 24 recommended).

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

## Ballot content

Edit `src/data/ballot.json` and rebuild. Array order is ballot order; numbering and section counts are generated automatically. The schema in `src/data/schema.ts` validates the data during the build. Each contest has a stable ID and a URL slug; each candidate has a stable ID independent of their display name.

Supported contest types are `yesno`, `single`, `multi`, and `ranked`. Multi-choice and ranked contests declare a `max`. Source and candidate links use a label, an HTTPS URL (or `null` for an unavailable mock source), and an `arguments` or `sources` group. Do not invent source URLs for fictional ballot content.

Keep `isMock: true` while using sample content. When replacing it with a verified ballot, use a new ballot `id` so old mock selections cannot be restored into real contests. Remove the no-index meta tag in `src/layouts/Layout.astro` only when ready for public indexing.

## Design assets

Public Sans and IBM Plex Mono font files were extracted from the supplied standalone design mock and are served locally. Both font families are distributed under the SIL Open Font License. The visual design and sample ballot copy follow the supplied feature spec and mock.
