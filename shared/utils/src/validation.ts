/**
 * Validates if a string is a valid email
 * @param email Email string to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string is not empty
 * @param value String to validate
 * @returns True if string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}