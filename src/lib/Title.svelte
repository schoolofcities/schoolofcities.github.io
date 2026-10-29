<script>
	import { formatAuthorList, lastUpdated, licenseLabel, licenseUrl } from './meta.js';
	import { TAG_ICONS, TAG_ICON_POSTS } from './tagIcons.js';

	let { meta, slug } = $props();

	// Ring colours, given by position: the first icon is always yellow, and so
	// on. By position rather than by tag, since three colours can't give every
	// tag its own.
	const iconColors = ['var(--brandYellow)', 'var(--brandLightBlue)', 'var(--brandLightGreen)'];

	// One circle for each of the first three tags that have an icon, in the
	// tags' own order, which meta.json sets by priority.
	const tagIcons = $derived(
		TAG_ICON_POSTS.includes(slug)
			? (meta.tags ?? [])
					.filter((tag) => TAG_ICONS[tag])
					.slice(0, iconColors.length)
					.map((tag, i) => ({ tag, path: TAG_ICONS[tag], color: iconColors[i] }))
			: []
	);
</script>

<div class="title-hero">
	<div class="text title-inner">
		{#if tagIcons.length}
			<!-- Decorative: hidden from screen readers, and no hover tooltip. The
			     tags are in the page's keywords already. -->
			<ul class="tag-icons" aria-hidden="true">
				{#each tagIcons as icon}
					<li class="tag-icon" style:border-color={icon.color}>
						<svg viewBox="0 0 15 15">
							<path d={icon.path} />
						</svg>
					</li>
				{/each}
			</ul>
		{/if}

		<h1>{meta.title}</h1>

		{#if meta.summary}
			<p class="summary">{meta.summary}</p>
		{/if}

		<!-- Authors, dates and licence close the title block; the documents the
		     post draws on follow directly below the band (Byline.svelte). Who on
		     the left; facts about the post (dates, licence) on the right, so the
		     licence reads as the post's, not the authors'. Stacked on phones. A
		     revised post gets a labelled line per date; each date is nowrap, so
		     it never breaks at a hyphen. -->
		<div class="credits">
			<span class="authors">{formatAuthorList(meta.authors)}</span>
			<span class="post-facts">
				{#if lastUpdated(meta.changelog)}
					<span class="nowrap"><em>First published:</em> {meta.published}</span>
					<span class="nowrap"><em>Updated:</em> {lastUpdated(meta.changelog)}</span>
				{:else}
					<span class="nowrap">{meta.published}</span>
				{/if}
				{#if meta.license}
					<span class="license-line">
						This post is licensed under
						{#if licenseUrl(meta.license)}
							<a href={licenseUrl(meta.license)} target="_blank" rel="noopener noreferrer"
								>{licenseLabel(meta.license)}</a
							>
						{:else}
							{meta.license}
						{/if}
					</span>
				{/if}
			</span>
		</div>
	</div>
</div>

<style>
	/* Vertical spacing: 23px within the title group (title, rule, summary), 48px
	   from the icons to the title they label, and a frame of 83px at the top of the
	   band and 63px at the bottom, under the credits line that closes it. The
	   paddings here are 10px short of that because .text adds 10px of its own.
	   The bottom margin is the gap to the documents box (Byline.svelte) on the
	   page below. Phones use a tighter version of the same steps (see the media
	   query at the end). */
	.title-hero {
		background-color: var(--brandMedBlue);
		padding-top: 73px;
		padding-bottom: 53px;
		margin-bottom: 40px;
		/* A soft shadow onto the page below, in place of a coloured rule, so the
		   band reads as lifted rather than outlined. */
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
	}

	/* Topic icons above the title: white glyphs in rings coloured yellow, light
	   blue and light green (set inline, by position), after the icon row on the
	   World Cup pages, but static. */
	.tag-icons {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		list-style: none;
		padding: 0;
		margin: 0 0 48px 0;
	}

	/* Box-sizing and padding reset, since the global `li` adds 4px top and
	   bottom, which stretches the circle into an oval. */
	.tag-icon {
		box-sizing: border-box;
		padding: 0;
		width: 45px;
		height: 45px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--brandYellow);
	}

	.tag-icon svg {
		width: 22px;
		height: 22px;
		fill: var(--brandWhite);
	}

	.title-inner h1 {
		font-size: 44px;
		line-height: 55px;
		color: var(--brandWhite);
		/* Yellow, the band's one warm accent; the header's line above is light
		   blue. */
		border-bottom: 2px solid var(--brandYellow);
		padding-bottom: 23px;
		/* The browser's default top margin (about 29px) would otherwise set the
		   gap above the title, and differ with and without the icon row. */
		margin-top: 0;
		margin-bottom: 23px;
	}

	.summary {
		font-family: SourceSerifItalic;
		font-weight: normal;
		font-size: 26px;
		line-height: 35px;
		color: var(--brandWhite);
		margin-top: 0;
		margin-bottom: 0;
	}

	/* Set off from the title and summary by space and a faint white rule (57%,
	   a little fainter than the licence line's 70%). */
	.credits {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-top: 120px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.57);
		font-family: OpenSans;
		font-size: 14px;
		line-height: 20px;
		color: var(--brandWhite);
	}

	.post-facts {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		text-align: right;
	}

	.credits em {
		font-family: OpenSansItalic;
		font-style: normal;
	}

	.nowrap {
		white-space: nowrap;
	}

	/* White at 99%, the faintest that still passes WCAG AA (4.5:1) for text
	   this small on the medium blue band: 4.54:1. Even solid white is only
	   4.6:1 here, so it's set apart from the authors by size, not colour. */
	.license-line {
		margin-top: 4px;
		font-size: 11px;
		line-height: 17px;
		color: rgba(255, 255, 255, 0.99);
	}

	.license-line a {
		color: inherit;
		font-family: inherit;
	}

	.license-line a:hover {
		color: var(--brandYellow);
	}

	/* Phones: type about 10% smaller, where a long title otherwise wraps to five
	   or six lines, tighter spacing, and the credits stacked. */
	@media screen and (max-width: 540px) {
		/* The same spacing steps, tightened: a 54px frame (34px at the bottom),
		   42px from the icons to the title, and 24px down to the documents. */
		.title-hero {
			padding-top: 44px;
			padding-bottom: 24px;
			margin-bottom: 24px;
		}

		.tag-icons {
			margin-bottom: 42px;
		}

		.title-inner h1 {
			font-size: 40px;
			line-height: 50px;
		}

		.summary {
			font-size: 23px;
			line-height: 32px;
		}

		/* About a tenth smaller than on desktop. */
		.tag-icon {
			width: 40px;
			height: 40px;
		}

		.tag-icon svg {
			width: 19px;
			height: 19px;
		}

		/* Too narrow for two columns: authors, then the dates and licence. */
		.credits {
			flex-direction: column;
			gap: 0;
			margin-top: 108px;
			font-size: 13px;
			line-height: 19px;
		}

		.post-facts {
			align-items: flex-start;
			text-align: left;
		}

		.license-line {
			font-size: 10px;
		}
	}
</style>
