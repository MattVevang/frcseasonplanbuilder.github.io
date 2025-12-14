export const DEMO_SESSION_CODE = 'demo'

export function isDemoSession(sessionCode: string | null): boolean {
  return sessionCode?.toLowerCase() === DEMO_SESSION_CODE
}
