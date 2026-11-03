# November 3, 2026 county imports

Run `npm run data:coverage` from the repository root for the current county-by-county report. A county directory entry is **not** an imported ballot. Counties without verified imports retain an official election-office link. `partial` means the listed styles are complete ballots, but other county styles are missing.

The current import contains 3,109 ballot types across 15 counties. Complete published type sets are loaded for Inyo, Los Angeles, Merced, Mono, Placer, Riverside, San Diego, San Joaquin, Santa Clara, Sonoma, and Yolo. Alameda, Lassen, Marin, and San Francisco have the limited coverage described below. The other 43 counties still need verified ballot mappings and content.

Los Angeles includes all 892 groups in the county's public GIS index, mapped through its public Interactive Sample Ballot files. San Diego includes all 753 types in the official election precinct index, checked against 6,024 actual sample-ballot pages; use the right-hand `SD` footer code, not shared `SB` page identifiers. Yolo includes all 37 voter types and 64 voter precincts in its published index, with candidate lists, vote limits, and six local measure questions independently checked against county filings pages. Evidence and source hashes are saved alongside the other county audits.

## Adding or refreshing a county

Place one reviewed JSON bundle at `counties/<county-id>.json`. The build discovers it automatically; no route or component changes are needed. `src/data/countyBundle.ts` validates the bundle and resolves explicit shared contest references. `src/data/catalog.ts` builds the public matching catalog and static worksheets.

Each bundle contains:

- County ID/name, jurisdiction, election ID, verification date, official source and sample-ballot links.
- Explicit `complete` or `partial` coverage and a plain-language coverage note.
- Official ballot codes, verified aliases, full contest membership for each code, and any verified district numbers.
- Full new contest records with candidates, party preferences, ballot designations, voting limits, and source links.
- `sharedContestIds` for individually verified statewide/regional contests already in `src/data/ballot.json`. Sharing is explicit; SF local contests cannot be reused.
- Optional `screeningContestId`, which must appear on every loaded style.

Use the actual sample ballots or an official ballot-type-to-contest cross-reference. A countywide candidate list alone does not establish which contests appear on a particular ballot. Do not treat precinct numbers as ballot codes without an explicit mapping. PDF page numbers, filename codes, printed ballot codes, and internal GIS IDs can differ.

Check the election date, every page/card, all candidates and vote limits, all judicial questions, all propositions, and local measures. Review rotated candidate order, short versus full terms, blank designations, and write-in-only offices. An office with no printed candidates can use `type: "single"`, `writeInOnly: true`, and `candidates: []` only when verified against the sample. An ordinary empty candidate list fails validation.

Record the source URLs, downloaded-file SHA-256 hashes where available, and verification notes in `evidence/`. Large original PDFs are not shipped to visitors or checked into this repository. Sources are linked from the worksheet. A change to an official source requires rechecking the normalized content; hashes document the reviewed edition, not freshness.

Before publishing an update:

```sh
npm run data:coverage
npm test
npm run check
npm run build
```

Tests resolve every imported ballot, reject missing/duplicate content and aliases, and exercise guided matching against every known contest set. They validate the import structure and behavior; human source review is still required for new election content.

## Remaining source work

The statewide certified candidate list does not supply complete local ballots or county ballot codes. The remaining counties need verified sample-ballot sets or official code-to-contest cross-references plus candidate and measure content. Missing imports are not populated with statewide-only worksheets.

During this import, some public sources were inaccessible or insufficient. Glenn returned 403; Shasta's guide index returned an empty response. The reviewed Butte, Humboldt, Sierra, Solano, Trinity, and San Luis Obispo guides did not supply complete sample ballots. Nevada and San Bernardino's accessible guide viewers required a voter name and birth date, and their public election metadata requests returned 401. Those personal lookup flows were not used. Alpine's page did not supply a sample ballot. These are observations from this research pass, not a claim that those counties have no usable data. Other unimported counties remain unverified.

Mono uses the county's **amended** guides because the county reported errors in the originally mailed guides. Alameda is limited to the 46 complete samples in its composite guide. Lassen is limited to the six exact sample groups in its composite guide. Marin currently includes ballot types 10, 53, 56, and 84. San Francisco excludes school-board-only ballots.

Sacramento's examined public guide interface requires voter registration details before returning the guide filename; no identity lookup was used. Napa likewise requires a voter login. Contra Costa's public maps establish district boundaries but do not supply a verified ballot-type-to-contest mapping. A published Monterey vendor configuration pointed to a 2025 election and was rejected after checking the actual ballot metadata. Detailed research findings describe only the sources examined, not the absence of other possible public sources.
