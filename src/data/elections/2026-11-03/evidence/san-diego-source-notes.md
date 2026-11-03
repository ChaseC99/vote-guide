# San Diego — verified official source chain, not yet imported

Verified on November 2, 2026. No voter names, addresses, or personal lookup used.

Official election-specific index:
https://geo.sandag.org/server/rest/services/hosted/Election_Precinct_2026_11_03/FeatureServer/0

The `bt` field is ballot type. Query `where=1=1&outFields=bt&returnDistinctValues=true&returnGeometry=false&orderByFields=bt&f=json` returned all **753 distinct values, 1 through 753**, with `exceededTransferLimit: false`. Cached service/layer/index: `sd-gis-service.json`, `sd-gis-layer.json`, `sd-gis-ballot-types.json`.

Official sample URL format is `https://www.sdvote.com/content/dam/rov/en/sb/SB-ENG-{type:03}.pdf`. The county's public sample lookup JavaScript supplies the `SB-ENG-` URL template. Low numbers MUST be padded. Sample 001 was downloaded successfully as `sd-001.pdf`, 11,784,626 bytes, last modified September 24, 2026. Its 92 pages contain the actual eight sample-ballot pages at zero-based indices 36–43, and explicitly state November 3, 2026. Its 178 PDF bookmarks are cached with destinations in `sd-001-outline.json`.

The public research repo's `evidence/county/sd/ballot-types.json` (cached `sd-research-ballot-types.json`) contains only types 100–753, because its scraper failed to pad filenames 1–99. It is a lead, not authoritative coverage evidence. The official GIS index resolves that gap.

Official full composite ballot, all county contests/candidates/measure questions:
https://www.sdvote.com/content/dam/rov/en/election/facsimile-reference-ballot/english-reference-ballot.pdf

Cached `san-diego-composite.pdf` and `san-diego-composite.txt`; 23 pages, actual November 3, 2026. The county links it at https://www.sdvote.com/content/rov/en/elections/facsimile.html .

Import requires verifying all 753 sample memberships. Bookmarks identify every sample contest, between the first `SAMPLE BALLOT` and `VOTER INFORMATION PAMPHLET`, but retention titles omit justice names and must be resolved from actual sample/composite content. Shared repeated names are not sufficient to infer membership. Full PDFs are about 10–12MB each; do not bulk-download gigabytes without first considering sparse range extraction.

`pypdf.PdfReader(..., strict=True)` avoids its normal whole-xref object validation and allows sparse range access. Traversing raw `/Outlines` `/First`, `/Next`, `/Title` fields requires about 0.6MB of scattered 8KB blocks for a complete outline; stopping after sample sections saves requests. `reader.outline` additionally resolves destinations/pages and is less efficient. The official PDF server supports byte range requests. Raw title traversal on sample 001 matches all 178 normal-reader bookmarks.

No normalized San Diego bundle has been produced. Do not mark county complete from the composite or third-party outline index alone.
