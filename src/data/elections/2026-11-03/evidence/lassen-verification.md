# Lassen November 3, 2026 sample import

Official county landing: https://www.lassencounty.gov/194/Elections
Official guide linked as Local Voter Information Guide: https://www.lassencounty.gov/DocumentCenter/View/3261
Verified 2026-11-02. Download: lassen-vig.pdf (43 pages; 64 MB). The 12 scanned sample pages were rendered and reviewed, with OCR used as a supplement. Identical BOE1 and Third District justice metadata was verified against the Mono import.

**Partial county coverage intentionally declared.** The county guide prints six sample front/back pairs, but lists other precincts without a definitive ballot mapping. Each imported style is a COMPLETE ballot from its actual sample, not a county candidate-list union. Do not extend aliases to unlisted precincts. The first six front pages all state Congressional, Senate, and Assembly District 1. No Senate race appears (odd-numbered Senate districts are not on these November ballots).

Exact printed footer → PDF pages → local contests:
- CP1 110,111,112 → 4–5 → Lassen CCD area1 (vote2/3 candidates), Westwood USD full term (vote2/4) + short term (vote1/2). 37 total contests.
- CP4 117 → 6–7 → Lassen CCD area1 + Measure Y. 36 total.
- CP7 215 → 8–9 → Lassen CCD area1 + Y + Z. 37 total.
- CP16 410,414 → 10–11 → Lassen CCD area1. 35 total.
- MB17 412 → 12–13 → Shasta County Board of Education area2 (vote2/4), Fall River USD (vote3/5), Measure C. 37 total.
- MB29 511 → 14–15 → no local contests. 34 total.

Common 34 contests: CD1; Assembly1; BOE1; governor/lieutenant governor/secretary/controller/treasurer/AG/insurance/superintendent; 2 Supreme Court retentions; 7 Third District appellate retentions; state propositions 1–5 and 37–45. Names, party preferences and designations checked visually against shared records (rotation differs). All 12 sample images visually read, OCR supplementary only.

Measure C: $129,630,000 bonds, average $7.76/$100k assessed, $7.8m annual, 55% threshold; impartial analysis PDF page20.
Measure Y: $17.5m bonds, average $29.55/$100k assessed, $1.083m annual, 55%; impartial analysis PDF page28.
Measure Z: $28→$50 annual parcel/living-unit tax in Susanville city limits, indefinite until repealed, starts July1 2027, two-thirds; impartial analysis PDF page35 and tax statement39.

The printed Shasta education candidate name is AUTHUR GORMAN (not silently corrected to Arthur). Printed names/occupations retained. Write-in blank lines are not candidate records.

Validation: six resolved ballots passed countyBundle resolver and ballotSchema. IDs, aliases, complete local rules and candidate counts checked. No orphan contests.

Other explored leads: Trinity's consolidated guide https://www.trinitycounty.ca.gov/DocumentCenter/View/4334 has candidate statements and measures but no complete sample ballots; not imported. Glenn election page https://www.countyofglenn.net/government/departments/elections blocked web with403; curl also returned 403. Colusa landing has no sample guide link in visible text; not imported.
