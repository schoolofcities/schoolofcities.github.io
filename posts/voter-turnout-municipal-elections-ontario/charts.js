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

const charts = {
	'turnout-by-election': {
		title: 'Voter turnout rose in most Ontario municipalities in 2026',
		subtitle:
			'After falling in 2018 and 2022, the median increased in 2026 but remained below its 2014 level and below turnout for federal and provincial elections.',
		source:
			'Government of Ontario, Municipal election results (2014, 2018, 2022); City of Toronto (2014, 2018) and City of Barrie (2018) election results; Association of Municipalities of Ontario, 2026 Ontario Municipal Elections (unofficial); municipal election results (2026); Elections Ontario, General Elections Statistics from the Records; Elections Canada, Official Voting Results (2015, 2019, 2021, 2025); Statistics Canada, Census of Population (2021)',
		alt: 'Slope chart of voter turnout in the 2014, 2018, 2022 and 2026 municipal elections for 34 Ontario municipalities. Turnout fell in most of them from 2014 to 2022, and the median dropped from 36.1% to 28.2%, before rising to 33.2% in preliminary 2026 results. A dotted line shows federal turnout in Ontario (62% to 69%) and a dashed line provincial turnout (44% to 57%), both well above municipal turnout.',
		note: 'Includes the 34 Ontario municipalities with more than 75,000 residents in the 2021 Census. Turnout is the share of electors on the voters’ list who voted. 2026 figures are preliminary and unofficial, as of October 28, 2026. Windsor, St. Catharines, and Pickering had not reported, so the 2026 median is of 31 municipalities. See Methods and data in the full post for sources and corrections.',
		data: ['turnout-by-municipality.csv', 'provincial-turnout.csv', 'federal-turnout.csv'],
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'turnout-by-mayoral-vote': {
		title: 'Turnout in Ontario municipal elections tended to be lower where the mayor won with a larger share of the vote',
		subtitle:
			'Toronto’s highest turnout came in 2014, when its mayor was elected with only 40% of the vote. Ottawa’s came in 2022, when its mayor was elected with 51%.',
		source:
			'Government of Ontario, Municipal election results, municipal and successful candidate data (2014, 2018, 2022); City of Toronto (2014, 2018) and City of Barrie (2018) election results',
		alt: 'Three scatter plots, one for each of the 2014, 2018 and 2022 municipal elections, of voter turnout relative to the winning mayoral candidate’s share of the vote in Ontario municipalities. In each, the trend slopes downward: turnout is lower where the winner took a larger share. Toronto and Ottawa are highlighted.',
		note: 'Includes the 34 Ontario municipalities with more than 75,000 residents in the 2021 Census. Turnout is the share of electors on the voters’ list who voted. The winner’s share is of all votes cast for mayor, since the data does not list runners-up. The 2014 panel has 33 municipalities and the 2022 panel has 32, because of missing or inconsistent data. Correlations are Pearson’s r, with two-sided p-values. See Methods and data in the full post for sources and corrections.',
		data: 'turnout-and-mayoral-vote.csv',
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'turnout-by-internet-voting': {
		title: 'Municipalities in Ontario that introduced internet voting in 2022 did not see the drop in turnout seen elsewhere',
		subtitle: 'The four that introduced it in 2018 showed no such difference.',
		source:
			'Government of Ontario, Municipal election results (2014, 2018, 2022); Association of Municipalities of Ontario, vote methods (2018, 2022); City of Toronto (2014, 2018), City of Barrie (2018), and Town of Oakville (2018) election results',
		alt: 'Arrow chart of the change in voter turnout for Ontario municipalities that started or stopped offering internet voting, compared with the median change of those that did not. From 2018 to 2022, the four that introduced it changed by less than 5 points while the median fell 8.1; from 2014 to 2018, Thunder Bay rose 4.9 points while three others fell more than the median of −0.9.',
		note: 'Includes the 34 Ontario municipalities with more than 75,000 residents in the 2021 Census. Introduced internet voting means it was offered in that election but not the previous one (in Vaughan in 2022, only during advance voting). The medians are of municipalities whose use of internet voting did not change (29 for 2014 to 2018, 30 for 2018 to 2022). See Methods and data in the full post for sources and corrections.',
		data: ['internet-voting.csv', 'turnout-by-municipality.csv'],
		widths: [360, 720],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
