export interface Session {
  sessionCode: string
  createdAt: Date
  lastModifiedAt: Date
  expiresAt: Date
  version: number
}

export interface SessionState {
  currentSession: Session | null
  isLoading: boolean
  error: string | null
}
