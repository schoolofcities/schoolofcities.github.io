<script>
	import { documentGroups, formatAuthorList } from './meta.js';

	let { meta } = $props();

	const documentLabels = {
		report: 'Report',
		brief: 'Policy brief',
		'project-site': 'Project',
		paper: 'Journal article',
		explorer: 'Data explorer',
		post: 'Post',
		dataset: 'Data',
		code: 'Code repository'
	};

	function documentLabel(doc) {
		return documentLabels[doc.type] ?? doc.type;
	}

	// Citations follow Chicago author-date, except that every author is written
	// first name first ("Polina Gorn", not "Gorn, Polina"), as in the post's own
	// byline: Authors. Year. Title. Publication. formatAuthorList already joins
	// names Chicago's way ("A and B", "A, B, and C"). Every title is set the
	// same way, in italics, whatever the type; the publication is plain.

	// Closes a citation element with a full stop, unless it already ends in
	// punctuation ("Jr.", or a title ending in "?"), which would double it.
	function closed(text) {
		return /[.?!]$/.test(text) ? text : `${text}.`;
	}

	// Grouped by the full set of relations each document carries, so one that is
	// both `from` and `for` is listed once under a combined heading rather than
	// appearing twice as if it were two works. See $lib/meta.js.
	const groups = $derived(documentGroups(meta.documents));
</script>

<!-- The documents a post draws on, in a thin grey frame directly below the
     title band, which ends with the authors, dates and licence (Title.svelte).
     The documents always show in full: crediting the work a post comes from
     belongs with its authorship, not at the end. -->
{#if groups.length}
	<div class="text byline-wrap">
		<div class="byline">
			{#each groups as group}
				<p class="documents-heading">{group.heading}</p>
				{#each group.docs as doc}
					<!-- The type in its own column, so it's set apart from the
					     citation by position as well as weight. -->
					<p class="document">
						<span class="document-type">{documentLabel(doc)}</span>
						<span class="document-citation">
							{closed(formatAuthorList(doc.authors))}
							{doc.year}.
							<em>{closed(doc.title)}</em>
							{#if doc.publication}
								{closed(doc.publication)}
							{/if}
						</span>
						<!-- A column of its own on wider screens. No link key means the work
						     isn't published yet: the cell stays empty rather than holding a
						     label pointing nowhere. -->
						<span class="document-link">
							{#if doc.link}
								<a href={doc.link} target="_blank" rel="noopener noreferrer">{doc.linkType}</a>
							{/if}
						</span>
					</p>
				{/each}
			{/each}
		</div>
	</div>
{/if}

<style>
	/* A thin grey frame on the page's own background, with the text inset from
	   its sides; the same border as the Methods and data box (.details-block in
	   styles.css), since both are part of the page, not lifted off it like a
	   chart. Less padding top and bottom than at the sides, since the table rows
	   carry their own spacing. The title band's bottom margin sets the gap
	   above; the wrapper's bottom margin leads into the article. */
	.byline-wrap {
		margin-bottom: 32px;
	}

	.byline {
		padding: 12px 20px;
		border: solid 1px var(--brandGray15);
	}

	/* Italic in a mid grey, set apart from the bold, darker type labels below
	   it. */
	.documents-heading {
		font-family: OpenSansItalic;
		font-weight: normal;
		font-size: 12px;
		line-height: 18px;
		color: var(--brandGray55);
		margin: 0 0 4px 0;
	}

	/* A little more space before each later group than between two entries,
	   so the groups read as groups. */
	.document + .documents-heading {
		margin-top: 12px;
	}

	/* Smaller and a shade lighter than the authors in the title band, so the
	   reference list sits quieter than the authorship. Laid out like a table:
	   a faint rule under each row and one above the first row of each group,
	   but none between columns. Every row is its own grid, so the type and
	   link columns are fixed widths, not auto, to line up from row to row; the
	   type column fits "Code repository" and the link column "Webpage", each
	   with its padding, with little to spare. */
	.document {
		display: grid;
		grid-template-columns: 110px 1fr 70px;
		font-family: OpenSans;
		font-weight: normal;
		font-size: 12px;
		line-height: 18px;
		color: var(--brandGray80);
		margin: 0;
		border-bottom: solid 1px var(--brandGray05);
	}

	.documents-heading + .document {
		border-top: solid 1px var(--brandGray05);
	}

	.document-type,
	.document-citation,
	.document-link {
		padding-top: 4px;
		padding-bottom: 4px;
	}

	/* Bold in a dark grey, a shade lighter than the citation: a category, quick
	   to scan down the column, without outweighing the citation beside it. */
	.document-type {
		font-family: OpenSansBold;
		color: var(--brandGray70);
		padding-right: 10px;
	}

	.document-citation {
		padding-left: 10px;
		padding-right: 10px;
	}

	.document-link {
		padding-left: 10px;
	}

	.document em {
		font-family: OpenSansItalic;
		font-style: normal;
	}

	.document a {
		color: inherit;
		font-family: inherit;
	}

	/* Medium blue rather than the yellow used on dark backgrounds, which
	   would all but vanish on white. */
	.document a:hover {
		color: var(--brandMedBlue);
	}

	@media screen and (max-width: 540px) {
		.documents-heading {
			font-size: 10px;
			line-height: 17px;
		}

		/* No room for columns: the type sits on its own line, and the link goes
		   back to the end of the citation, as in running text. The row rules
		   still separate entries. */
		.document {
			display: block;
			padding: 4px 0;
			font-size: 10px;
			line-height: 16px;
		}

		.document-type {
			display: block;
			padding: 0;
		}

		.document-citation,
		.document-link {
			display: inline;
			padding: 0;
		}
	}
</style>
