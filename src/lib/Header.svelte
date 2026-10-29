<script>
	import logoBlueColour from './images/sofc-uoft-logo-blue-colour.svg';
	import logoWhiteColour from './images/sofc-uoft-logo-white-colour.svg';
	import logoBlack from './images/sofc-uoft-logo-black.svg';
	import logoWhite from './images/sofc-uoft-logo-white.svg';

	let { logoType = 'Blue', backgroundColor = 'var(--brandWhite)' } = $props();
</script>

<header class="logo-container" style="background-color: {backgroundColor}">
	<a
		href="https://schoolofcities.utoronto.ca/"
		target="_blank"
		rel="noopener noreferrer"
		class="logo-link"
	>
		{#if logoType === 'Blue'}
			<img src={logoBlueColour} alt="UofT and School of Cities logos" class="logo" />
		{:else if logoType === 'White'}
			<img src={logoWhiteColour} alt="UofT and School of Cities logos" class="logo" />
		{:else if logoType === 'Black'}
			<img src={logoBlack} alt="UofT and School of Cities logos" class="logo" />
		{:else if logoType === 'WhiteOnly'}
			<img src={logoWhite} alt="UofT and School of Cities logos" class="logo" />
		{/if}
	</a>
</header>

<style>
	.logo-container {
		display: flex;
		align-items: center;
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
