# Circle Memory Code Quality Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve color sensitivity utilities and their test coverage to prevent rendering collisions and ensure robustness.

**Architecture:** Update OKLCH string formatting to use one decimal place for lightness and expand unit tests to cover more scenarios.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Update OKLCH string formatting

**Files:**
- Modify: `src/lib/colorSensitivityUtils.ts`

- [ ] **Step 1: Update `oklchToString` to use 1 decimal place for lightness**

```typescript
export const oklchToString = (color: OKLCHColor): string => {
  return `oklch(${(color.l * 100).toFixed(1)}% ${color.c} ${color.h})`;
};
```

- [ ] **Step 2: Update existing test for `oklchToString` in `src/lib/colorSensitivityUtils.test.ts`**

Update the expected string to include the decimal place.

```typescript
  describe('oklchToString', () => {
    it('should format OKLCH color as a CSS string', () => {
      const color: OKLCHColor = { l: 0.7, c: 0.2, h: 150 };
      expect(oklchToString(color)).toBe('oklch(70.0% 0.2 150)');
    });
  });
```

- [ ] **Step 3: Run tests and verify**

Run: `npm test src/lib/colorSensitivityUtils.test.ts`

- [ ] **Step 4: Commit changes**

```bash
git add src/lib/colorSensitivityUtils.ts src/lib/colorSensitivityUtils.test.ts
git commit -m "refactor(lib): update oklchToString to use 1 decimal place for lightness"
```

### Task 2: Expand test coverage for `calculateOKLCHDistance`

**Files:**
- Modify: `src/lib/colorSensitivityUtils.test.ts`

- [ ] **Step 1: Add test case for chroma difference**

```typescript
    it('should calculate distance correctly for different chroma', () => {
      const c1: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };
      const c2: OKLCHColor = { l: 0.5, c: 0.2, h: 180 };
      // (0.1 * 100)^2 = 100, sqrt(100) = 10
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(10);
    });
```

- [ ] **Step 2: Add test case for combined difference (L, C, and H)**

```typescript
    it('should calculate distance correctly for combined differences', () => {
      const c1: OKLCHColor = { l: 0.5, c: 0.1, h: 180 };
      const c2: OKLCHColor = { l: 0.6, c: 0.2, h: 190 };
      // dL = 0.1 * 100 = 10, dL^2 = 100
      // dC = 0.1 * 100 = 10, dC^2 = 100
      // dH = 10 * 0.2 = 2, dH^2 = 4
      // dist = sqrt(100 + 100 + 4) = sqrt(204) approx 14.28
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(Math.sqrt(204));
    });
```

- [ ] **Step 3: Add test cases for edge cases (L=0 and C=0)**

```typescript
    it('should handle edge cases with L=0 or C=0', () => {
      const c1: OKLCHColor = { l: 0, c: 0, h: 0 };
      const c2: OKLCHColor = { l: 0.1, c: 0.05, h: 10 };
      // dL = 0.1 * 100 = 10, dL^2 = 100
      // dC = 0.05 * 100 = 5, dC^2 = 25
      // dH = 10 * 0.2 = 2, dH^2 = 4
      // dist = sqrt(100 + 25 + 4) = sqrt(129) approx 11.36
      expect(calculateOKLCHDistance(c1, c2)).toBeCloseTo(Math.sqrt(129));
    });
```

- [ ] **Step 4: Run tests and verify**

Run: `npm test src/lib/colorSensitivityUtils.test.ts`

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/colorSensitivityUtils.test.ts
git commit -m "test(lib): add more test cases for calculateOKLCHDistance"
```
