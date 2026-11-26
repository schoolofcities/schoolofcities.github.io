<script>
	import { base } from '$app/paths';
	import PageHead from '$lib/PageHead.svelte';
	import Password from '$lib/Password.svelte';
	import { HOME_PROTECTED, HOME_PASSWORD } from '$lib/homeGate.js';
	import AtlasChart from '$lib/AtlasChart.svelte';
	import BannerMap from '$lib/BannerMap.svelte';
	import { catalogue, places, topics, capitalize } from '$lib/catalogue.js';
	import { BASE_PATH, SITE_ORIGIN } from '$lib/site.js';

	// The newest work below the banner, as a grid of tiles. Twelve to
	// begin with, and a button for twelve more; the buttons above filter by kind.
	const FILTERS = [
		['feature', 'Stories', 'Long-form, visual stories on a single subject.'],
		['post', 'Posts', 'Short explorations of urban data and research.'],
		['explorer', 'Explorers', 'Data tools, interactive maps, and dashboards.'],
		['project', 'Collections', 'Groups of related pieces from one project.']
	];
	const PAGE = 12;
	const all = catalogue.filter((item) => item.card);

	let query = $state('');
	let topic = $state('');
	let place = $state('');
	let filter = $state('');
	let shown = $state(PAGE);

	// What the search box looks through, lower-cased once rather than on every keystroke.
	const searchable = new Map(
		all.map((item) => [
			item.id,
			[item.title, item.summary, item.type, item.partOf ?? '', ...item.authors, ...item.tags, ...item.geography]
				.join(' ')
				.toLowerCase()
		])
	);

	const matching = $derived.by(() => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		const topicText = topic.trim().toLowerCase();
		const placeText = place.trim().toLowerCase();

		return all
			.filter((item) => !filter || item.type === filter)
			.filter((item) => !topicText || item.tags.some((tag) => tag.toLowerCase().includes(topicText)))
			.filter((item) => !placeText || item.geography.some((name) => name.toLowerCase().includes(placeText)))
			.filter((item) => words.every((word) => searchable.get(item.id).includes(word)));
	});
	const filtering = $derived(Boolean(query.trim() || topic.trim() || place.trim() || filter));

	// Any change to what is asked for starts the list again at the first twelve.
	const restart = () => (shown = PAGE);

	// Choosing a kind shows only that kind; choosing it again turns it off, which shows everything.
	function choose(value) {
		filter = filter === value ? '' : value;
		restart();
	}

	function clearFilters() {
		query = '';
		topic = '';
		place = '';
		filter = '';
		restart();
	}

	// UTC, so a date never shifts a day with the reader's time zone (as on the cards).
	const formatDate = (iso) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-CA', {
			timeZone: 'UTC',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

	// The about band at the bottom of the page: the same words as the About page.
	const services = [
		{
			name: 'Within the School of Cities',
			text: "We make the maps, charts, and data stories behind the School of Cities' and affiliates' research and knowledge mobilization."
		},
		{
			name: 'For partners',
			text: 'Beyond our core work, we occasionally collaborate with researchers, centres, and units across the University of Toronto, as well as with outside organizations, helping create maps, charts, data stories, and interactive tools.'
		}
	];

	const learning = [
		{
			name: 'Micro-credentials',
			text: 'The School of Cities offers two fully online microcredentials in urban data analytics and visualization and in urban data storytelling. They are self-directed, six weeks each, and built for early- to mid-career professionals.',
			href: 'https://schoolofcities.utoronto.ca/learning-sofc/urban-data-professional-advancement/',
			external: true
		},
		{
			name: 'Workshops',
			text: "We offer bespoke workshops and training, from short sessions of about two hours to intensive multi-day workshops. We start from your group's current level expertise and build practical skills in mapping, data visualization, and storytelling.",
			href: '#contact',
			external: false
		},
		{
			name: 'Open online textbook',
			text: 'We created a free, online textbook with hands-on tutorials in data analysis (Python, spreadsheets, and QGIS), visualization (designing effective maps and charts), and narrative techniques for communicating urban data.',
			href: 'https://schoolofcities.github.io/urban-data-storytelling/',
			external: true
		}
	];

	const hrefOf = (item) => (item.external ? item.href : `${base}${item.href}`);

	// What a crawler or AI tool reads: the team, and every item in the catalogue with its address,
	// so the whole list is there however few tiles the page shows. Built from the same catalogue as
	// the tiles, so a new post or link is added to it with no edit here. A post gets this site's
	// address; work hosted elsewhere carries its own.
	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Maps & Data Visualization',
		url: `${SITE_ORIGIN}${BASE_PATH}/`,
		description:
			'Maps, charts, data stories, and interactive tools from the Maps and Data Visualization team at the School of Cities, University of Toronto.',
		publisher: { '@type': 'Organization', name: 'School of Cities, University of Toronto', url: 'https://schoolofcities.utoronto.ca/' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: catalogue.length,
			itemListElement: catalogue.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.title,
				url: item.external ? item.href : `${SITE_ORIGIN}${BASE_PATH}${item.href}`,
				description: item.summary
			}))
		}
	}).replace(/</g, '\\u003c');
</script>

<PageHead
	title="Maps & Data Visualization | School of Cities"
	description="At the School of Cities we create maps, charts, data stories, and interactive tools that help people understand cities, from the Maps and Data Visualization team at the School of Cities, University of Toronto."
	route="/"
	jsonLd={HOME_PROTECTED ? undefined : jsonLd}
	noindex={HOME_PROTECTED}
/>

<svelte:head>
	<!-- Without scripting there is no "Load more", so every tile is shown. -->
	<noscript>
		<style>
			.tile[hidden] {
				display: block;
			}
		</style>
	</noscript>
</svelte:head>

<!-- Behind a password while the page is under development (see homeGate.js). -->
<Password
	slug="home"
	password={HOME_PASSWORD}
	locked={HOME_PROTECTED}
>
<section class="banner">
	<BannerMap />
	<div class="banner-inner">
		<div class="intro">
			<h1>Maps & Data Visualization</h1>
			<p class="lede">
				At the School of Cities we create maps, charts, data stories, and interactive tools that showcase urban research and help people understand cities.
			</p>
		</div>

		<AtlasChart />
	</div>
</section>

<div class="work">
	<div class="inner">
		<!-- Not shown: it names this section for the page's outline, with each tile's title a heading under it. -->
		<h2 class="hidden-text">Latest work</h2>

		<form class="toolbar" role="search" aria-label="Filter our work" onsubmit={(event) => event.preventDefault()}>
			<div class="row">
				<div class="filters" role="group" aria-label="Type">
					{#each FILTERS as [value, label, description]}
						<button type="button" class={value} aria-pressed={filter === value} onclick={() => choose(value)}>
							<span class="name">{label}</span>
							<span class="desc">{description}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="fields">
				<label class="hidden-text" for="query">Search</label>
				<input id="query" class="search" type="search" bind:value={query} oninput={restart} placeholder="Search" autocomplete="off" />

				<input type="text" aria-label="Theme" list="topic-options" bind:value={topic} oninput={restart} placeholder="Theme" autocomplete="off" />
				<datalist id="topic-options">
					{#each topics as [tag]}
						<option value={capitalize(tag)}></option>
					{/each}
				</datalist>

				<input type="text" aria-label="Geography" list="place-options" bind:value={place} oninput={restart} placeholder="Geography" autocomplete="off" />
				<datalist id="place-options">
					{#each places as name}
						<option value={name}></option>
					{/each}
				</datalist>

				<!-- Down to the About band at the bottom of the page. -->
				<a
					class="about-link"
					href="#about"
					onclick={(event) => {
						event.preventDefault();
						document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
					}}
				>
					About <span class="bounce-down" aria-hidden="true"></span>
				</a>

				<!-- Sits just under the fields when something is filtered, in the empty space below them,
				     so nothing on the page moves when it appears. -->
				{#if filtering}
					<button type="button" class="clear under" onclick={clearFilters}>Clear all filters</button>
				{/if}
			</div>
		</form>

		<ul class="tiles">
			<!-- Every item is in the page, so a crawler reading the HTML finds every link; those past
			     the first twelve stay hidden (and their images unloaded) until "Load more". -->
			{#each matching as item, index (item.id)}
				<li class="tile {item.type}" hidden={index >= shown}>
					<a
						href={hrefOf(item)}
						target={item.external ? '_blank' : undefined}
						rel={item.external ? 'noopener noreferrer' : undefined}
					>
						<span class="date">{formatDate(item.updated)}</span>
						<span class="art">
							<img src={item.card} alt="" width="1200" height="630" loading="lazy" decoding="async" />
						</span>
						<div class="text">
							<h3 class="title">{item.title}{#if item.external}<span class="hidden-text"> (opens another site)</span>{/if}</h3>
							<span class="summary">{item.summary}</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>

		{#if !matching.length}
			<div class="empty">
				<p>Nothing matches those filters.</p>
				<button type="button" class="clear" onclick={clearFilters}>Clear all filters</button>
			</div>
		{/if}

		<div class="more-row">
			{#if shown < matching.length}
				<button type="button" class="more" onclick={() => (shown += PAGE)}>Load more</button>
			{/if}
		</div>
	</div>
</div>

<!-- At the bottom, before the footer: who we are and what we do, in the About page's words, on a
     medium blue band. -->
<section class="about-band" id="about" aria-labelledby="about-heading">
	<div class="band-inner">
		<div class="band-intro">
			<div class="band-head">
				<h2 id="about-heading">About</h2>

				<button type="button" class="top" onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
					<span class="bounce" aria-hidden="true"></span> Back to top
				</button>
			</div>
			<p>
				The Maps and Data Visualization team is part of the
				<a href="https://schoolofcities.utoronto.ca/" target="_blank" rel="noopener noreferrer">School of Cities</a>
				at the University of Toronto. We are led by Jeff Allen, Senior Research Associate.
				<a href="https://schoolofcities.utoronto.ca/people/jeff-allen/" target="_blank" rel="noopener noreferrer">See his profile</a>
				on the School of Cities website.
			</p>
		</div>

		<div class="band-block">
			<h3 class="band-title">Work</h3>
			<div class="band-grid">
				{#each services as item (item.name)}
					<div class="band-item">
						<h4>{item.name}</h4>
						<p>{item.text}</p>
					</div>
				{/each}
				<div class="band-item">
					<h4>How we work</h4>
					<p>
						Quick questions, short conversations, and pointers to resources we already have are free, so just ask, even if
						you have no budget. For larger projects, we typically need funding to help pay for a research assistant's salary.
					</p>
					<a class="arrow" href="#contact">Get in touch <span aria-hidden="true">↓</span></a>
				</div>
			</div>
		</div>

		<div class="band-block">
			<h3 class="band-title">Learning</h3>
			<div class="band-grid">
				{#each learning as item (item.name)}
					<div class="band-item">
						<h4>{item.name}</h4>
						<p>{item.text}</p>
						<a
							class="arrow"
							href={item.href}
							target={item.external ? '_blank' : undefined}
							rel={item.external ? 'noopener noreferrer' : undefined}
						>
							{item.external ? 'Visit' : 'Get in touch'} <span aria-hidden="true">{item.external ? '↗' : '↓'}</span>
						</a>
					</div>
				{/each}
			</div>
		</div>

		<div class="band-block" id="contact">
			<h3 class="band-title">Contact</h3>
			<p>
				Questions about a project, a dataset, or training? Send an email to:
				<a href="mailto:jeff.allen@utoronto.ca">jeff.allen@utoronto.ca</a>
			</p>
		</div>
	</div>
</section>
</Password>

<style>
	.banner {
		position: relative;
		overflow: hidden;
		/* Two thirds of the window's height on a desktop, with the content centred in
		   it; never less than the content needs. */
		display: flex;
		align-items: center;
		min-height: 67vh;
		/* Raised a level, so its shadow falls on the white below. */
		z-index: 1;
		box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
		box-sizing: border-box;
		border-bottom: 1px solid var(--brandMedBlue);
		background-color: var(--brandDarkBlue);
		color: var(--brandWhite);
	}

	.banner-inner {
		width: 100%;
		position: relative; /* above the map */
		pointer-events: none; /* so the map behind can be dragged from the gaps between things */
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: 40px;
		align-items: center;
		max-width: 1560px;
		margin: 0 auto;
		/* The sides line up with the header's logo (left) and links (right). */
		padding: 69px 36px 85px 44px;
	}

	/* One line on a wide screen, sized to fit the text column; it wraps where the
	   banner stacks (below). */
	h1,
	.lede,
	.banner-inner > :global(.atlas-wrap) {
		pointer-events: auto;
	}

	h1 {
		margin: 0;
		/* The yellow line a post's title band has, between the title and the line under it. */
		padding-bottom: 20px;
		border-bottom: 2px solid var(--brandYellow);
		width: fit-content; /* so the line is as long as the title */
		white-space: nowrap;
		font-size: clamp(34px, calc(4.8vw - 6px), 66px);
		line-height: 0.98;
		letter-spacing: -0.01em;
		color: var(--brandWhite);
	}

	.lede {
		max-width: 600px;
		margin: 22px 0 0;
		padding: 0;
		font-family: SourceSerifItalic;
		font-size: 24px;
		line-height: 35px;
		color: var(--brandWhite);
	}

	/* ---- The tiles. ---- */
	/* The gap before the About band is the bottom padding. */
	.work {
		padding: 72px 0 104px;
		background-color: var(--brandWhite);
	}

	.inner {
		max-width: 1560px;
		margin: 0 auto;
		/* The sides line up with the header's logo (left) and links (right). */
		padding: 0 36px 0 44px;
	}

	/* The kinds across the top, then search, theme, and geography on one line below them. */
	.toolbar {
		display: flex;
		flex-direction: column;
		gap: 36px;
		margin: 0 0 72px;
	}

	.fields {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 16px;
	}

	.fields input {
		flex: 0 1 220px;
		min-width: 0;
	}

	/* The search is twice the width of theme and geography. */
	.fields .search {
		flex-basis: 440px;
	}

	input[type='search'],
	input[type='text'] {
		box-sizing: border-box;
		font-family: OpenSans;
		font-size: 15px;
		line-height: 20px;
		color: var(--brandGray90);
		background-color: var(--brandWhite);
		border: solid 1px var(--brandGray30);
		border-radius: 0;
		padding: 9px 14px;
	}

	input::placeholder {
		color: var(--brandGray55);
	}

	input:focus-visible {
		outline: 2px solid var(--brandMedBlue);
		outline-offset: 3px;
	}

	/* At the right end of the fields: the arrow bobs down, and the page slides down to the About band. */
	.about-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
		padding: 8px 17px;
		font-family: OpenSansBold;
		font-size: 15px;
		line-height: 20px;
		color: var(--brandWhite);
		background-color: var(--brandMedBlue);
		text-decoration: none;
		border: solid 2px var(--brandMedBlue);
		transition: background-color 0.15s, color 0.15s;
	}

	.about-link:hover {
		background-color: var(--brandDarkBlue);
		border-color: var(--brandDarkBlue);
	}

	.about-link:focus-visible {
		outline: 2px solid var(--brandMedBlue);
		outline-offset: 3px;
	}

	/* A solid triangle pointing down. */
	.bounce-down {
		display: inline-block;
		width: 0;
		height: 0;
		border-top: 8px solid currentColor;
		border-right: 6px solid transparent;
		border-left: 6px solid transparent;
		animation: bounce-down 1.6s ease-in-out infinite;
	}

	@keyframes bounce-down {
		0%,
		100% {
			transform: translateY(-2px);
		}
		50% {
			transform: translateY(3px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bounce-down {
			animation: none;
		}
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 10px 32px;
	}

	.row .filters {
		flex: 1 1 100%;
	}

	.clear {
		margin-left: auto;
		font-family: OpenSansBold;
		font-size: 14px;
		line-height: 20px;
		color: var(--brandBlack);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.clear:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.empty {
		padding: 40px 0;
	}

	.clear.under {
		position: absolute;
		top: 100%;
		left: 0;
		margin: 10px 0 0;
	}

	.empty .clear {
		margin-left: 0;
	}

	/* The four kinds in even columns, kept close together at the left rather than spread across the
	   whole line. */
	.filters {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 215px));
		align-items: start;
		gap: 20px 28px;
		width: 100%;
	}

	/* Each kind is marked with a dot in its own colour, hollow until chosen,
	   with a line about it in small text underneath its name. */
	.filters button {
		display: grid;
		grid-template-columns: 10px minmax(0, 1fr);
		column-gap: 8px;
		align-items: center;
		padding: 4px 0;
		text-align: left;
		font-family: OpenSans;
		color: var(--brandGray65);
		background: none;
		border: none;
		cursor: pointer;
	}

	.filters .name {
		grid-area: 1 / 2;
		font-size: 16px;
		line-height: 22px;
	}

	.filters .desc {
		grid-area: 2 / 2;
		margin-top: 2px;
		font-family: SourceSerif;
		font-size: 14px;
		line-height: 19px;
		color: var(--brandGray55);
	}

	.filters button::before {
		content: '';
		grid-area: 1 / 1;
		width: 10px;
		height: 10px;
		box-sizing: border-box;
		border-radius: 50%;
		border: solid 2px var(--dot, var(--brandDarkBlue));
		transition: background-color 0.15s;
	}

	.filters button:hover {
		color: var(--brandDarkBlue);
	}

	.filters button:hover::before,
	.filters button[aria-pressed='true']::before {
		background-color: var(--dot, var(--brandDarkBlue));
	}

	.filters button[aria-pressed='true'] .name {
		font-family: OpenSansBold;
		color: var(--brandDarkBlue);
	}

	.filters button[aria-pressed='true'] .desc,
	.filters button:hover .desc {
		color: var(--brandGray90);
	}

	.filters .feature {
		--dot: #C58BD0;
	}
	.filters .post {
		--dot: #6FC7EA;
	}
	.filters .explorer {
		--dot: #8DBF2E;
	}
	.filters .project {
		--dot: #F1C500;
	}

	.filters button:focus-visible,
	.clear:focus-visible,
	.tile a:focus-visible,
	.more:focus-visible {
		outline: 2px solid var(--brandMedBlue);
		outline-offset: 3px;
	}

	/* Three across, the middle column dropped a little so the rows are offset. */
	.tiles {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 64px 44px;
		align-items: start;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.tile:nth-child(3n + 2) {
		margin-top: 56px;
	}

	.tile[hidden] {
		display: none;
	}

	/* Each tile's colour is its kind's, the soft colours of the banner's dot chart. */
	.tile.feature {
		--kind: #C58BD0;
	}
	.tile.post {
		--kind: #6FC7EA;
	}
	.tile.explorer {
		--kind: #8DBF2E;
	}
	.tile.project {
		--kind: #F1C500;
	}

	.tile a {
		display: block;
		color: var(--brandDarkBlue);
		text-decoration: none;
	}

	/* The whole card image, with a block of the kind's colour behind it, offset to the bottom right
	   like a hard shadow. */
	.art {
		display: block;
	}

	.art img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1200 / 630;
		object-fit: cover;
		background-color: var(--brandWhite);
		border: solid 1px var(--brandGray15);
		box-shadow: 10px 10px 0 var(--kind);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.tile a:hover .art img,
	.tile a:focus-visible .art img {
		transform: translate(-3px, -3px);
		box-shadow: 13px 13px 0 var(--kind);
	}

	.text {
		display: block;
		padding: 28px 0 0;
	}

	.text span {
		padding: 0;
	}

	/* A heading, set exactly as the plain text was. */
	.title {
		display: block;
		margin: 0;
		padding: 0;
		font-family: SourceSerifBold;
		font-weight: normal;
		font-size: 24px;
		line-height: 30px;
		letter-spacing: normal;
		text-transform: none;
		color: inherit;
		border: none;
	}

	.tile a:hover .title,
	.tile a:focus-visible .title {
		color: var(--brandMedBlue);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.summary {
		display: block;
		margin-top: 8px;
		font-family: SourceSerif;
		font-size: 16px;
		line-height: 25px;
		color: var(--brandGray70);
	}

	/* The date sits on top of the card, above the image. */
	.date {
		display: block;
		margin-bottom: 8px;
		font-family: OpenSans;
		font-size: 13px;
		line-height: 18px;
		color: var(--brandGray65);
		transition: transform 0.2s;
	}

	/* Pointing at the card lifts the date a little. */
	.tile a:hover .date,
	.tile a:focus-visible .date {
		transform: translateY(-3px);
	}

	@media (prefers-reduced-motion: reduce) {
		.tile a:hover .date,
		.tile a:focus-visible .date {
			transform: none;
		}
	}

	/* Load more, and beside it a way back up. */
	.more-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 20px 36px;
		margin-top: 80px;
	}

	.more {
		display: block;
		padding: 14px 40px;
		font-family: OpenSansBold;
		font-size: 15px;
		line-height: 22px;
		color: var(--brandDarkBlue);
		background-color: var(--brandWhite);
		border: solid 1px var(--brandDarkBlue);
		border-radius: 0;
		cursor: pointer;
		transition: background-color 0.15s, color 0.15s;
	}

	/* Beside the About title: the way back up, the opposite of the About button: white, with dark
	   blue text. */
	.top {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 17px;
		font-family: OpenSansBold;
		font-size: 15px;
		line-height: 20px;
		color: var(--brandDarkBlue);
		background-color: var(--brandWhite);
		border: solid 2px var(--brandWhite);
		border-radius: 0;
		cursor: pointer;
		transition: background-color 0.15s, color 0.15s, border-color 0.15s;
	}

	.top:hover {
		color: var(--brandWhite);
		background-color: var(--brandDarkBlue);
		border-color: var(--brandDarkBlue);
	}

	/* The arrow is a solid triangle pointing up, and bobs gently to say "up". */
	.bounce {
		display: inline-block;
		width: 0;
		height: 0;
		border-bottom: 8px solid currentColor;
		border-right: 6px solid transparent;
		border-left: 6px solid transparent;
		animation: bounce 1.6s ease-in-out infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(2px);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bounce {
			animation: none;
		}
	}

	.more:hover {
		color: var(--brandWhite);
		background-color: var(--brandDarkBlue);
	}

	.hidden-text {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media screen and (max-width: 1100px) {
		.banner {
			min-height: 0;
		}

		h1 {
			max-width: 12ch;
			white-space: normal;
			font-size: clamp(30px, calc(8vw - 6px), 66px);
		}

		.banner-inner {
			grid-template-columns: 1fr;
			padding-top: 40px;
		}

	}

	/* Two across: every other tile dropped. */
	/* ---- The about band. ---- */
	.about-band {
		/* Runs into the footer (the negative margin cancels the footer's own top margin). */
		margin-bottom: -96px;
		padding: 96px 0 160px;
		background-color: var(--brandMedBlue);
		color: var(--brandWhite);
	}

	.band-inner {
		max-width: 1560px;
		margin: 0 auto;
		padding: 0 36px 0 44px;
	}

	.band-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 24px;
		margin-bottom: 28px;
	}

	.about-band h2 {
		margin: 0;
		padding: 0;
		font-size: clamp(34px, calc(3.2vw + 4px), 50px);
		line-height: 1.02;
		letter-spacing: -0.01em;
		font-family: TradeGothicBold;
		font-weight: normal;
		color: var(--brandYellow);
		border: none;
	}

	.band-title {
		margin: 0 0 36px;
		font-family: TradeGothicBold;
		font-weight: normal;
		font-size: clamp(30px, calc(2.8vw), 42px);
		line-height: 1.1;
		color: var(--brandYellow);
	}

	.band-block {
		margin-top: 80px;
		padding-top: 36px;
		border-top: solid 1px rgba(255, 255, 255, 0.4);
	}

	.band-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 48px;
	}

	.band-item {
		display: flex;
		flex-direction: column;
	}

	.band-item h4 {
		margin: 0 0 12px;
		font-family: SourceSerifBoldItalic;
		font-weight: normal;
		font-size: 23px;
		line-height: 29px;
		color: var(--brandWhite);
	}

	.about-band p {
		max-width: 52ch;
		margin: 0 0 18px;
		padding: 0;
		font-family: SourceSerif;
		font-size: 19px;
		line-height: 30px;
		color: var(--brandWhite);
	}

	.band-item p {
		flex: 1;
	}

	.about-band a {
		color: var(--brandWhite);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.about-band a:hover {
		text-decoration-thickness: 2px;
	}

	.about-band .arrow {
		align-self: flex-start;
		font-family: OpenSansBold;
		font-size: 15px;
		line-height: 22px;
	}

	.about-band a:focus-visible,
	.top:focus-visible {
		outline: 3px solid var(--brandWhite);
		outline-offset: 3px;
	}

	/* Landing here from a "Get in touch" link leaves some room above. */
	#contact {
		scroll-margin-top: 24px;
	}

	@media screen and (max-width: 1000px) {
		.band-grid {
			grid-template-columns: 1fr;
		}
	}

	@media screen and (max-width: 1100px) {
		.tiles {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.filters {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.tile:nth-child(3n + 2) {
			margin-top: 0;
		}

		.tile:nth-child(even) {
			margin-top: 48px;
		}
	}

	/* The header's sides are closer in here, so these are too. */
	@media screen and (max-width: 730px) {
		.banner-inner {
			padding-right: 15px;
			padding-left: 20px;
		}

		.inner,
		.band-inner {
			padding-right: 15px;
			padding-left: 20px;
		}
	}

	@media screen and (max-width: 640px) {
		.lede {
			font-size: 20px;
			line-height: 30px;
		}

		.banner-inner {
			padding: 44px 15px 56px 20px;
		}

		.work {
			padding-top: 48px;
		}

		.fields input,
		.fields .search {
			flex-basis: 100%;
		}

		.about-link {
			margin-left: 0;
		}

		.filters {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		/* One across, no offset. */
		.tiles {
			grid-template-columns: 1fr;
			gap: 48px;
		}

		.tile:nth-child(even) {
			margin-top: 0;
		}
	}
</style>
