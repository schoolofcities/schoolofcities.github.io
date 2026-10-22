import { resolveDownloads } from '$lib/downloads.js';

const dataUrls = import.meta.glob('./data/*', { eager: true, query: '?url', import: 'default' });
const pngUrls = import.meta.glob('./published/*/*.png', {
	eager: true,
	query: '?url',
	import: 'default'
});
const embedMeta = import.meta.glob('./published/*/embed.json', {
	eager: true,
	import: 'default'
});

const source =
	'Government of Ontario, Municipal election results (2014, 2018, 2022); City of Toronto and City of Barrie election results; Statistics Canada, Census of Population (2021)';

const substitutionNote =
	'Includes the 34 Ontario municipalities with more than 75,000 residents in the 2021 Census. Turnout is the number of electors who voted divided by the number of electors on the voters’ list, as each municipality reported it to the Province. Toronto in 2014 and 2018 and Barrie in 2018 use figures published by those cities, because the provincial dataset is blank or differs from them. By-elections, such as Toronto’s 2023 and Mississauga’s 2024 mayoral by-elections, are not included.';

const charts = {
	'turnout-by-election': {
		title: 'Voter turnout declined in most Ontario municipal elections between 2014 and 2022',
		subtitle:
			'Turnout fell in both 2018 and 2022 in 18 of 34 municipalities. Only Ottawa’s rose in both years.',
		source:
			'Government of Ontario, Municipal election results (2014, 2018, 2022); City of Toronto and City of Barrie election results; Elections Ontario, General Elections Statistics from the Records; Elections Canada, Official Voting Results (2015, 2019, 2021, 2025); Statistics Canada, Census of Population (2021)',
		alt: 'Slope chart of voter turnout in the 2014, 2018 and 2022 municipal elections for 34 Ontario municipalities. Turnout fell in most of them, most steeply between 2018 and 2022, and the median dropped from 36.1% to 28.2%. Dotted lines show turnout in Ontario for federal elections (62% to 69%) and provincial elections (44% to 57%), both well above municipal turnout.',
		note: substitutionNote,
		data: ['turnout-by-municipality.csv', 'provincial-turnout.csv', 'federal-turnout.csv'],
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'turnout-by-mayoral-vote': {
		title: 'Turnout in Ontario municipal elections tended to be lower where the mayor won with a larger share of the vote',
		subtitle:
			'Toronto’s highest turnout came in 2014, when its mayor was elected with only 40% of the vote. Ottawa’s came in 2022, when its mayor was elected with 51%.',
		source:
			'Government of Ontario, Municipal election results, municipal and successful candidate data (2014, 2018, 2022); City of Toronto and City of Barrie election results',
		alt: 'Three scatter plots, one for each of the 2014, 2018 and 2022 municipal elections, of voter turnout relative to the winning mayoral candidate’s share of the vote in Ontario municipalities. In each, the trend slopes downward: turnout is lower where the winner took a larger share. Toronto and Ottawa are highlighted.',
		note: 'Includes the 34 Ontario municipalities with more than 75,000 residents in the 2021 Census. Turnout is the percentage of electors on the voters’ list who voted. The provincial dataset lists only the winning candidate, so the measure is the winner’s share of votes cast for mayor, not the margin over the runner-up. The 2014 panel has 33 municipalities: St. Catharines is left out because the dataset lists more votes for mayor than electors who voted. The 2022 panel has 32: Newmarket’s mayor was acclaimed and the dataset has no mayoral vote total for Milton. Three turnout values use city-published figures (Toronto 2014 and 2018, Barrie 2018). Correlations are Pearson’s r, with two-sided p-values.',
		data: 'turnout-and-mayoral-vote.csv',
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'turnout-by-internet-voting': {
		title: 'Municipalities in Ontario that introduced internet voting in 2022 did not see the drop in turnout seen elsewhere',
		subtitle: 'The four that introduced it in 2018 showed no such difference.',
		source:
			'Government of Ontario, Municipal election results (2014, 2018, 2022); Association of Municipalities of Ontario, vote methods (2018, 2022); municipal election reports',
		alt: 'Arrow chart of the change in voter turnout for Ontario municipalities that started or stopped offering internet voting, compared with the median change of those that did not. From 2018 to 2022, the four that introduced it changed by less than 5 points while the median fell 8.1; from 2014 to 2018, Thunder Bay rose 4.9 points while three others fell more than the median of −0.9.',
		note: 'Includes the 34 Ontario municipalities with more than 75,000 residents in the 2021 Census. Introduced internet voting means it was offered in that election but not the previous one, including Vaughan in 2022, which offered it only during advance voting. The medians are of the municipalities whose use of internet voting did not change between the two elections (29 for 2014 to 2018, 30 for 2018 to 2022). Oakville’s 2018 entry in the provincial dataset is corrected to no internet voting.',
		data: ['internet-voting.csv', 'turnout-by-municipality.csv'],
		widths: [360, 720],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
