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
	'sidewalk-coverage-map': {
		authors: ['Jeff Allen'],
		title: 'Mapping sidewalk coverage in Toronto',
		subtitle: '71% of streets have sidewalks on both sides; 13% have no sidewalks at all',
		source: 'City of Toronto: Pedestrian Network Data (2019) and Sidewalk Construction Program and annual council reports (2020-2026)',
		alt: "Map of every street in Toronto, colored by sidewalk coverage: blue for sidewalks on both sides, yellow for one side only, and red for no sidewalk. Blue dominates downtown and older neighbourhoods; red and yellow cluster in the inner suburbs, especially parts of Etobicoke, North York, and Scarborough. A few black lines mark streets with a new or planned sidewalk installation since 2020.",
		widths: [1440, 1080],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
