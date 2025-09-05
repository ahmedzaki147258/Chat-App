"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isNotEmpty = isNotEmpty;
/**
 * Validates if a string is a valid email
 * @param email Email string to validate
 * @returns True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validates if a string is not empty
 * @param value String to validate
 * @returns True if string is not empty
 */
function isNotEmpty(value) {
    return value.trim().length > 0;
}
