# San Diego November 3, 2026 import evidence

Primary sources only. No address, private voter lookup, authentication, or research-repository recommendations were used.

## Authoritative coverage and membership

The official election-specific SANDAG county precinct layer at https://geo.sandag.org/server/rest/services/hosted/Election_Precinct_2026_11_03/FeatureServer/0 returned 753 distinct ballot types, exactly 1–753, with `exceededTransferLimit: false`. The exact query and source-chain evidence are in `san-diego-source-notes.md`; saved JSON is `sd-gis-ballot-types.json` and layer/service metadata are beside it.

The county's public sample lookup JavaScript identifies the guide URL template https://www.sdvote.com/content/dam/rov/en/sb/SB-ENG-001.pdf (replace the zero-padded three-digit type). Each guide's actual SAMPLE BALLOT pages are extracted directly from the official PDF using bookmarks that point to page objects. Every extracted page must contain the right-hand footer matching its requested type (`SD 001-035`, etc.). Left-hand SB codes can identify shared pages (`SB-000-2-ENG`) and are intentionally **not** accepted as ballot-style aliases.

`extract-san-diego-range.py` uses ordinary HTTP byte ranges, strict pypdf parsing, direct page-object reads, and a persistent HTTPS connection. It avoids downloading unrelated guide images. Each `sd-type-NNN.json` preserves the complete actual sample-page text, PDF object identifiers, sample-section bookmarks, source URL, source PDF size, byte count, and request count. `import-san-diego.py` uses at most three simultaneous guides, resumes cached results, audits every result, and stops on errors or access/rate-limit responses.

## Contest definitions and verification

The official 23-page facsimile reference ballot is linked from https://www.sdvote.com/content/rov/en/elections/facsimile.html and downloaded unchanged as `sd-reference.pdf` from https://www.sdvote.com/content/dam/rov/en/election/facsimile-reference-ballot/english-reference-ballot.pdf .

It contains 169 candidate contests (438 printed candidate entries), 17 judicial retention questions, 14 state propositions, and 20 local measures. `extract-san-diego-reference.py` saves exact Unicode text and font/position evidence. `parse-san-diego-reference.py` separates headings, names, party preferences, and designations by printed alignment and fonts; every candidate contest must have a rule and candidates. Names and accents remain as printed. Blank designations are explicitly labeled “No ballot designation listed.”

Rendered source pages 1–17 were visually reviewed, including all printed candidate contests, all vote-for-two/three/seven rules, blank-designation candidates, two-column planning-group candidate lists, and judicial names. Rendered pages 20–23 were reviewed for all 20 local measure questions. The first guide's eight actual sample pages, PDF pages 37–44, were also rendered and inspected. The complete source guides for types 662 and 753 were additionally downloaded for visual checks: type 662 PDF page 40 confirms the Assessor office missing from its bookmarks, and type 753 PDF pages 39–40 confirm the final style’s school and district offices. Review images are `sd-review-0.png`, `sd-review-1.png`, `sd-reference-page-*.png`, and `sd-review-662/753-page-*.png`.

`audit-san-diego.py` requires each style's sample-section bookmarks to resolve to known contests or explicitly recognized non-contest headings. It binds each printed vote rule, every candidate name, and every nonempty designation to its own actual sample contest block, and verifies exact ordinary-contest count against all printed Vote-for instructions, all 17 complete judicial questions, all 14 propositions, and each full local measure question. Unknown headings, absent candidates/designations/questions, or incomplete count checks fail closed. Candidate order follows the reference; printed rotation in individual guides can differ. Some source bookmarks are incomplete: type 276 omits the Assembly district in its bookmark (the actual printed heading supplies District 76), and type 662 omits the Assessor bookmark entirely. Missing bookmark entries are recovered only when the complete official reference heading immediately followed by its vote rule appears in actual sample text; full candidate/designation and total-count checks still apply. `recoveredPrintedHeadings` in the style audit records these cases.

The bundle reuses only 24 verified statewide definitions: seven executive races, superintendent, two Supreme Court questions, and 14 propositions. Board of Equalization 4, legislative races, all 15 Fourth District appellate questions, local races, and measures are county-specific definitions. The official local questions are labeled as such; neutral adoption/retention descriptions add no recommendations or inferred thresholds. Three extracted bullet lists are punctuated for reading while preserving every word.

`build-san-diego.py` writes the final `san-diego.json` only after all 753 official types are present and audited, and verifies every reference race and local measure appears in at least one mapped style. While incomplete, it writes only `sd-bundle-draft.json`. Final app resolver/schema checks and counts are appended after retrieval completes.

## Reproduction

Use the bundled Python runtime with pypdf. Run:
1. `extract-san-diego-reference.py`
2. `parse-san-diego-reference.py`
3. `audit-san-diego.py`
4. `import-san-diego.py`
5. `build-san-diego.py`

`ballot-shared.json` is the app's statewide-definition snapshot used by the builder. The repository's county bundle resolver and ballot schema validate final styles separately. Parent agent owns repository integration.

## Final completed validation

Completed November 2, 2026: **753 styles, 6,024 actual sample pages, 220 distinct contests (196 county-specific + 24 shared), 47–55 contests per style**. All 169 reference candidate contests and all 20 local measures appear in the verified style union. The official GIS type set and imported type set match exactly.

The app's `resolveCountyBundle` and `ballotSchema` pass for every one of the 753 styles. Every canonical code and all 13,653 printed-code aliases resolve back to the correct style without collisions. There are 701 distinct contest-set groups. Final JSON is 2,221,431 bytes. SHA-256 hashes for the source reference PDF, GIS type index, each cached sample extraction, and final bundle are in `san-diego-source-sha256.json`.

Byte-range extraction retrieved approximately 849.66 MB across 102,473 individual range requests, with a maximum of three active import guides, rather than approximately 8–9 GB of full voter pamphlets. No access challenges or rate-limit responses occurred. The import stopped automatically on two genuine source bookmark defects; both were resolved only from actual printed sample text as documented above, then all cached styles were re-audited.

Final deliverable: `san-diego.json`. No repository changes were made by this importer agent.
