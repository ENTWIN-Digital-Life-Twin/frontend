import { describe, expect, it } from 'vitest';
import { formatMinutes, sleepMinutesBetween, wakeTimeFromDuration } from './wellness.models';

describe('sleep duration helpers', () => {
  it('computes overnight duration from bedtime to wake', () => {
    expect(sleepMinutesBetween('23:00', '07:00')).toBe(8 * 60);
    expect(sleepMinutesBetween('23:15', '06:35')).toBe(7 * 60 + 20);
  });

  it('computes same-day naps without wrapping backwards', () => {
    expect(sleepMinutesBetween('13:00', '14:30')).toBe(90);
  });

  it('sets wake time from a typed duration', () => {
    expect(wakeTimeFromDuration('23:00', 8 * 60)).toBe('07:00');
    expect(wakeTimeFromDuration('22:45', 7 * 60 + 30)).toBe('06:15');
  });

  it('formats duration for display', () => {
    expect(formatMinutes(440, 'en-US')).toBe('7h 20');
    expect(formatMinutes(480, 'fr-FR')).toBe('8h');
  });
});
