<script>
	// Wraps the drawn parts of a chart — SVGs, map images, legends, axis and
	// value labels — and hides them from screen readers. Every chart component
	// uses it.
	//
	// Screen-reader users get the chart from its alt text instead, which
	// ChartFrame reads out first, straight after the subtitle. Without this,
	// they would hear every tick label and data label in markup order.
	//
	// Interactive controls (buttons, toggles, search boxes) go outside it, so
	// they stay announced and usable. Use it as many times as a chart needs:
	// once around everything for a chart with no controls, or around each
	// drawn part when controls sit between them. Never put anything focusable
	// inside it — a hidden element that can still take focus is announced as
	// nothing.
	//
	// Extra attributes pass through to the wrapper, for when it replaces an
	// element in a flex or grid layout: <ChartGraphic style="flex: none">.
	let { children, ...rest } = $props();
</script>

<div aria-hidden="true" {...rest}>
	{@render children()}
</div>
