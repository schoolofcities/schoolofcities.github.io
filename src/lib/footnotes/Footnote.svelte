<script>
	export let id;
	let footnoteId = `footnote-${id[0]}`;
	let refId = `footnote-ref-${id[0]}`;
	let footnoteText = id[1];
	let isHovered = false;
	let hideTimeout;

	// A short grace period before hiding, cancelled if the mouse re-enters (either
	// the reference or the tooltip) in time. Without this, moving the cursor from
	// the [n] marker toward the tooltip crosses a gap that isn't covered by either
	// element's hitbox, so mouseleave fires and the tooltip vanishes before the
	// mouse arrives — making its text impossible to select.
	function show() {
		clearTimeout(hideTimeout);
		isHovered = true;
	}
	function scheduleHide() {
		clearTimeout(hideTimeout);
		hideTimeout = setTimeout(() => (isHovered = false), 250);
	}
</script>

<span class="footnote-ref-wrapper">
	<a
		id={refId}
		href={`#${footnoteId}`}
		class="footnote-ref" on:click|preventDefault={() => {
			const element = document.getElementById(footnoteId);
			if (element) element.scrollIntoView({ behavior: 'auto', block: 'start' });
		}}
		on:mouseenter={show}
		on:mouseleave={scheduleHide}
	>
		<span>[{id[0]}]</span>
	</a>{#if isHovered}<div class="footnoteTooltip" on:mouseenter={show} on:mouseleave={scheduleHide}>
			<p>
				[{id[0]}] {@html footnoteText}
			</p>
		</div>{/if}
</span>

<style>
	.footnote-ref-wrapper {
		position: relative;
		font-size: 1em;
		line-height: 1;
		display: inline;
		white-space: nowrap; 
	}
	.footnote-ref {
		vertical-align: super;
		font-size: 0.8em;
		font-family: SourceSerifBold;
		font-weight: normal;
		margin-left: 1px;
		margin-right: 1px;
		text-decoration: none;
		color: var(--brandMedBlue);
		white-space: nowrap;
	}
	.footnote-ref:hover {
		color: var(--brandMedBlue);
	}

	.footnoteTooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: white;
		color: black;
		padding: 10px;
		border-radius: 0px;
		width: 340px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.38);
		border: 1px solid var(--brandGray10);
		z-index: 1000;
		pointer-events: auto;
		user-select: text;
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;
	}

	.footnoteTooltip p {
		padding: 0px;
		margin: 0px;
		font-family: SourceSerif;
		color: var(--brandGray80);
		font-weight: normal;
		font-size: 15px;
		line-height: 20px;
		white-space: normal;
    	word-wrap: break-word;
    	overflow-wrap: break-word;
	}

	@media (max-width: 980px) {
		.footnoteTooltip {
			display: none !important;
		}
	}
</style>
