# Contributing

Thanks for helping with the site. There are two kinds of contribution, each with its own workflow:

- [Creating or editing a post](#workflow-1-creating-or-editing-a-post)
- [Changing anything else in the repo](#workflow-2-changing-site-code) (components, scripts, styles, config, workflows)

Both follow the same rule: **nothing merges to `main` without a review.** Merging to `main` deploys the live site.

## Setup

You need Node 22 (the version CI uses).

```sh
git clone <repo-url>
cd schoolofcities.github.io
npm install
npm run dev
```

`npm run dev` serves the site locally with hot reload.

## Project layout

| Path | What lives there |
| --- | --- |
| `posts/<post-name>/` | One folder per post. The folder name is the page URL. |
| `links/<item-name>/` | One folder per item hosted elsewhere (explorers, features, posts on other sites), listed on the home page alongside the posts. See [Catalogue metadata](#catalogue-metadata). |
| `src/lib/` | Shared components (`ChartFrame`, `Header`, `Footer`, ...), global styles (`styles.css`) and helpers |
| `src/routes/` | Site routes and layout |
| `scripts/` | `validate.js`, PNG export and optimization, CSS stripping |
| `static/` | Files served as-is |
| `docs/` | Team guides: the [project workflow](docs/mapsviz-project-workflow.html) and the review checklists |
| `.github/workflows/` | `check.yml` (runs on every PR) and `deploy.yml` (runs on push to `main`) |

A post folder contains:

| Item | Status | Purpose |
| --- | --- | --- |
| `meta.json` | Required | See [Catalogue metadata](#catalogue-metadata) |
| `+page.svelte` | Required | Body content |
| `charts.js` | Required | Chart metadata (ids, titles, sources, alt text, long descriptions, notes) |
| `charts/` | Required | One `<chart-id>.svelte` per chart listed in `charts.js` |
| `data/` | Optional | CSVs used by charts or offered for download |
| `images/` | Optional | Static images, e.g. pre-rendered map PNGs |
| `published/` | Generated | Exported PNGs, created by `npm run export-pngs` at the end. Do not edit by hand |
| `card.png` | Optional | The post's card image, 1200 × 630, used as its social card. Until a post has one, the largest export of its first chart is used |

For example:

```
posts/topic-geography/
  meta.json
  +page.svelte
  charts.js
  charts/
    chart-one.svelte
    chart-two.svelte
  data/
    chart-one.csv
  images/
    map.png
  published/
    2026-09-08/
```

## Catalogue metadata

Every item on the home page, whether a post in `posts/` or a link in `links/`, has a `meta.json` with the same core fields, so they can be listed and filtered together.

| Field | Posts | Links | What it is |
| --- | --- | --- | --- |
| `title` | Required | Required | Sentence case |
| `type` | Required | Required | `post`, `feature`, `explorer` or `project`. Always `post` in `posts/`. A link can be any of the four: a post hosted on another site is a `post`, and a `project` is a standalone hub bringing several pieces of work together |
| `summary` | Required | Required | One or two sentences leading with the finding, or with what the reader can do. Used on the home page tiles and as the page description |
| `authors` | Required | Required | List of names |
| `published` | Required | Required | ISO date (`YYYY-MM-DD`). For a link, the date the work first went live. For a project, the date its first piece went live, with later pieces in `changelog` |
| `tags` | Required | Required | From `TAGS` in `src/lib/tags.js` |
| `geography` | Required | Required | From `GEOGRAPHY` in `src/lib/tags.js`. Cities include their province, state or country so no two share a name: `Toronto, ON`, `Portland, OR`, `London, United Kingdom`. For a metro region, use its first-named city |
| `changelog` | Optional | Optional | `[{ "date": "YYYY-MM-DD", "note": "..." }]`. The newest date is shown as the item's last update |
| `documents` | Optional | Optional | Related work: papers, reports, repositories, datasets. See an existing post for the format |
| `license` | Required | Optional | E.g. `CC-BY-4.0`. For a link, only if the external site states one |
| `protected` | Required | Not allowed | `true` while a post is in development |
| `url` | Not allowed | Required | The full address of the work |
| `project` | Optional | Optional | The folder name of the project in `links/` this item is part of. Not allowed on a project itself |

A link's folder holds just `meta.json` and `card.png`:

```
links/topic-geography/
  meta.json
  card.png
```

Name link folders the same way as posts (`kebab-case`, `topic-geography`, no dates). A name can't be used in both `posts/` and `links/`. When a linked item is ported into a post, move its folder from `links/` to `posts/` and add the post's files.

**Card images.** Every link needs a `card.png`, and posts can have one. It is exactly 1200 × 630, the shape social platforms show shared links at, and is used as the item's home page thumbnail (and a post's social card). Keep the title off the image (it's shown alongside) and the important content toward the centre. It must be flat, with no transparency (flatten it onto a background colour first if needed), and quantised with `npm run optimize-pngs -- --path <file>`; validation fails otherwise. Design files stay outside the repo; only the exported `card.png` goes in.

Validation checks all of the above.

## Checks

Every pull request runs `npm run validate` and a full build. You can run the validation yourself before pushing:

```sh
npm run validate          # errors fail; warnings describe unfinished work
npm run validate:strict   # warnings fail too
```

Please don't run `npm run build` and commit its output. `build/` is gitignored and CI builds and deploys the site itself.

## Workflow 1: Creating or editing a post

1. Pull the latest `main` and open a new branch.

2. Run `npm install` and `npm run dev`.

3. **New post only:** create a folder inside `posts/`.
   - The folder name becomes the URL. Use `kebab-case` in a `topic-geography` pattern, e.g. `foreign-buyer-tax-vancouver-toronto`.
   - Do not put years or dates in the name.
   - Copy the placeholder `meta.json`, `+page.svelte` and `charts.js` from an existing post.
   - Set `"protected": true` in `meta.json` so the page is password protected while in development.

4. Draft or edit the text and charts.
   - Every chart uses the standard `ChartFrame` wrapper, with `chartKey` set to its id, or validation fails. Look at an existing post for examples.
   - Use one component per chart, inside the `ChartFrame`. Chart ids are also `kebab-case`. The id is set in `charts.js` and is the chart's unique URL (for sharing and embedding).
   - Each component must be named `charts/<chart-id>.svelte` to match its id, or validation fails.
   - Inside each chart component, wrap the drawn parts (SVGs, map images, legends, labels) in `<ChartGraphic>` from `$lib/ChartGraphic.svelte`. It hides them from screen readers, which get the chart's `alt` text instead, read straight after the subtitle. Keep interactive controls (buttons, toggles, search boxes) outside it so they stay usable, and use it as many times as needed when controls sit between drawn parts. A chart with no controls just wraps everything once. See `conversions-by-cma.svelte` for a chart with controls. Validation fails if a chart component doesn't use it.
   - If you add your own images to `images/` (e.g. exported from QGIS), optimize them now, not at the end: run `npm run optimize-pngs -- --post your-post-name`. It writes a `-opt.png` candidate next to each original. Check it looks right (thin lines, small dots and small text are most at risk), then re-run with `--accept` to replace the original.
   - Check your work against the [visualization review checklist](docs/visualization-review-checklist.md) (chart design, colour, accessibility) and the [writing review checklist](docs/writing-posts-review-checklist.md) (structure, voice, attribution).

5. **Only edit files inside `posts/your-post-name/`.** If you find a bug or want a feature in the wider project, use Workflow 2 in a separate branch and PR.

6. Push your branch and open a pull request. The `Check` workflow runs validation and a build automatically. Fix anything it flags.

7. Request a review.

8. Once the review is done and changes are made, finalize the post:
   - Set the `published` date in `meta.json`.
   - Run `npm run export-pngs -- --post your-post-name` to generate the downloadable `.png` files for this post only. Don't use `--all`, which regenerates every post.
   - Set `"protected": false` in `meta.json`.

9. Push these final changes to the PR and request a final review and merge.

10. After the deploy finishes, open the live page and check that everything renders, the charts load and all buttons and downloads work.

## Workflow 2: Changing site code

This covers everything outside `posts/`: shared components, styles, scripts, routes, config and CI.

1. Pull the latest `main` and open a new branch. Give it a short descriptive name (e.g. `fix-chartframe-download-button`).

2. Keep the change to one purpose. Bug fixes, features and refactors should each be their own PR.

3. Make your change and check it in `npm run dev`. If you changed shared components or styles, look at more than one post, since they all use them.

4. Run `npm run validate` and fix any errors.

5. If a change alters how posts are structured (`meta.json` fields, `charts.js` shape, file naming), update `scripts/validate.js` and the existing posts in the same PR so nothing is left broken.

6. Commit with clear messages that say what changed and why.

7. Push and open a pull request. In the description, explain the problem, what you changed, and anything reviewers should look at (which pages are affected, screenshots for visual changes).

8. Request a review. Do not merge to `main` without one.

9. After merge, watch the `Deploy` run and check the live site.

Changes to `.github/workflows/` and `package.json` (dependencies) deserve extra care: they affect every future PR and the live deploy.

## Reporting bugs and asking for features

Open a GitHub issue. For bugs, include the page URL, what you expected, what happened, and your browser. For visual problems, a screenshot helps.

## Licence

The content and code in this repository are released under [CC BY 4.0](LICENSE). Only contribute material you have the right to share under that licence, and cite data sources in chart metadata.
