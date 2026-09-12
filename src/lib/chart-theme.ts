/*
 * Chart color tokens — mirror the oklch semantic tokens from src/index.css
 * for use inside SVG stroke/fill attributes where Tailwind classes can't go.
 * Keep in sync with the :root block if tokens change.
 */
export const CHART = {
  /* telemetry amber */
  primary: "oklch(0.79 0.145 74)",
  primaryBright: "oklch(0.82 0.14 80)",
  primaryFill: "oklch(0.79 0.145 74 / 20%)",
  /* radar cyan */
  accent: "oklch(0.74 0.11 205)",
  /* calibration green */
  success: "oklch(0.72 0.14 150)",
  /* regolith greys */
  grid: "oklch(0.3 0.014 258)",
  gridStrong: "oklch(0.36 0.014 258)",
  label: "oklch(0.68 0.014 252)",
  labelDim: "oklch(0.55 0.014 252)",
  voidInk: "oklch(0.16 0.012 255)",
  bedrockFill: "oklch(0.16 0.012 255 / 75%)",
} as const;
