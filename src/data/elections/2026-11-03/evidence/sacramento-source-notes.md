# Sacramento public export research — November 2, 2026

No complete import produced. No voter identity/address/DOB requests were sent and no private lookup data was accessed.

Official county homepage links https://myvoterportal.saccounty.gov/CountyVoterInfoGuide . Public HTML (`sacramento-cvig.html`) loads `main.cb72c8e5f1d06b6b.js` (`sacramento-portal-main.js`, 1.63MB). The `CountyVoterInfoGuide` component constructs public PDF links `/BallotImage_EN/{BallotImage}` after calling `/api/api/v1/Election/GetPartyBallotTypeByHandle?precinctHandle=...`. The precinct handle and party are obtained through the registration lookup flow, which asks for street number, ZIP, and birthdate. There is no complete ballot-file catalog in the public frontend. Identity endpoints were not called; PDF filenames were not guessed or enumerated.

The county also links the public signature-verification form https://ca.omniballot.us/sites/06067/forms/app/statement/verification . Its public config is https://ca.omniballot.us/sites/06067/forms/app/site-config.json, saved as `sacramento-forms-config.json`. It has only a tracking election ID 1715 in signature-form logic, not a verified current ballot catalog. `/published/06067/1715/styles/lookups.json` returned HTTP403; `/sites/06067/site/app/site-config.json` also returned HTTP403. No retries/alternate private endpoints used to bypass these responses.

Official RAVBM information https://elections.saccounty.gov/us/en/accessible-vbm.html directs voters to My Voter Portal to obtain the correct ballot and separately offers a DEMO, which is not current election data.

CalMatters' source appendix says Sacramento's precinct-to-ballot-type and ballot-type-to-contest crosswalks were obtained via public records requests, while precinct geometry is public at https://data-sacramentocounty.opendata.arcgis.com/datasets/sacramentocounty::consolidated-precincts . The appendix did not publish those crosswalk files. No records request or outreach was sent.

Public ArcGIS search identified the official `SCGISAdmin` item 255dd4348bd045cea5c7c4ea949a5b4a at https://services1.arcgis.com/5NARefyPVtAeuJPU/arcgis/rest/services/ConsolidatedPrecincts/FeatureServer/0 . Saved metadata `sacramento-gis-layer.json` contains only OBJECTID, VPrecinct, and geometry area/length. Its layer title is “Consolidated Precincts 2022/04 AD11”; it does not publish ballot types or the portal's precinct handle. No mapping was inferred from numeric identifiers.
