/**
 * Adds two numbers together
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
export function addNumbers(a: number, b: number): number {
  return a + b;
}

/**
 * Adds multiple numbers together
 * @param numbers Array of numbers to sum
 * @returns Sum of all numbers
 */
export function addMultiple(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}