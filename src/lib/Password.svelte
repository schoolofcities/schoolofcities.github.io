<script>
	// Courtesy-level gate for posts still in progress, not real security: the
	// password is just the post's own slug, and the content is already sitting
	// in the built page's JS either way. It exists so an in-progress link
	// dropped in Slack doesn't get casually forwarded or indexed.
	let { slug, locked = true, children } = $props();

	const storageKey = `sofc-post-unlock:${slug}`;

	let unlocked = $state(false);
	let input = $state('');
	let showError = $state(false);

	// Runs client-side only, after the gated (locked-looking) markup has
	// already been sent to the crawler/archiver — reading localStorage during
	// prerender would just throw.
	$effect(() => {
		try {
			unlocked = localStorage.getItem(storageKey) === 'true';
		} catch {
			// Storage disabled (private mode, etc.) — fall back to asking every time.
		}
	});

	function submit(event) {
		event.preventDefault();
		if (input.trim().toLowerCase() === slug.toLowerCase()) {
			unlocked = true;
			showError = false;
			try {
				localStorage.setItem(storageKey, 'true');
			} catch {
				// Nothing to fall back to — it'll just ask again next visit.
			}
		} else {
			showError = true;
		}
	}
</script>

{#if !locked || unlocked}
	{@render children()}
{:else}
	<div class="password-gate">
		<p class="password-gate-warning">
			Under development, please do not share without permission.
		</p>
		<form class="password-gate-form" onsubmit={submit}>
			<input
				type="password"
				placeholder="Password"
				bind:value={input}
				autocomplete="off"
			/>
			<button type="submit">Unlock</button>
		</form>
		{#if showError}
			<p class="password-gate-error">Incorrect password.</p>
		{/if}
	</div>
{/if}

<style>
	.password-gate {
		box-sizing: border-box;
		max-width: 480px;
		margin: 60px auto;
		padding: 20px;
		border: solid 1px var(--brandGray20);
		border-top: solid 3px var(--brandYellow);
		background-color: var(--brandWhite);
	}

	.password-gate-warning {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 14px;
		line-height: 20px;
		color: var(--brandGray90);
		margin: 0 0 16px 0;
	}

	.password-gate-form {
		display: flex;
		gap: 8px;
	}

	.password-gate-form input {
		flex: 1;
		min-width: 0;
		box-sizing: border-box;
		font-family: OpenSans;
		font-size: 14px;
		padding: 8px 10px;
		border: solid 1px var(--brandGray20);
		border-radius: 4px;
	}

	.password-gate-form button {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 14px;
		color: var(--brandWhite);
		background-color: var(--brandDarkBlue);
		border: none;
		border-radius: 4px;
		padding: 8px 16px;
		cursor: pointer;
	}

	.password-gate-form button:hover {
		opacity: 0.85;
	}

	.password-gate-error {
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandRed);
		margin: 10px 0 0 0;
	}
</style>
