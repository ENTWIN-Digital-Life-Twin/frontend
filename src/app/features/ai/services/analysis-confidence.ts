export function analysisConfidence(signalCount: number): number {
  return Math.max(80, Math.min(100, 80 + Math.max(0, signalCount) * 3));
}

export function recommendationConfidence(priority: string): number {
  const normalized = priority.toUpperCase();
  if (normalized === 'HIGH') {
    return 94;
  }
  if (normalized === 'MEDIUM') {
    return 88;
  }
  return 82;
}
