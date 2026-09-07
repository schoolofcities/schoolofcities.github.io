<script>
	// Each panel is a prerendered PNG, not drawn geometry. The 584 census tracts
	// carry ~104 vertices each and every panel repeats all of them, which put
	// 11.9 MB of path data into this page — 97% of it — to draw shapes about 7px
	// across. These are the same panels captured at 2x their 360px display width
	// and quantised: 354 KB for all six.
	//
	// The blank margin around each map is part of the image (the export widened
	// the projection's viewBox by 10 display px on each side), so the panel needs
	// no horizontal padding and the image spans its full width.
	//
	// Regenerating them means re-running the map pipeline in
	// github.com/schoolofcities/public-libraries. The tract geometry is no longer
	// imported here.
	import visibleMinority from '../images/demographics-visible-minority.png';
	import lowIncome from '../images/demographics-low-income.png';
	import recentImmigrants from '../images/demographics-recent-immigrants.png';
	import firstGenImmigrants from '../images/demographics-first-gen-immigrants.png';
	import seniors from '../images/demographics-seniors.png';
	import children from '../images/demographics-children.png';

	// Colours and breaks describe what the PNGs already show, so the legend can't
	// disagree with the image unless the maps are re-exported without updating
	// these. Breaks carry over from the pipeline's own quartiles.
	const PANELS = [
		{ label: 'Visible minority', src: visibleMinority, colors: ['#F0E9F1', '#C4A7C9', '#9865A1', '#6D247A'], breaks: [25, 50, 75] },
		{ label: 'Low income', src: lowIncome, colors: ['#E5F2F5', '#99CBDA', '#4CA5BE', '#007FA3'], breaks: [30, 35, 40] },
		{ label: 'Recent immigrants', src: recentImmigrants, colors: ['#FBECEA', '#F1B5AD', '#E67D70', '#DC4633'], breaks: [3, 6, 9] },
		{ label: 'First-gen. immigrants', src: firstGenImmigrants, colors: ['#E5F5F3', '#99D9CF', '#4CBDAC', '#00A189'], breaks: [35, 50, 65] },
		{ label: 'Seniors (65+)', src: seniors, colors: ['#E8EBEF', '#A5AFC1', '#617393', '#1E3765'], breaks: [15, 17.5, 20] },
		{ label: 'Children (0–14)', src: children, colors: ['#F3F8EA', '#D1E5AB', '#AFD26C', '#8DBF2E'], breaks: [12, 14, 16] }
	];
</script>

<div class="grid">
	{#each PANELS as panel}
		<div class="panel">
			<div class="panel-title">{panel.label} (%)</div>
			<div class="legend-row">
				<div class="legend">
					{#each panel.colors as color}
						<div class="legend-segment" style="background: {color};"></div>
					{/each}
					{#each panel.breaks as brk, i}
						<span class="legend-tick" style="left: {((i + 1) / panel.colors.length) * 100}%;"
							>{brk}%</span
						>
					{/each}
				</div>
				<div class="library-legend">
					<span class="library-dot"></span>
					<span>Public library</span>
				</div>
			</div>
			<!-- width/height are the display size; each file is 720x386, twice that
			     in both directions, so it stays sharp on high-density screens. alt is
			     empty because ChartFrame labels the figure as a whole. -->
			<img class="panel-map" src={panel.src} width="360" height="193" alt="" />
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, 360px);
		/* ChartFrame's .chart-body sits inside 20px padding + a 1px border, which
		   otherwise eats into the 1080/720px available for 360px panels — this
		   reclaims it so 3 (or 2) panels fit exactly, flush with the frame edge. */
		margin: 0 -21px;
	}

	.panel {
		width: 360px;
		box-sizing: border-box;
		/* No horizontal padding: the images span the full panel width. The inset
		   around each map is baked into the image itself via the viewBox below,
		   so adjacent panels don't touch. */
		padding: 10px 0 16px;
	}

	.panel-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 13px;
		color: var(--brandGray90);
		margin: 0 0 10px 20px;
	}

	.panel-map {
		display: block;
		width: 100%;
		height: auto;
	}


	.legend-row {
		display: flex;
		align-items: center;
		gap: 20px;
		margin: 0 0 20px 20px;
	}

	.legend {
		position: relative;
		display: flex;
		gap: 1px;
		width: 50%;
		height: 9px;
		background: var(--brandWhite);
	}

	.legend-segment {
		flex: 1;
	}

	.legend-tick {
		position: absolute;
		top: 100%;
		transform: translateX(-50%);
		margin-top: 3px;
		font-family: OpenSans;
		font-size: 11px;
		color: var(--brandGray90);
	}

	.library-legend {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: OpenSans;
		font-size: 11px;
		color: var(--brandGray90);
	}

	.library-dot {
		flex-shrink: 0;
		box-sizing: border-box;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #ffdc14;
		border: solid 1px var(--brandBlack);
	}
</style>
