# Checklist for designing graphics

**High level**

- [ ] Omit needless ink. Aim for high data-to-ink ratio.

- [ ] Think if someone outside the project can read a graphic and take away the right thing (show it to a couple people to assess)

- [ ] Selecting the 'best' chart for data can be hard. Iterate over a few different options if stuck. Use online resources like 'data-to-viz' to help pick charts for specific data types or relationships.

- [ ] Visual hierarchy should point at the takeaway. It decides where the reader's eye lands first, and if that isn't the finding, the chart isn't as useful. Couple ways to check this: blur or squint at the chart and see what still stands out, or show it for five seconds to someone and ask what someone noticed.

- [ ] All graphics should be designed at one or more of the following set widths. 1440px, 1080px (full width report), 720px, 540px (half width report), 360px. But no other widths. For print/reports, export at 2x the resolution they were designed for (this process should be automatic if graphics are part of a post at schoolofcities.github.io)

- [ ] Keep file sizes as small as possible. No more than 2 MB per graphic, ideally less than 1 MB. If the file is larger than this, try to quantize it to a flat .png.


**Colour**

- [ ] Use brand colours defined in `styles.css`. If you need a gradient, use the brand colours as end and/or mid-points of gradient.

- [ ] Be consistent with colour between graphics. If `brandMedBlue` is used to represent a group in one chart, use same colour in another chart

- [ ] Use colour sparingly and selectively. We have lots of colours in our brand palette, but charts with lots of colour can be more difficult to read. Good rule-of-thumb is start graphic in monochrome, then use additional colour for key values/trends/etc. you want to highlight.


**Text on charts**

- [ ] In most cases, the title should be about the finding, not the variable. e.g. "Rents rose fastest in mid-sized cities" beats "Average rent by city, 1990–2025."

- [ ] Use annotations on charts where applicable to highlight key findings or trends

- [ ] Where possible, label key chart elements (e.g. a trend line) directly via an annotation rather than a legend item.

- [ ] Units, denominators, sample size, key limitations, exclusions should be stated on chart or as note below the chart.

- [ ] OpenSans font family for all text on charts. Can use Bold, Italic, and BoldItalic that are included in `styles.css`, but do not use other font variants of OpenSans.

- [ ] No fonts smaller than 12px on desktop view (540px chart or larger). No smaller than 10px on mobile view (360px wide chart)


**Accessibility checks**

- [ ] View every graphic under deuteranopia, protanopia and tritanopia simulation. Ideally the chart is also readable if viewed in greyscale.

- [ ] Contrast ratio should meet 4.5:1 for all text, inclusive of all labels, legend text, notes, etc.

- [ ] Non-text 3:1 minimum contrast ratio.

- [ ] For web-based graphics, all graphics should have alt-text that describe chart and key values. Good alt-text is one to three sentences that name the chart type, what it compares and its main finding; put the supporting detail in a longer description and leave exact values to the data download.

- [ ] For web-based graphics, chart views with JavaScript turned off.


**Misc.**

- [ ] Do not use pie charts for more than 3 categories

- [ ] Do not truncate 0s from axes on bar charts or other charts when showing total values. For other stats (e.g. averages), if 0 is in the neighbourhood, invite it in.

- [ ] Avoid dual axis charts (e.g. one y-axis shows rents and other y-axis shows income). These kinds of charts are difficult to read and are often misleading

- [ ] If the data carries uncertainty, the chart should show it (e.g. error bars, confidence ranges, etc.).

- [ ] Limit 3D as harder for eye to parse out differences in values 

- [ ] Small multiples are often better for comparing multiple categories over including everything in one dense chart

- [ ] Use Mercator projection for city-scale (or more zoomed-in) maps. Conic projection for national or continental scale map. 



**Checking data**

- [ ] (For when we adapt someone else's chart). Any number we copied should be double checked against the original before publishing

- [ ] (For when we adapt someone else's chart). If we recalculated, aggregated, or converted, should be checked back with the author(s)

- [ ] (For when we adapt someone else's chart). Chart titles or other text describing the chart should not claim more than the source research does

- [ ] (For when we adapt someone else's chart). Include any major caveats/limitations that are also noted in the source material

- [ ] (For when we create a chart for another SofC publication). Text describing that chart should be double checked to numbers directly in the chart.


