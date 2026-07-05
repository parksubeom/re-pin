// Pure computation of the revision-round counters (invariant 3: remaining never negative,
// overflow surfaced separately). Domain-bound, no I/O → entities/project/lib (rules/20).
export type RoundStats = {
  usedRounds: number
  remaining: number
  overflow: number
}

export function computeRoundStats(includedRounds: number, usedRounds: number): RoundStats {
  return {
    usedRounds,
    remaining: Math.max(0, includedRounds - usedRounds),
    overflow: Math.max(0, usedRounds - includedRounds),
  }
}
