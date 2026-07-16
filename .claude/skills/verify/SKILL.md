# Verify Avenor Passage Systems

1. Build with `npm run build`.
2. Run production preview with `npm run preview -- --host 127.0.0.1 --port <free-port>`.
3. At 1440x900, verify the opening completes in about five seconds, the H1 is `Time is the terrain.`, the map uses `APS-SR-01`, `E1`, `E2`, `C1`, and `C2`, exactly three scenario states and two corridors are present, Time Lens Home/End and `aria-valuetext` work, and scenario changes visibly redraw the canonical contours.
4. Confirm 2D remains the default with no canvas. Toggle relief on and off; confirm one lazy, boundary-masked canvas appears only after request while the semantic SVG boundary, identifiers, contours, and routes remain registered above it.
5. Compare C1 and C2 cards and confirm each compact map renders and labels only its own corridor.
6. Complete the qualification form and confirm focus enters the exact no-submit disclosure, no network write occurs, and returning restores focus to the first field. Export a summary and inspect the `APS-SR-01-…` filename and required synthetic/no-engagement/decision-use notices. Print Proposed at E2 and confirm a single landscape page carries the canonical map, `45 min ±11 min`, model status, energy denominator/status, assumptions, and exact disclosures.
7. At 390x844, confirm no horizontal overflow, the legend is outside the plot, E1/E2/C1/C2 and short constraint/contour labels remain visible, chapter actions focus a local evidence response, and all interactive targets are at least 44px except the checkbox glyph inside its larger label.
8. Emulate reduced motion and confirm 2D remains default with no terrain morphing or camera travel. Emulate forced colors and confirm the selected scenario has a persistent checkmark distinct from focus.
9. For no-WebGL fallback, override `HTMLCanvasElement.prototype.getContext = () => null`, enable relief, and confirm `Relief unavailable; 2D map active.` is announced, the toggle rolls back/disables, and the SVG map returns to full opacity.
10. Confirm no failed requests or unexpected console errors. Capture desktop, mobile, and relief screenshots.
