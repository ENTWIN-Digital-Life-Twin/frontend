import { describe, expect, it } from 'vitest';
import { analysisConfidence, recommendationConfidence } from './analysis-confidence';

describe('analysisConfidence', () => {
  it('never drops below 80', () => {
    expect(analysisConfidence(0)).toBe(80);
    expect(analysisConfidence(1)).toBe(83);
  });

  it('rises with more signals and caps at 100', () => {
    expect(analysisConfidence(7)).toBe(100);
    expect(analysisConfidence(20)).toBe(100);
  });
});

describe('recommendationConfidence', () => {
  it('stays at or above 80 for every priority', () => {
    expect(recommendationConfidence('HIGH')).toBeGreaterThanOrEqual(80);
    expect(recommendationConfidence('MEDIUM')).toBeGreaterThanOrEqual(80);
    expect(recommendationConfidence('LOW')).toBeGreaterThanOrEqual(80);
  });
});
