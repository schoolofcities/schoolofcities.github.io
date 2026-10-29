# 2026 turnout: verification against municipal sources

Checked 2026-10-29. The election was held 2026-10-26.

Every 2026 value in `turnout-by-municipality.csv` was checked against the Association of
Municipalities of Ontario (AMO) election results and against the municipality's own published
results. The CSV uses the municipality's figure wherever AMO's was missing, incomplete or
different (`source_2026` = `city`), and AMO's otherwise (`source_2026` = `amo`).

AMO results: https://elections2026.amo.on.ca/web/en/home
AMO public API: https://elections2026.amo.on.ca/api/public/municipality/{id}

## To recheck later

- Municipalities still marked unofficial, which should certify: Toronto, Ottawa, Brampton,
  Hamilton, London, Markham, Vaughan, Windsor, Richmond Hill, Oshawa, Barrie, Cambridge,
  St. Catharines, Mississauga, Thunder Bay, Peterborough, Caledon.
- Windsor: the City had published no turnout figure. Its certified results show 59,201 votes for
  mayor, more than AMO's 58,576 voters, so AMO's figure is probably low.
- Toronto, Markham, Caledon, Vaughan: no municipal turnout figure found to confirm AMO's.
- The provincial dataset (Government of Ontario, Municipal election results) will eventually
  include 2026 and should replace these figures.

## Confirmed by the municipality

| Municipality | CSV value | Municipality's figure | Status (2026-10-29) | Source |
|---|---|---|---|---|
| Ottawa | 36.2 | 36.21% (314,393 of 868,248), City figures as reported by CBC | Unofficial | https://www.cbc.ca/news/canada/ottawa/ottawa-2026-municipal-election-lowest-voter-turnout-in-23-years-9.7398136 |
| Brampton | 28.8 | 28.77% (123,133 of 428,012) | Unofficial | https://bramptonelectionresults.azurewebsites.net/ |
| Hamilton | 31.6 | 31.6% (147,196 of 465,861) | Uncertified | https://www.hamilton.ca/city-council/municipal-election/election-results-archives/2026-election-results |
| London | 31.0 | 31%, "just over 103,000", according to the City as reported by CBC (london.ca blocked automated access) | Unofficial | https://www.cbc.ca/news/canada/london/election-results-9.7397944 |
| Kitchener | 22.2 | 22.17% | Official | https://www.kitchener.ca/news/posts/official-city-of-kitchener-2026-municipal-and-school-board-election-results/ |
| Richmond Hill | 28.0 | 27.98% (44,604 voters) | Unofficial | https://www.richmondhill.ca/en/news/richmond-hill-unofficial-2026-municipal-elections-results.aspx |
| Burlington | 35.5 | 35.5% (56,863 of 160,089), City release as reported by BurlingtonToday | Official | https://www.burlingtontoday.com/2026-municipal-election-news/burlington-releases-official-results-for-2026-municipal-and-school-board-election-12952345 |
| Oshawa | 26.9 | 26.92% (40,718 of 151,269) | Unofficial | https://oshawa.enrs.ca/ |
| Greater Sudbury | 40.5 | 40.5% of "approximately 136,000" | Official | https://www.greatersudbury.ca/city-hall/news-and-public-notices/2026/2026-municipal-and-school-board-election-results/ |
| Barrie | 30.2 | 30.21% (39,533 voters) | Unofficial | https://www.barrie.ca/government-news/2026-municipal-election/2026-unofficial-election-results |
| Guelph | 36.4 | 36.37% (44,298 voters) | Official | https://guelph.ca/2026/10/official-results-available-for-the-city-of-guelphs-2026-municipal-and-school-board-election/ |
| Whitby | 30.8 | 30.83% (37,267 of 120,873) | Certified | https://media-003-ca.cdn.govstack.com/whitby-ca/media/vmglnb1v/election-2026-results-of-election-election-candidates-el-32.pdf |
| Cambridge | 27.0 | 27.01% (30,904 of 114,397) | Unofficial | https://results.cambridge.ca/ |
| St. Catharines | 27.9 | 27.87% (32,398 of 116,234); AMO gives 117,337 electors (27.6%) | Report dated 2026-10-27 8:44 a.m. | https://media-003-ca.cdn.govstack.com/stcatharines-ca/media/tczdjpyw/2026-electionsummaryreport.pdf |
| Milton | 40.7 | 40.71% (44,995 voters); AMO shows an earlier count (34.0%) | Certified | https://www.milton.ca/news/posts/town-of-milton-announces-official-2026-municipal-election-results/ |
| Kingston | 33.4 | 33.35% (38,246 of 114,676) | Official | https://www.cityofkingston.ca/news/posts/city-announces-official-municipal-election-results/ |
| Ajax | 32.4 | 32.4% (33,511 voters) | Official | https://ajax.ca/news-notices/ajax-announces-2026-municipal-and-school-board-elections-official-results/ |
| Thunder Bay | 40.9 | 40.85% (37,539 voters); AMO shows a partial count (26.6%) | Unofficial | https://www.thunderbay.ca/en/city-hall/2026-municipal-election.aspx |
| Brantford | 32.6 | 32.6% (29,492 voters) | Official | https://www.brantford.ca/news/posts/city-of-brantford-announces-official-2026-municipal-election-results/ |
| Chatham-Kent | 40.8 | 40.79% (36,703 voters), Clerk's release as reported by Sydenham Current | Official | https://sydenhamcurrent.ca/2026/10/28/official-results-confirm-bondy-as-chatham-kent-mayor-turnout-of-40-79-per-cent-highest-since-2018/ |
| Clarington | 34.0 | 34.0% (29,520 of 86,879) | Certified | https://media-003-ca.cdn.govstack.com/clarington-018-ca/media/4vxbeeyo/2026municipalelection-voterturnoutreport-aoda.pdf |
| Pickering | 39.4 | 39.42% (35,976 of 91,259) | Certified | https://media-002-ca.cdn.govstack.com/pickeringca-009-ca/media/ro2pzing/certificate-of-election-results.pdf |
| Niagara Falls | 34.2 | 34.25% (27,518 of 80,349) | Official | https://elections.niagarafalls.ca/ |
| Newmarket | 28.5 | "29%" (20,740 ballots) in the official release; 28.5% in the unofficial release | Official | https://www.newmarket.ca/local-government/news-notices/2026-10-27-newmarkets-official-2026-municipal-election-results |
| Peterborough | 40.3 | 40.27% (30,044 of 74,603) | Unofficial | https://www.peterborough.ca/news/posts/unofficial-election-results-for-the-2026-municipal-and-school-board-election/ |
| Kawartha Lakes | 34.2 | 34.2% (27,170 of 79,492) | Official | https://www.kawarthalakes.ca/government-administration/elections/results |

## Municipality's figure used in place of AMO's (conflicts)

| Municipality | AMO | Municipality's figure (in CSV) | Status | Source |
|---|---|---|---|---|
| Oakville | 34.1% (60,638 of 178,083) | 34.26% (60,638 ballots), rounded to 34.3; electors not stated by the Town (Oakville News gives 176,984) | Certified | https://www.oakville.ca/town-hall/news-notices/2026-news-releases-archive/oakville-town-clerk-releases-official-results-of-the-2026-municipal-election/ |
| Waterloo | 30.8% (29,171 of 94,608) | 30.71% (29,171 of 94,989) | Official (certificate dated 2026-10-27) | https://www.waterloo.ca/council-and-committees/municipal-elections/2026-elections-results/ |
| Mississauga | 34.2% (191,166 of 559,668) | 33.9% (191,166 ballots); electors not stated by the City | Unofficial | https://www.mississauga.ca/city-of-mississauga-news/news/mississauga-announces-unofficial-results-for-2026-municipal-election/ |

## Not confirmed by the municipality (AMO only)

| Municipality | CSV value (AMO) | Note | Where checked |
|---|---|---|---|
| Toronto | 45.8 (982,660 of 2,143,771) | City results site shows candidate votes only, no turnout | https://electionresults.toronto.ca/ |
| Markham | 32.5 (83,303 of 256,030) | City results page did not load; no turnout found | https://electionsmarkham.ca/results |
| Caledon | 34.2 (23,250 of 68,042) | Town results page shows no turnout | https://www.caledon.ca/en/government/2026-municipal-elections-results.aspx |
| Vaughan | 26.8 (71,191 of 265,197) | City release blocked automated access; search snippets quote 71,261 ballots and "27 per cent" | https://www.vaughan.ca/news/unofficial-election-results-city-vaughan-3 |
| Windsor | 31.8 (58,576 of 183,956) | City published no turnout; certified mayoral votes total 59,201, more than AMO's voters | https://www.citywindsor.ca/documents/city-hall/municipal-election/2026_results.pdf |
