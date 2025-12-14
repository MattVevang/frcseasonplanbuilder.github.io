/**
 * PIN utility functions for session protection.
 * PINs are 4-digit numeric codes that protect sessions from unauthorized access.
 */

/**
 * Validates that a PIN is exactly 4 digits.
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/**
 * Hashes a PIN using SHA-256.
 * Returns a hex string representation of the hash.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Validates a PIN against a stored hash.
 * Returns true if the PIN matches, false otherwise.
 */
export async function validatePin(pin: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPin(pin)
  return inputHash === storedHash
}
