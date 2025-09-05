"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNumbers = addNumbers;
exports.addMultiple = addMultiple;
/**
 * Adds two numbers together
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
function addNumbers(a, b) {
    return a + b;
}
/**
 * Adds multiple numbers together
 * @param numbers Array of numbers to sum
 * @returns Sum of all numbers
 */
function addMultiple(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
}
