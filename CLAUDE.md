# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

우아한테크코스(Woowa Course) 크루 글쓰기 아카이브 — a static documentation site that archives writing history from Woowa Course generations 1-7 (2019-2025). Built with **Nextra 4** (docs theme) on **Next.js 15**, deployed as a static export.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Static export build (outputs to `out/`)
- `npm start` — Serve the built output

No test runner or linter is configured.

## Architecture

### Framework Stack
- **Nextra 4** (`nextra` + `nextra-theme-docs`) handles routing, MDX rendering, search, and sidebar generation from `_meta.ts` files
- **Next.js 15** with `output: 'export'` — fully static site, no server-side features
- Images are unoptimized (`images.unoptimized: true`) due to static export

### Content Structure
All content lives in `content/` and uses Nextra's file-system routing:
- `content/_meta.ts` — Top-level navigation (home page + "크루 글쓰기 아카이브" section)
- `content/tech-blog-book/_meta.ts` — Generation listing (1기~7기)
- `content/tech-blog-book/generation-{N}/` — Per-generation content
  - `index.mdx` — Generation overview with analysis and representative writings
  - `_meta.ts` — Sidebar items for that generation
  - `writings/` — Individual crew writings as `.md` files, organized by level (`level1/`, `level2/`, etc.)
  - `writings/_meta.ts` — Level-based navigation within writings

Generation 1 has a fully built-out structure with `analysis-retrospective.mdx` and individual writings. Generations 2-7 use `Placeholder` components for sections still being developed.

### Content Patterns
- **`_meta.ts` files** control Nextra sidebar ordering and titles — every directory needs one
- Writing files follow the naming convention: `level{N}-{githubUsername}.md`
- MDX files use custom components directly (auto-imported by Nextra's MDX provider)

### Custom Components (`components/`)
- `Hero` — Landing page hero section
- `Card` / `CardGrid` — Navigation cards for generation listing
- `Callout` — Info/tip callout boxes (wraps content with styled aside)
- `Placeholder` — Placeholder for sections not yet written
- `WritingMeta` — Displays author GitHub link and source URL for individual writings
- `Toggle` — Collapsible `<details>` element for expandable content sections
- All components use CSS Modules (`.module.css` files)
- Exported via `components/index.ts` barrel file (except `WritingMeta` and `Toggle` which are imported directly)

### Theme Configuration
`theme.config.tsx` — Korean-localized Nextra docs theme (search placeholder, TOC labels, edit link text, etc.)

## Content Conventions

- All UI text and content is in **Korean**
- Generation pages contain curated analysis of crew writings, not just raw collections — they identify common themes, select representative writings, and provide summaries with key quotes
- The `Toggle` component wraps representative writing excerpts so they can be expanded/collapsed
- Links to original writings point to GitHub blob URLs in the `woowacourse/woowa-writing-{N}` repositories
