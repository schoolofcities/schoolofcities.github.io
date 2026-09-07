<script>
	import logos from './images/sofc-uoft-logo-white-colour.svg';
</script>

<footer class="footer">
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
		padding-top: 25px;
		padding-bottom: 25px;
		text-align: center;
		border-top: solid 1px var(--brandGray20);
	}

	.footer-content {
		max-width: 700px;
		margin: 0 auto;
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
			padding-top: 15px;
			padding-bottom: 15px;
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
