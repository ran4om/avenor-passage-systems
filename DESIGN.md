# Design System

## Overview

A light, full-palette cartographic identity inspired by a planning team working around a pale relief model in daylight. The interface combines measured paper margins, survey notation, removable route threads, terminal blocks, and translucent tracing sheets. It is rigorous but not sterile, premium but not glossy.

## Color

Use OKLCH tokens for interface surfaces and text. The exact fixed data-series colors remain hexadecimal because they are validated scenario identifiers.

- Survey paper: `oklch(98.8% 0.004 95)`
- Warm sheet: `oklch(96% 0.018 91)`
- Infrastructure ink: `oklch(25% 0.012 235)`
- Secondary ink: `oklch(45% 0.015 225)`
- Hairline: `oklch(83% 0.018 91)`
- Topographic sand: `oklch(84% 0.045 82)`
- Vegetation olive: `oklch(56% 0.045 135)`
- Baseline: `#007B9A`
- Proposed: `#C84832`
- Disrupted: `#6B4E9B`

Do not use gradients. Large color fields should be flat paper, sand, olive, cyan, vermilion, or violet tints with deliberate role separation.

## Typography

Use system and locally available fonts only. The primary family is a narrow civic sans stack: `Arial Narrow`, `Aptos Narrow`, `Helvetica Neue`, Arial, sans-serif. Use the broad sans fallback for body copy. Numeric evidence and compact map notation use `ui-monospace`, `SFMono-Regular`, Consolas, monospace with tabular figures only where columns must align.

Headings are compact, left aligned, and decisively scaled. Avoid editorial serif styling, italic display flourishes, and repeated tiny uppercase kickers. Map labels may use compact uppercase at readable sizes.

## Layout

Desktop uses a strict twelve-column planning-board grid with visible but recessive rules. The hero is asymmetric: proposition and commercial action on the left, semantic map on the right. The scenario chapter uses one sticky map board with a narrower scrolling evidence column. Mobile becomes a single vertical sequence and defaults to SVG.

Spacing varies between tight annotation groups and generous chapter breaks. Sections are separated by map-scale changes, paper tone shifts, or full-width rules rather than repeated cards.

## Components

- Persistent fiction strip in the first viewport and footer
- Board-like header with wordmark, compact navigation, and study CTA
- Semantic SVG map for `APS-SR-01` with state-specific modeled-minute contours, direct `E1`/`E2` and `C1`/`C2` labels, an out-of-plot legend, dash and texture encodings
- Three-state segmented control in fixed order: baseline, proposed, disrupted, with persistent forced-colors selection
- Time Lens range input with four neutral predefined stops and synchronized evidence panel
- Opt-in lazy Three.js relief registered top-down to the canonical boundary and generated from the same minute surface; no separate route geometry or vehicle
- Accessible evidence table and printable summary
- Scroll chapters with numbered questions and plain-language findings
- Terminal dwell flow diagram
- Service scope and indicative fictional pricing bands
- Qualification form with local validation and no network submission

## Motion

The opening lasts four to six seconds on first visit and is immediately skippable. A flat contour map rises into a synthetic minute surface, then the proposed corridor lowers one ridge. Motion uses transform and opacity with an ease-out-expo character. Repeat visits shorten the opening. Reduced motion shows static authored states with instantaneous changes.

The Three.js renderer is never auto-enabled. When requested, it draws on demand, masks the mesh to the `APS-SR-01` boundary, pauses when offscreen or hidden, caps DPR and grid resolution, and cleans up all listeners, animation frames, geometry, materials, textures, and renderer resources. WebGL failure immediately restores and announces the canonical 2D view.

## Accessibility

Maintain visible `:focus-visible` treatment, 44px minimum interactive targets, semantic labels and descriptions, large SVG hit areas, touch and keyboard parity, stable legend placement, direct labels, table equivalence, screen-reader status announcements, forced-colors support, and no horizontal overflow at 390 by 844. Print hides enhancement controls and outputs the selected scenario summary with fiction notice and assumptions.
