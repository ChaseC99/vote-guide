# San Joaquin County — November 3, 2026

Verified November 2, 2026 against the county's official documents. Coverage is complete: all 131 ballot types in the county's published regular-precinct cross-reference occur in the composite's four-page sample ballots. No district-to-ballot assignment is inferred from a candidate roster.

## Official sources

- Election landing page: https://www.sjgov.org/department/rov/election-information/current_election
- Composite county voter information guide: https://www.sjgov.org/docs/default-source/registrar-of-voters-documents/elections/gubernatorial-general-election-2026/current-election/sj-composite-eng-%281%29.pdf?sfvrsn=98168b81_1
- Precinct cross-reference: https://www.sjgov.org/docs/default-source/registrar-of-voters-documents/elections/gubernatorial-general-election-2026/current-election/2026-general-election-voting-precinct-to-regular-precinct-association-list.pdf?sfvrsn=d53c63f9_1

## Import and verification

The 602-page composite contains 131 full sample ballots on PDF pages 16–539, four consecutive pages per ballot. The printed codes are BT 001 through BT 131 and sample-page codes SB-001-1-ENG through SB-131-4-ENG. The official cross-reference maps 1,180 unique seven-digit regular precincts to exactly those 131 ballot types. Leading zeros in precinct numbers are preserved. Aliases include the numeric type, BT form, complete printed sample-page codes, and exact regular precinct numbers.

Each resolved ballot contains 34–40 contests. The bundle adds 56 contests: 37 local candidate elections (33 single-choice, four multi-seat), four local measures, five congressional races, two Assembly races, Board of Equalization District 1, and seven Third Appellate District retention votes. It references 24 existing statewide contests: seven statewide executive offices, superintendent, two Supreme Court retention votes, and 14 state propositions.

The builder checks all four printed page numbers and BT codes; all state proposition numbers; nine judicial questions and justice names; congressional and Assembly districts with each candidate/occupation/party; every local candidate block, ballot title, occupation, and vote limit; total vote instructions; all measure letters; precinct uniqueness and exact ballot-type coverage. After removing every recognized local contest, the remaining local ballot text must be empty. Unknown content or changed candidate blocks cause an assertion failure rather than silently omitting a race.

Visual checks of rendered official pages cover every unique local candidate election and all multi-seat limits. Contact sheets sj-review-0.png, sj-review-1.png, sj-review-2.png and individual sj-p*.png retain these checks. Shared statewide offices and representative legislative districts were also checked visually. Rendering resolves extraction artifacts such as letter spacing and wrapped names.

Local bond measure summaries and 55% thresholds were checked against the printed questions and county full text/impartial analyses: T (Lodi Unified, PDF pages 578–582), U (Escalon Unified, 583–586), G (Galt Joint Union High, 588–592), V (Lincoln Unified, 593–596). Summaries state the bond amount, estimated taxes, purpose, and oversight; they do not reproduce campaign arguments.

All 131 resolved ballots passed the application's resolveCountyBundle and ballotSchema validation. Canonical and alias codes are unique and every imported contest is used.

## Refreshing the snapshot

The checked-in bundle is the reviewed normalized snapshot. Re-download the official composite and cross-reference, compare their hashes with this edition, and review every changed ballot before replacing it. The style audit records sample pages, local contests, measures, and exact precinct aliases. Run the repository coverage report, tests, type check, and production build after updating.
