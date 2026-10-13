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
	'Turnout is the number of electors who voted divided by the number of eligible electors, as each municipality reported it to the Province. Toronto in 2014 and 2018 and Barrie in 2018 use figures published by those cities, because the provincial file is blank or differs from them. By-elections, such as Toronto’s 2023 and Mississauga’s 2024 mayoral by-elections, are not included. Provincial turnout (dashed line) is all ballots cast as a share of names on the voters list, as reported by Elections Ontario; provincial elections were held in June 2014, 2018 and 2022, and February 2025.';

const charts = {
	'turnout-by-election': {
		title: 'Voter turnout declined in most of Ontario’s largest municipalities between 2014 and 2022',
		subtitle:
			'Median turnout held near 36% in 2014 and 2018, then dropped to 28% in 2022. Toronto declined the most; Ottawa was the only city to rise in both elections',
		source:
			'Government of Ontario, Municipal election results (2014, 2018, 2022); City of Toronto and City of Barrie election results; Elections Ontario, General Elections Statistics from the Records; Statistics Canada, Census of Population (2021)',
		alt: 'Slope chart of voter turnout in the 2014, 2018 and 2022 municipal elections for the 34 Ontario municipalities with more than 75,000 residents. Most lines fall, most steeply between 2018 and 2022. The median declines from 36.1% to 28.2%. A dashed line shows provincial election turnout: 51.3% in 2014, 56.7% in 2018, 44.1% in 2022 and 45.2% in 2025.',
		note: substitutionNote,
		data: ['turnout-by-municipality.csv', 'provincial-turnout.csv'],
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'turnout-by-mayoral-vote': {
		title: 'Turnout tended to be lower where the mayor won with a larger share of the vote',
		subtitle:
			'Toronto’s highest turnout came in 2014, when its mayor was elected with only 40% of the vote. Ottawa’s came in 2022, when its mayor was elected with 51%',
		source:
			'Government of Ontario, Municipal election results, municipal and successful candidate data (2014, 2018, 2022); City of Toronto and City of Barrie election results',
		alt: 'Three scatter plots, one for each of the 2014, 2018 and 2022 municipal elections, of voter turnout relative to the winning mayoral candidate’s share of the vote in Ontario municipalities with more than 75,000 residents. In each, the trend slopes downward: turnout is lower where the winner took a larger share. Toronto and Ottawa are highlighted.',
		note: 'Turnout is the percentage of eligible electors who voted. The provincial file lists only the winning candidate, so the measure is the winner’s share of votes cast for mayor, not the margin over the runner-up. The 2022 panel has 32 municipalities: Newmarket’s mayor was acclaimed and the file has no mayoral vote total for Milton. Three turnout values use city-published figures (Toronto 2014 and 2018, Barrie 2018). Correlations are Pearson’s r, with two-sided p-values.',
		data: 'turnout-and-mayoral-vote.csv',
		widths: [360, 720],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
