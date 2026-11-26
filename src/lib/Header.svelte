<script>
	import logo from './images/sofc-uoft-logo-white-colour.svg';

	// `flat` drops the shadow and light edge, so the header melts into the navy home
	// page; a post keeps the lifted look.
	let { backgroundColor = 'var(--brandDarkBlue)', flat = false } = $props();
</script>

<header class="logo-container" class:flat style="background-color: {backgroundColor}">
	<a
		href="https://schoolofcities.utoronto.ca/"
		target="_blank"
		rel="noopener noreferrer"
		class="logo-link"
	>
		<img src={logo} alt="UofT and School of Cities logos" class="logo" />
	</a>
</header>

<style>
	.logo-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 65px;
		margin-top: 0px;
		margin-bottom: 0px;
		/* A clear light blue edge, so the header stays its own strip whatever
		   colour sits under it (the medium blue post title band, for one), and
		   the same soft shadow as that band (Title.svelte). Positioned and
		   raised so the shadow falls on the band rather than being painted over
		   by it. */
		border-bottom: solid 1px var(--brandLightBlue);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
		position: relative;
		z-index: 1;
		padding: 0px;
	}

	.logo-container.flat {
		box-shadow: none;
		border-bottom-color: rgba(255, 255, 255, 0.12);
	}

	.logo {
		width: 253px;
		height: 50px;
		padding: 0px;
		padding-left: 35px;
		margin-bottom: -5px;
	}

	.logo:hover {
		opacity: 0.75;
	}

	@media (max-width: 730px) {
		.logo {
			width: 157px;
			padding-left: 15px;
			margin-top: 0px;
		}
		.logo-container {
			height: 49px;
			margin-bottom: 0px;
		}
	}
</style>
