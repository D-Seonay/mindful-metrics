// src/lib/colorSensitivityUtils.ts

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface OKLCHColor {
  l: number; // Lightness (0-1)
  c: number; // Chroma (0-0.4 approx)
  h: number; // Hue (0-360)
}

/**
 * Generates a random HSL color.
 * @returns {HSLColor} An HSL color object.
 */
export const generateRandomHSL = (): HSLColor => {
  const h = Math.floor(Math.random() * 360); // Hue (0-359)
  const s = Math.floor(Math.random() * (80 - 70) + 70); // Saturation (70-80% for vibrant)
  const l = 50; // Lightness fixed at 50%
  return { h, s, l };
};

/**
 * Calculates the perceptual distance between two OKLCH colors.
 * This uses a weighted Euclidean distance in the LCH space.
 * @param {OKLCHColor} c1 First color.
 * @param {OKLCHColor} c2 Second color.
 * @returns {number} The distance value.
 */
export const calculateOKLCHDistance = (c1: OKLCHColor, c2: OKLCHColor): number => {
  let dH = Math.abs(c1.h - c2.h);
  if (dH > 180) dH = 360 - dH;
  const wL = 100;
  const wC = 100;
  const wH = 0.2;
  return Math.sqrt(
    Math.pow((c1.l - c2.l) * wL, 2) +
    Math.pow((c1.c - c2.c) * wC, 2) +
    Math.pow(dH * wH, 2)
  );
};

/**
 * Converts an OKLCH color object to a CSS OKLCH string.
 * @param {OKLCHColor} color The OKLCH color object.
 * @returns {string} The CSS OKLCH string.
 */
export const oklchToString = (color: OKLCHColor): string => {
  return `oklch(${Math.round(color.l * 100)}% ${color.c} ${color.h})`;
};

/**
 * Calculates the lightness difference for the "odd" square based on the current level.
 * The difficulty factor decreases exponentially as the level increases.
 * @param {number} level The current game level (score).
 * @returns {number} The lightness difference (delta) to apply.
 */
export const getLightnessDelta = (level: number): number => {
  // Initial delta of 15% at level 0 (equivalent to level 1 in description)
  // Decays to ~1-2% at level 30
  const initialDelta = 15;
  // A decay rate that brings it from 15 to ~1-2 over 30 levels.
  // Using 0.08 for a balance.
  const decayRate = 0.08;

  const delta = initialDelta * Math.exp(-decayRate * level);

  return Math.max(delta, 1); // Ensure delta doesn't go below 1%
};

/**
 * Adjusts the lightness of an HSL color.
 * @param {HSLColor} color The base HSL color.
 * @param {number} delta The amount to adjust lightness by (can be positive or negative).
 * @returns {HSLColor} The new HSL color with adjusted lightness.
 */
export const adjustLightness = (color: HSLColor, delta: number): HSLColor => {
  const newLightness = Math.max(0, Math.min(100, color.l + delta));
  return { ...color, l: newLightness };
};

/**
 * Converts an HSL color object to a CSS HSL string.
 * @param {HSLColor} color The HSL color object.
 * @returns {string} The CSS HSL string (e.g., "hsl(120, 50%, 60%)").
 */
export const hslToString = (color: HSLColor): string => {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
};
