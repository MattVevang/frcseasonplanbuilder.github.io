import { v4 as uuidv4 } from 'uuid'
import { getVoterIdFromCookie } from './sessionCookie'

const STORAGE_KEY = 'frc-retro-voter-id'

/**
 * Returns a stable voter ID for this browser.
 * Checks localStorage first, then falls back to cookie backup
 * (optionally scoped to a specific session). Generates new if neither has one.
 */
export function getVoterId(sessionCode?: string): string {
  let id = localStorage.getItem(STORAGE_KEY)
  if (id) return id

  // Fallback: restore from cookie if localStorage was cleared
  const cookieId = getVoterIdFromCookie(sessionCode)
  if (cookieId) {
    localStorage.setItem(STORAGE_KEY, cookieId)
    return cookieId
  }

  // First visit: generate new ID
  id = uuidv4()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
