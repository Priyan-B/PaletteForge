/**
 * Same as the ones in frontend/utils
 */

// Color Parsing
export function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h))
    throw new Error(`Invalid hex color: "${hex}"`);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Contrast Ratio (WCAG formula)
export function relativeLuminance({ r, g, b }) {
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

export const THRESHOLDS = {
  AA: { normal: 4.5, large: 3.0 },
  AAA: { normal: 7.0, large: 4.5 },
};

export function evaluate(ratio, { large = false } = {}) {
  const size = large ? "large" : "normal";
  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= THRESHOLDS.AA[size],
    AAA: ratio >= THRESHOLDS.AAA[size],
    thresholds: { AA: THRESHOLDS.AA[size], AAA: THRESHOLDS.AAA[size] },
  };
}

export function checkPair(fgHex, bgHex, opts) {
  return evaluate(contrastRatio(fgHex, bgHex), opts);
}

// HSL Conversion
export function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

// Autofix

export function autoFixColor(
  fgHex,
  bgHex,
  { target = THRESHOLDS.AA.normal, large = false, step = 1 } = {}
) {
  const goal = large
    ? target === THRESHOLDS.AAA.normal
      ? THRESHOLDS.AAA.large
      : THRESHOLDS.AA.large
    : target;
  const startHsl = rgbToHsl(hexToRgb(fgHex));

  const searchDirection = (delta) => {
    for (let l = startHsl.l + delta; l >= 0 && l <= 100; l += delta) {
      const candidateHex = rgbToHex(hslToRgb({ ...startHsl, l }));
      if (contrastRatio(candidateHex, bgHex) >= goal) {
        return { hex: candidateHex, lightnessChange: Math.abs(l - startHsl.l) };
      }
    }
    return null;
  };

  const darker = searchDirection(-step);
  const lighter = searchDirection(step);

  let best;
  if (darker && lighter) {
    best = darker.lightnessChange <= lighter.lightnessChange ? darker : lighter;
  } else {
    best = darker || lighter;
  }

  if (!best) {
    return {
      original: fgHex.toUpperCase(),
      fixed: null,
      achievedRatio: null,
      passed: false,
      note: "Foreground cannot reach target against this background; try adjusting the background.",
    };
  }

  return {
    original: fgHex.toUpperCase(),
    fixed: best.hex,
    achievedRatio: Math.round(contrastRatio(best.hex, bgHex) * 100) / 100,
    lightnessChange: Math.round(best.lightnessChange * 100) / 100,
    passed: true,
    note: null,
  };
}
