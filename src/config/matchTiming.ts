/**
 * FRC Match Phase Timing Configuration
 *
 * Update these values when FIRST changes match timing rules.
 * All durations are in seconds.
 */

export const MATCH_PHASES = {
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

// Helper to get total match time
export const TOTAL_MATCH_TIME =
  MATCH_PHASES.auto.duration +
  MATCH_PHASES.teleop.duration +
  MATCH_PHASES.endgame.duration

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

// Phase options for dropdowns/selects
export const PHASE_OPTIONS = [
  {
    value: 'auto' as const,
    label: `${MATCH_PHASES.auto.label} (${formatDuration(MATCH_PHASES.auto.duration)})`
  },
  {
    value: 'teleop' as const,
    label: `${MATCH_PHASES.teleop.label} (${formatDuration(MATCH_PHASES.teleop.duration)})`
  },
  {
    value: 'endgame' as const,
    label: `${MATCH_PHASES.endgame.label} (${formatDuration(MATCH_PHASES.endgame.duration)})`
  },
]
