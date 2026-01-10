import { SeasonVersion } from '../config/matchTiming'

export interface Session {
  sessionCode: string
  pinHash: string | null  // SHA-256 hash of 4-digit PIN, null for legacy sessions
  createdAt: Date
  lastModifiedAt: Date
  expiresAt: Date
  version: number
  seasonVersion?: SeasonVersion  // undefined = '2025' for backwards compatibility
}

export interface SessionState {
  currentSession: Session | null
  isLoading: boolean
  error: string | null
}
