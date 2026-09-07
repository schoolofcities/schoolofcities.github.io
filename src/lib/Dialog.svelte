<script>
	let { id, title, dialogRef = $bindable(), children } = $props();

	function closeOnBackdropClick(event) {
		if (event.target === dialogRef) dialogRef.close();
	}
</script>

<dialog {id} bind:this={dialogRef} class="app-dialog" onclick={closeOnBackdropClick}>
	<div class="app-dialog-inner">
		<div class="app-dialog-header">
			<h4>{title}</h4>
			<!-- A submit button inside method="dialog" closes the dialog natively,
			     with no script — supported everywhere <dialog> itself is. Backdrop
			     click stays a JS nicety on top. -->
			<form method="dialog">
				<button type="submit" class="app-dialog-close" aria-label="Close">×</button>
			</form>
		</div>
		{@render children()}
	</div>
</dialog>

<style>
	.app-dialog {
		box-sizing: border-box;
		width: min(560px, 90vw);
		border: solid 1px var(--brandGray20);
		border-top: solid 3px var(--brandDarkBlue);
		padding: 0;
		background-color: var(--brandWhite);
	}

	.app-dialog::backdrop {
		background-color: var(--brandDarkBlue);
		opacity: 0.6;
	}

	.app-dialog-inner {
		padding: 20px;
	}

	.app-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.app-dialog-header h4 {
		font-family: TradeGothicBold;
		font-weight: normal;
		font-size: 20px;
		color: var(--brandDarkBlue);
		margin: 0;
	}

	.app-dialog-close {
		font-family: OpenSans;
		font-size: 20px;
		line-height: 1;
		color: var(--brandGray70);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.app-dialog-close:hover {
		color: var(--brandDarkBlue);
	}

	/* Shared by dialog content authored in other components (ChartFrame, Title). */
	:global(.dialog-section-label) {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 12px;
		color: var(--brandGray90);
		margin: 0 0 8px 0;
	}

	:global(.dialog-instructions) {
		font-family: OpenSans;
		font-weight: normal;
		font-size: 13px;
		line-height: 18px;
		color: var(--brandGray70);
		margin: 0 0 8px 0;
	}

	:global(.dialog-code) {
		box-sizing: border-box;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono',
			monospace;
		font-size: 12px;
		line-height: 18px;
		color: var(--brandGray90);
		background-color: var(--brandWhite);
		border: solid 1px var(--brandGray20);
		border-radius: 4px;
		padding: 10px;
	}

	:global(textarea.dialog-code) {
		width: 100%;
		resize: vertical;
		margin-bottom: 12px;
	}

	:global(.dialog-action) {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--brandGray70);
		background: none;
		border: solid 1px var(--brandGray20);
		border-radius: 4px;
		width: 40px;
		height: 40px;
		box-sizing: border-box;
		cursor: pointer;
		flex-shrink: 0;
	}

	:global(.dialog-action:hover) {
		background-color: var(--brandGray05);
	}

	:global(.dialog-option:not(:last-child)) {
		margin-bottom: 16px;
	}

	:global(.dialog-row) {
		display: flex;
		gap: 8px;
	}

	:global(.dialog-row input.dialog-code),
	:global(.dialog-row textarea.dialog-code) {
		flex: 1;
		min-width: 0;
		width: auto;
		margin-bottom: 0;
	}
</style>
