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
  });

  describe('oklchToString', () => {
    it('should format OKLCH color as a CSS string', () => {
      const color: OKLCHColor = { l: 0.7, c: 0.2, h: 150 };
      expect(oklchToString(color)).toBe('oklch(70% 0.2 150)');
    });
  });
});
