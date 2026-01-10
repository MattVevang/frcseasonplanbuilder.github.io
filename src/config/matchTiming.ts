/**
 * FRC Match Phase Timing Configuration
 *
 * Update these values when FIRST changes match timing rules.
 * All durations are in seconds.
 *
 * Supports multiple season versions for backwards compatibility.
 */

export type SeasonVersion = '2025' | '2026'

// 2025 Reefscape timing (FRC)
export const MATCH_PHASES_2025 = {
  auto: {
    duration: 15,
    label: 'Autonomous',
    shortLabel: 'Auto',
  },
  teleop: {
    duration: 135, // 2:15
    label: 'Teleop',
    shortLabel: 'Teleop',
  },
  endgame: {
    duration: 20, // Last 20s of teleop, tracked separately for planning
    label: 'Endgame',
    shortLabel: 'Endgame',
  },
} as const

// 2026 DECODE timing (FTC-style)
// DECODE has only AUTO and TELEOP phases - no separate endgame
// Match structure: 30s AUTO + 8s transition + 2:00 TELEOP
export const MATCH_PHASES_2026 = {
  auto: {
    duration: 30,
    label: 'Autonomous',
    shortLabel: 'Auto',
  },
  teleop: {
    duration: 120, // 2:00 full teleop (includes BASE return at end)
    label: 'Teleop',
    shortLabel: 'Teleop',
  },
  endgame: {
    duration: 0, // No separate endgame in DECODE - BASE return is part of TELEOP
    label: 'Endgame',
    shortLabel: 'Endgame',
  },
} as const

// Default to 2026 for new usage, backwards compat uses getMatchPhases()
export const MATCH_PHASES = MATCH_PHASES_2026

// Get match phases for a specific season version
export function getMatchPhases(version: SeasonVersion = '2026') {
  return version === '2025' ? MATCH_PHASES_2025 : MATCH_PHASES_2026
}

// Get total match time for a season version
export function getTotalMatchTime(version: SeasonVersion = '2026', includeEndgame: boolean = true): number {
  const phases = getMatchPhases(version)
  const base = phases.auto.duration + phases.teleop.duration
  return includeEndgame ? base + phases.endgame.duration : base
}

// Legacy constant for backwards compatibility
export const TOTAL_MATCH_TIME = getTotalMatchTime('2026', true)

// Helper to format duration for display (e.g., "2:15" for 135s)
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}:00`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Phase option type for dropdowns
type PhaseOption = {
  value: 'auto' | 'teleop' | 'endgame'
  label: string
}

// Generate phase options for a specific season version
export function getPhaseOptions(version: SeasonVersion = '2026', includeEndgame: boolean = true): PhaseOption[] {
  const phases = getMatchPhases(version)
  const options: PhaseOption[] = [
    {
      value: 'auto',
      label: `${phases.auto.label} (${formatDuration(phases.auto.duration)})`
    },
    {
      value: 'teleop',
      label: `${phases.teleop.label} (${formatDuration(phases.teleop.duration)})`
    },
  ]

  if (includeEndgame && phases.endgame.duration > 0) {
    options.push({
      value: 'endgame',
      label: `${phases.endgame.label} (${formatDuration(phases.endgame.duration)})`
    })
  }

  return options
}

// Legacy constant for backwards compatibility
export const PHASE_OPTIONS = getPhaseOptions('2026', true)
