/**
 * Utilities for formatting currency values.
 */

/**
 * Formats a number to Indian Rupee (INR) format.
 * @param {number|string} value - The numerical value to format.
 * @returns {string} The formatted currency string (e.g., ₹1,25,000).
 */
export const formatINR = (value) => {
    const number = Number(value);
    if (isNaN(number)) return '₹0';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(number);
};
