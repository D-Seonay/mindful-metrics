import { describe, it, expect } from 'vitest';
import { calculateOKLCHDistance, oklchToString, OKLCHColor } from './colorSensitivityUtils';

describe('colorSensitivityUtils OKLCH', () => {
  describe('calculateOKLCHDistance', () => {
    it('should return 0 for the same color', () => {
      const color: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };
      expect(calculateOKLCHDistance(color, color)).toBe(0);
    });

    it('should calculate distance correctly for different lightness', () => {
      const c1: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };
      const c2: OKLCHColor = { l: 0.6, c: 0.1, h: 180 };
      // (0.1 * 100)^2 = 100, sqrt(100) = 10
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(10);
    });

    it('should handle hue wrap-around correctly', () => {
      const c1: OKLCHColor = { l: 0.5, c: 0.1, h: 350 };
      const c2: OKLCHColor = { l: 0.5, c: 0.1, h: 10 };
      // dH = 20, (20 * 0.2)^2 = 16, sqrt(16) = 4
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(4);
    });

    it('should calculate distance correctly for different chroma', () => {
      const c1: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };
      const c2: OKLCHColor = { l: 0.5, c: 0.2, h: 180 };
      // (0.1 * 100)^2 = 100, sqrt(100) = 10
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(10);
    });

    it('should calculate distance correctly for combined differences', () => {
      const c1: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };
      const c2: OKLCHColor = { l: 0.6, c: 0.2, h: 190 };
      // dL = 0.1 * 100 = 10, dL^2 = 100
      // dC = 0.1 * 100 = 10, dC^2 = 100
      // dH = 10 * 0.2 = 2, dH^2 = 4
      // dist = sqrt(100 + 100 + 4) = sqrt(204) approx 14.28
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(Math.sqrt(204));
    });

    it('should handle edge cases with L=0 or C=0', () => {
      const c1: OKLCHColor = { l: 0, c: 0, h: 0 };
      const c2: OKLCHColor = { l: 0.1, c: 0.05, h: 10 };
      // dL = 0.1 * 100 = 10, dL^2 = 100
      // dC = 0.05 * 100 = 5, dC^2 = 25
      // dH = 10 * 0.2 = 2, dH^2 = 4
      // dist = sqrt(100 + 25 + 4) = sqrt(129) approx 11.36
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(Math.sqrt(129));
    });
  });

  describe('oklchToString', () => {
    it('should format OKLCH color as a CSS string', () => {
      const color: OKLCHColor = { l: 0.7, c: 0.2, h: 150 };
      expect(oklchToString(color)).toBe('oklch(70.0% 0.2 150)');
    });
  });
});
