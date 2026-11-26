<script>
	import { unlocked as unlockedPages } from './gate.svelte.js';

	// Courtesy-level gate for posts still in progress, not real security: the
	// password is just the post's own slug, and the content is already sitting
	// in the built page's JS either way. It exists so an in-progress link
	// dropped in Slack doesn't get casually forwarded or indexed.
	//
	// `slug` names the page (it keys the remembered unlock). `password` is what unlocks it, the
	// slug unless one is given (the home page has its own). `link` is shown under the warning, a
	// way out to somewhere public: `{ href, label }`, the School of Cities home page unless given.
	let {
		slug,
		password = slug,
		locked = true,
		link = { href: 'https://schoolofcities.utoronto.ca/', label: 'Go to the School of Cities home page' },
		children
	} = $props();

	const storageKey = `sofc-post-unlock:${slug}`;

	// Kept in one shared place, so the site layout can tell too (it hides the header and footer
	// of a gated page until it is unlocked).
	const unlocked = $derived(Boolean(unlockedPages[slug]));
	let input = $state('');
	let showError = $state(false);

	// Runs client-side only, after the gated (locked-looking) markup has
	// already been sent to the crawler/archiver — reading localStorage during
	// prerender would just throw.
	$effect(() => {
		try {
			unlockedPages[slug] = localStorage.getItem(storageKey) === 'true';
		} catch {
			// Storage disabled (private mode, etc.) — fall back to asking every time.
		}
	});

	function submit(event) {
		event.preventDefault();
		if (input.trim().toLowerCase() === password.toLowerCase()) {
			unlockedPages[slug] = true;
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
		{#if link}
			<p class="password-gate-link">
				<a href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <span aria-hidden="true">→</span></a>
			</p>
		{/if}
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

	.password-gate-link {
		margin: -6px 0 16px 0;
		font-family: OpenSans;
		font-size: 14px;
		line-height: 20px;
	}

	.password-gate-link a {
		font-family: OpenSans;
		color: var(--brandDarkBlue);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.password-gate-link a:hover {
		text-decoration-thickness: 2px;
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
