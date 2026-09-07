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
		height: 60px;
		margin-top: 0px;
		margin-bottom: 0px;
		border-bottom: solid 1px var(--brandLightBlue);
		padding: 0px;
	}

	.logo {
		width: 255px;
		height: 51px;
		padding: 0px;
		padding-left: 35px;
		margin-bottom: -5px;
	}

	.logo:hover {
		opacity: 0.75;
	}

	@media (max-width: 730px) {
		.logo {
			width: 158px;
			padding-left: 15px;
			margin-top: 0px;
		}
		.logo-container {
			height: 40px;
			margin-bottom: 0px;
		}
	}
</style>
