<script>
	import logos from './images/sofc-uoft-logo-white-colour.svg';

	// `flat`: a closer, darker footer for the navy home and about pages.
	let { flat = false } = $props();
</script>

<footer class="footer" class:flat>
	<div class="footer-content">
		<a
			href="https://schoolofcities.utoronto.ca/"
			target="_blank"
			rel="noopener noreferrer"
			class="logo-link"
		>
			<img src={logos} alt="University of Toronto and School of Cities logos" class="logos" />
		</a>
	</div>
</footer>

<style>
	.footer {
		width: 100%;
		background-color: var(--brandDarkBlue);
		margin-top: 150px;
		padding-top: 64px;
		padding-bottom: 56px;
		text-align: center;
		border-top: solid 1px var(--brandGray20);
	}

	.footer.flat {
		margin-top: 96px;
		background-color: color-mix(in srgb, black 20%, var(--brandDarkBlue));
		border-top: none;
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 700px;
		margin: 0 auto;
	}

	.logo-link:focus-visible {
		outline: 3px solid var(--brandYellow);
		outline-offset: 3px;
	}

	.logos {
		width: 300px;
		height: auto;
		display: block;
		margin: 0 auto;
	}

	.logos:hover {
		opacity: 0.75;
	}

	@media (max-width: 800px) {
		.footer {
			margin-top: 125px;
			padding-top: 44px;
			padding-bottom: 40px;
		}

		.logos {
			width: 250px;
		}
	}

	@media (max-width: 500px) {
		.logos {
			width: 225px;
		}
	}
</style>
