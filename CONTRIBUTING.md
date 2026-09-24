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
| `src/lib/` | Shared components (`ChartFrame`, `Header`, `Footer`, ...), global styles (`styles.css`) and helpers |
| `src/routes/` | Site routes and layout |
| `scripts/` | `validate.js`, PNG export and optimization, CSS stripping |
| `static/` | Files served as-is |
| `.github/workflows/` | `check.yml` (runs on every PR) and `deploy.yml` (runs on push to `main`) |

A post folder contains:

| Item | Status | Purpose |
| --- | --- | --- |
| `meta.json` | Required | Title, type, summary, authors, published date, license, `protected` flag, related documents |
| `+page.svelte` | Required | Body content |
| `charts.js` | Required | Chart metadata (ids, titles, sources, alt text, notes) |
| `charts/` | Required | One `<chart-id>.svelte` per chart listed in `charts.js` |
| `data/` | Optional | CSVs used by charts or offered for download |
| `images/` | Optional | Static images, e.g. pre-rendered map PNGs |
| `published/` | Generated | Exported PNGs, created by `npm run export-pngs` at the end. Do not edit by hand |

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
   - Every chart uses the standard `ChartFrame` wrapper. Look at an existing post for examples.
   - Use one component per chart, inside the `ChartFrame`. Chart ids are also `kebab-case`. The id is set in `charts.js` and is the chart's unique URL (for sharing and embedding).
   - Each component must be named `charts/<chart-id>.svelte` to match its id, or validation fails.
   - If you add your own images to `images/` (e.g. exported from QGIS), optimize them now, not at the end: run `npm run optimize-pngs -- --post your-post-name`. It writes a `-opt.png` candidate next to each original. Check it looks right (thin lines, small dots and small text are most at risk), then re-run with `--accept` to replace the original.
   - Check your work against the post review checklist (`notes/post-review-checklist.md`, kept alongside the project notes) covering chart design, accessibility, writing and metadata.

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
