// Utility Functions for Stock Market Dashboard

/**
 * Formats currency values
 * @param {number} value - Numeric value to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

/**
 * Formats large numbers with appropriate suffixes (K, M, B, T)
 * @param {number} value - Numeric value to format
 * @returns {string} - Formatted number string
 */
function formatNumber(value) {
    if (value >= 1e12) {
        return (value / 1e12).toFixed(1) + 'T';
    } else if (value >= 1e9) {
        return (value / 1e9).toFixed(1) + 'B';
    } else if (value >= 1e6) {
        return (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
        return (value / 1e3).toFixed(1) + 'K';
    }
    return value.toString();
}

/**
 * Formats date strings
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Calculates percentage change between two values
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} - Percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Debounces function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Calculates trend from an array of prices
 * @param {Array<number>} prices - Array of prices
 * @returns {number} - Trend value (-1 to 1)
 */
function calculateTrend(prices) {
    if (prices.length < 2) return 0;
    
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    
    return (lastPrice - firstPrice) / firstPrice;
}

/**
 * Calculates volatility (standard deviation) of prices
 * @param {Array<number>} prices - Array of prices
 * @returns {number} - Volatility value
 */
function calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    // Calculate returns
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    // Calculate mean return
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    // Calculate variance
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    
    // Return standard deviation (volatility)
    return Math.sqrt(variance);
}

/**
 * Validates if a string is a valid stock symbol
 * @param {string} symbol - Stock symbol to validate
 * @returns {boolean} - True if valid
 */
function isValidStockSymbol(symbol) {
    const symbolRegex = /^[A-Z]{1,5}(-[A-Z])?$/;
    return symbolRegex.test(symbol);
}

/**
 * Generates a random color for charts
 * @returns {string} - RGB color string
 */
function generateRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts hex color to RGBA
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} - RGBA color string
 */
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Checks if the current time is during market hours (9:30 AM - 4:00 PM EST)
 * @returns {boolean} - True if market is open
 */
function isMarketOpen() {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hours = easternTime.getHours();
    const minutes = easternTime.getMinutes();
    const dayOfWeek = easternTime.getDay();
    
    // Check if it's a weekday
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Check if it's between 9:30 AM and 4:00 PM
    const currentTime = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    
    return currentTime >= marketOpen && currentTime <= marketClose;
}

/**
 * Throttles function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}