# Writing text for posts

**Structure**

- [ ] Do not bury the lede. State the single most specific, useful thing this post gives the reader upfront: a finding, result, or comparison, or, for descriptive/mapping posts, the most salient pattern in the data (e.g. "13% of streets have no sidewalk at all, concentrated in the inner suburbs"). Details and methods come later. Assume a reader, a search snippet, or an AI summary only reads the title, subtitle, and first paragraph. At least one of these should have key finding(s).

- [ ] If there's no specific result or pattern worth stating in one sentence, treat that as a signal the project may not need to be a standalone post.

- [ ] Only include the context needed to understand that first finding in the opening block of text (before the first chart). Deeper background goes later in the post, or in a footnote.

- [ ] Alternate text and charts. Try not to have a chart-free block of more than 2-3 paragraphs, and try not to stack charts without interpretive text between them.

- [ ] Every chart should have a sentence or two saying what to look at or what it means, not just a restatement of its title.

- [ ] Methods and limitations get their own section near the end (a collapsed `<details>` is fine — still present in the static HTML, fully readable to search engines and AI, just not imposed on a skimming reader).

- [ ] Close on a synthesis. What the findings mean together, not just a list of results.

- [ ] Each chart's title/subtitle and the post's key sentences should stand alone. Assume they get copied into a slide, a brief, or a search snippet with no surrounding text.


**Voice**

- [ ] Omit needless words.

- [ ] Active voice, not passive ("we mapped Z," not "Z was mapped").

- [ ] Plain, concrete language over hedged or academic phrasing.

- [ ] No rhetorical questions or manufactured suspense.

- [ ] No loaded or emotive language. Describe, don't persuade.

- [ ] Try not to have sentences with 3 or more numbers/stats (hard for people to compare)


**Mechanics**

- [ ] Titles and subtitles (post title, chart titles/subtitles, section headings) use sentence case, not title case. Capitalize only the first word and proper nouns.

- [ ] Canadian spelling (colour, neighbourhood, centre, etc.) and metric units (km, g, °C, etc.).

- [ ] No accents on Montreal or Quebec


**Stance and attribution**

- [ ] Do not make claims that are not backed by the analysis, graphics, or have an apt citation.

- [ ] Evaluative claims are fine (what a finding means, whether something achieved its goal). Prescriptive claims ("__ should...") written in the post's own voice don't belong in a post. That's the job of a policy brief, op-ed, or another longer-form product/project.

- [ ] A source's own prescriptive claim can be reported if the source stays the grammatical subject of the "should" — "Song argues that policymakers should reconsider FBTs" is fine; "Policymakers should reconsider FBTs (Song, 2025)" is not, since that makes it SofC's assertion with the citation just as supporting evidence.

- [ ] Every claim beyond what this post's own authors actually did is attributed to its source, including background/motivating literature, not just the paper the post is "from."

- [ ] "We" is used only for what this post's own authors did (mapped, computed, adapted, combined, wrote), never for someone else's finding or broader group of people. Use "Author Name" if want to attribute to someone else.

- [ ] Every source named in the prose is referenced somewhere a reader can follow up. If the post is based on another's work, then it should have an entry in `meta.json`'s `documents[]`.

- [ ] Footnote a general or background claim, so it doesn't interrupt the reading flow, and it stacks cleanly if more than one source backs the same claim (e.g. "closer libraries see more use" citing two unrelated studies).

- [ ] Inline link a specific, singular resource that is the direct thing the sentence is describing or built on, such as the paper or dataset the post's own analysis draws from, a specific report, a repo, an open data page, etc. These would be links that the reader might want to open right now. Generally, if it's the source of what this sentence is about, link it; if it's supporting evidence for a claim made in passing, footnote it.

