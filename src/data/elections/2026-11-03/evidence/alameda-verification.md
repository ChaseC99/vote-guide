# Alameda County — November 3, 2026

Verified November 2, 2026. **Partial county coverage, complete individual ballots:** the import includes every contest from each of the 46 actual sample ballot types printed in the county's composite guide. Other ballot types are not inferred from district lists or candidate rosters.

## Official source

Election page: https://acvote.alamedacountyca.gov/election-information/elections?id=260

The page's “Composite Voter Information Guide” links to:
https://acvote.alamedacountyca.gov/acvote-assets/02_election_information/PDFs/20261103/Voter%20Information%20Guide/vig_nov2026_eng.pdf

The 965-page PDF's sample ballot section is PDF pages 40–631. Each printed ballot type occupies 12 pages (cards A–C) or 16 pages (cards A–C plus RCV). A ballot side is split between consecutive guide pages. The 46 types have nonconsecutive printed BT numbers from BT1 through BT263; the guide does not establish coverage of every possible county type. Only the printed BT number is accepted; no precinct aliases are inferred.

## Output

alameda.json contains 46 styles, 122 new contests and 36 shared statewide contests. Individual ballots have 42–51 contests. New contests comprise 69 ordinary local candidate races, 15 ranked-choice races, 28 local measures, and ten congressional/legislative races. All 46 resolved ballots pass the application's county bundle and ballot schemas.

Each style's exact source pages, local offices, ranked offices, local measure letters, and contest count are recorded in alameda-style-audit.json. No candidate statement is used to determine whether a contest appears on a ballot.

Local measures retain the complete official English ballot question, explicitly labeled as such, rather than an inferred summary. Tax descriptions include the rates and durations printed by the county. Approval thresholds are omitted because they were not independently extracted from the full legal analyses. Measure DD concerns Newark's business license tax; II extends Union City's utility users tax.

Candidate names preserve printed capitalization. English ballot designations were reviewed in the bilingual extracted rows; two wrapped designations (Deena Kaplanis and Christiaan Vandenheuvel) join their first two English lines. Candidates with no printed designation are explicitly labeled “No ballot designation listed.”

Albany's proportional ranked-choice contests elect two City Council members and four Board of Education members; both allow five ranks. Berkeley allows five ranks even for its one-candidate auditor race. Oakland's printed rank limits vary from two to five and are retained per contest.

## Extraction and checks

The source omits Unicode maps for subset Arial fonts. Its extracted character codes are original font glyph IDs. alameda-font-maps.json records the corresponding Unicode mapping from the system's Arial/Arial Narrow fonts. extract-alameda.py restores ToUnicode maps in a local derivative and extracts text without changing visible content.

Raw extraction also contains masked text above/below each half-page, which otherwise duplicates candidates and instructions. extract-alameda-visible.py uses PDFium glyph origins, rendered line visibility, and column ordering to preserve only printed rows. It does not run OCR or infer names. Candidate race blocks are bounded by printed Vote-for instructions and Write-In fields. The parser checks that each repeated race has identical names and designations, and the builder verifies every candidate name against the source text. It also verifies all shared candidates and judicial names, all 14 state propositions, congressional/legislative districts, every local Vote-for instruction, every ranked contest and rank limit, and every local measure letter. All imported contests must be used by a style.

Visual checks of original PDF renders cover the first complete sample's font mapping and split-page ordering; Piedmont, Emeryville, and Newark candidate blocks and blank designations; Albany's two proportional races; Berkeley's five-rank auditor; Oakland's two- and four-rank races; and the II/DD tax questions. Review images are alameda-p*.png and alameda-review-0.png through alameda-review-2.png. All 220 distinct local candidate names and bilingual designation rows were also reviewed in the extraction output.

The extraction scripts and original PDF were reviewed in the import workspace; the repository retains the normalized data, source hashes, and per-style audit.
