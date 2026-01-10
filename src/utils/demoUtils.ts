import { SeasonVersion } from '../config/matchTiming'

export const DEMO_SESSION_CODE = 'demo'

export function isDemoSession(sessionCode: string | null): boolean {
  return sessionCode?.toLowerCase() === DEMO_SESSION_CODE
}

// Get the season version for a session
// Demo sessions always use 2026, other sessions can be determined from Firebase
export function getSessionSeasonVersion(sessionCode: string | null, sessionSeasonVersion?: SeasonVersion): SeasonVersion {
  // Demo sessions always use 2026
  if (isDemoSession(sessionCode)) {
    return '2026'
  }
  // Use provided session version, or default to 2026 for new sessions
  return sessionSeasonVersion ?? '2026'
}
