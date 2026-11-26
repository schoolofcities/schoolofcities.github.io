function parseMarkdown(text) {
	return text
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold
		.replace(/\*(?!\*)(.+?)\*/g, '<em>$1</em>') // italics
		.replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // links, opened in a new tab like the site's other external links
		.replace(/\n\n/g, '<span class="footnote-gap"></span>') // blank line between references, sized by each component
		.replace(/\n/g, '<br>'); // line breaks
}

export function createFootnoteStore() {
	let footnotes = [];

	function addFootnote(text) {
		const id = footnotes.length + 1;
		const parsed = parseMarkdown(text);
		footnotes.push({ id, text: parsed });
		return [id, parsed];
	}

	return {
		get footnotes() {
			return footnotes;
		},
		addFootnote
	};
}
