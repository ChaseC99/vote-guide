# Mono County November 3, 2026 import verification

Verified November 2, 2026. Bundle: mono.json.

Official county index: https://www.monocounty.ca.gov/2547/Voter-Information-Guides

The county index warns that original mailed guides contained errors; these are the AMENDED PDFs linked on that index. All five official PDFs were downloaded. Printed sample pages 6–9 were extracted as text and rendered; candidate and local-contest pages were visually checked, including continuation columns on the following page. Every sample contains all 14 state propositions (1–5, 37–45); text checks confirm each exactly once. Statewide candidate names, party preferences and designations match the reused ballot.json records, though rotated ballot order differs for some races.

County index mapping:
- B001: precincts 1, 3, 4-2, 5, 6; https://www.monocounty.ca.gov/DocumentCenter/View/3624/B001_AMENDED
- B002: precinct 4-1; https://www.monocounty.ca.gov/DocumentCenter/View/3625/B002_AMENDED
- B003: precinct 7; https://www.monocounty.ca.gov/DocumentCenter/View/3626/B003_AMENDED
- B004: precincts 8, 9, 10, 12, 13; https://www.monocounty.ca.gov/DocumentCenter/View/3627/B004_AMENDED
- B005: precinct 11; https://www.monocounty.ca.gov/DocumentCenter/View/3628/B005_AMENDED

B001–B005 are official guide IDs. Printed sample footers are 026SB001A through 026SB005D; only complete printed page-code aliases added. No numeric precinct aliases added, to avoid confusing precinct 3 (B001) with sample 3 (B003).

Common: CD5, BOE1, Senate4, Assembly8, governor/lieutenant governor/secretary/controller/treasurer/AG/insurance/superintendent, 2 Supreme Court retention votes and 7 Third District appellate retention votes, 14 propositions. =35 contests.

Local additions: B001 Measure O; B002 none; B003 MCOE Trustee Area 3 (vote2 from3), Kern CCD (vote1 from2), Southern Mono Health Care (vote2 from5), Measure P; B004 same as B003 plus Mammoth Lakes Town Council (vote3 from8); B005 Kern CCD + Bishop Unified (vote3 from5). Total per style 36/35/39/40/37.

Measure O threshold 55% is verified in official guide full text and impartial analysis (PDF pages 13 and 16). Measure P threshold two-thirds verified in full text and impartial analysis (B003 PDF pages 17 and 18). Both summaries derived from printed ballot question, neutral yes/no choices.

Daniel Ranson's ballot occupation has a printed spelling 'Business Owner/Pschotherapist'; retained rather than silently editorializing. David Tangipa's full printed name retained. Unnamed write-in blanks are not candidates and not imported.

Validation: all five styles resolved using src/data/countyBundle.ts resolveCountyBundle; full constructed ballots passed src/data/schema.ts ballotSchema. No orphan/unknown/duplicate contests or duplicate aliases.
