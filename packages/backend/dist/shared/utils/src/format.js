"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatCurrency = formatCurrency;
/**
 * Formats a date to a readable string
 * @param date Date to format
 * @returns Formatted date string
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
/**
 * Formats a number as currency
 * @param amount Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
}
