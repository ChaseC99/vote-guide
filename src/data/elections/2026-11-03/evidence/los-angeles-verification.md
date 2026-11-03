# Los Angeles — November 3, 2026

Verified November 2, 2026. **Complete: all 892 official ballot groups.**

The Los Angeles County Registrar-Recorder/County Clerk publishes its current election-precinct index through [its official GIS service](https://services.arcgis.com/RmCCgQtiZLDCtblq/arcgis/rest/services/Registrar_Recorder_Precincts_Election/FeatureServer/0). A distinct `BallotGroup` query returned 892 groups (1–892), with no transfer-limit truncation. One representative public precinct per group was obtained with grouped GIS statistics. The index item is owned by `RRCCgis_lacounty`, describes election-specific consolidated precincts, and states an August 31, 2026 data update.

For every group, the public `https://isb.lavote.gov/parsed/4348/precincts/{precinct}.json` maps the precinct to an internal ballot ID. The corresponding `ballots/{id}.json` explicitly identifies the group (`NP_0001` etc.), election ID 4348, jurisdiction 06037, and ordered contest references. Every candidate ID in every ballot matches its full official contest definition. This is a public sample-ballot data chain; no personal voter lookup was used.

[Official election metadata](https://isb.lavote.gov/parsed/4348/election.json) states `2026-11-03T00:00:00Z`, jurisdiction `06037`, and BDF version `GE26.12.28`. [The county's information page](https://www.lavote.gov/home/voting-elections/voting-options/interactive-sample-ballot) links the [Interactive Sample Ballot](https://isb.lavote.gov/).

After the complete download, the election metadata and distinct GIS group index were fetched again and matched the initial JSON exactly: **True**. This checks that the official election version and published group coverage did not change during import.

## Import

- 892 complete styles; 385 county-sourced new contests plus 24 verified shared statewide contests.
- 52–68 contests per style.
- Canonical codes are the exact numeric GIS ballot groups; aliases are the exact ISB `NP_####` group strings. Precinct identifiers are not aliases.
- Statewide candidate names, ballot designations, party labels, and vote limits match the shared source data. State proposition numbers and Supreme Court retention names are verified.
- Candidate order rotates across some groups. The exact candidate membership is verified per group; one canonical official contest-level order is used for display. Rotations do not create different contest identities.
- Named candidates are imported verbatim. Official write-in placeholders are not fictional candidates. Write-in slot counts are retained in evidence; an actually empty single-seat named candidate set would require explicit `writeInOnly` support.
- Measure summaries retain the official ballot question/fiscal text; named supporter/opponent sections are omitted. No campaign statements or recommendations are included.
- Every positive integer vote limit and every official yes/no choice is checked. No address lookup, voter identity, or geographic inference is used to choose ballots.

## Reproducibility

`download-la.py` fetches the official GIS mappings, ballots, and contest definitions with one request at a time and a 1.3-second pause, stopping on any HTTP/non-JSON failure. It reuses cached files.

`la-official/style-index.json` records every group → precinct → ballot chain. `la-official/fetch-index.json` records official URLs and SHA-256 hashes. `los-angeles-evidence.json` records metadata hashes, checks, rotations, write-in counts, and shared ID mapping.

`build-la.py` requires all 892 expected GIS groups before producing `los-angeles.json`. `validate-la.mjs` runs the repository's actual `resolveCountyBundle`, contest schema, and ballot schema for every style, rejecting missing/orphan/duplicate content and aliases.
