/**
 * Manages browser cookies to:
 * 1. Remember recent sessions for quick re-access
 * 2. Persist per-session voter IDs across localStorage clears for vote integrity
 *
 * Uses a single cookie storing an array of session entries.
 * Each session has its own voter ID so votes don't cross-pollinate.
 */

const COOKIE_NAME = 'frc-sessions'
const COOKIE_MAX_AGE_DAYS = 90
const MAX_SESSIONS = 5 // Keep last N sessions

export interface SessionEntry {
  sessionCode: string
  pin?: string
  voterId: string
  timestamp: number
}

function setCookie(name: string, value: string, days: number): void {
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=;path=/;max-age=0`
}

function getAllEntries(): SessionEntry[] {
  const raw = getCookie(COOKIE_NAME)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAllEntries(entries: SessionEntry[]): void {
  setCookie(COOKIE_NAME, JSON.stringify(entries), COOKIE_MAX_AGE_DAYS)
}

/**
 * Save or update a session entry in the cookie.
 * Most recent session moves to the front. Keeps last MAX_SESSIONS entries.
 */
export function saveSessionCookie(sessionCode: string, pin?: string, voterId?: string): void {
  const entries = getAllEntries()
  const existing = entries.find((e) => e.sessionCode === sessionCode)

  const entry: SessionEntry = {
    sessionCode,
    pin,
    // Preserve existing voter ID for this session if we already have one
    voterId: voterId || existing?.voterId || '',
    timestamp: Date.now(),
  }

  // Remove old entry for this session, prepend new one
  const updated = [entry, ...entries.filter((e) => e.sessionCode !== sessionCode)].slice(0, MAX_SESSIONS)
  saveAllEntries(updated)
}

/**
 * Get all saved session entries, most recent first.
 */
export function getSavedSessions(): SessionEntry[] {
  return getAllEntries()
}

/**
 * Get a specific session entry by code.
 */
export function getSessionEntry(sessionCode: string): SessionEntry | null {
  return getAllEntries().find((e) => e.sessionCode === sessionCode) || null
}

/**
 * Remove a specific session from the cookie.
 */
export function removeSessionEntry(sessionCode: string): void {
  const entries = getAllEntries().filter((e) => e.sessionCode !== sessionCode)
  if (entries.length > 0) {
    saveAllEntries(entries)
  } else {
    deleteCookie(COOKIE_NAME)
  }
}

/**
 * Clear all saved sessions.
 */
export function clearSessionCookie(): void {
  deleteCookie(COOKIE_NAME)
}

/**
 * Get the voter ID for a specific session from the cookie (backup for localStorage).
 */
export function getVoterIdFromCookie(sessionCode?: string): string | null {
  const entries = getAllEntries()
  if (sessionCode) {
    return entries.find((e) => e.sessionCode === sessionCode)?.voterId || null
  }
  // If no session specified, return the most recent voter ID
  return entries[0]?.voterId || null
}
