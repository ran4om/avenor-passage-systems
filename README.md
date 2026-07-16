# Avenor Passage Systems

Independent React 19 and Vite 8 showcase site for a fictional Zürich mobility-planning studio.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Project notes

- The site is intentionally marked `noindex,nofollow`.
- All geographies, routes, metrics, pricing, people, offices, services, and outcomes are fictional concept material.
- `src/data/region.js` is the single source of truth for the SVG map, Three.js terrain, evidence panel, comparison table, and exported scenario summary.
- Mobile defaults to the semantic 2D map. Relief is loaded only after an explicit action.
- Three.js is dynamically imported, draws on demand, caps render pixels, pauses offscreen or when the page is hidden, and cleans up renderer resources.
- The qualification form submits nowhere and confirms that nothing was sent to an operating company.
