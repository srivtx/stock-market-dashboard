// Stock Data Generation and Management
// This file handles mock stock data generation for the dashboard

/**
 * Generates mock stock data for a given symbol
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} - Promise resolving to stock data
 */
async function generateMockStockData(symbol) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const basePrice = getBasePriceForSymbol(symbol);
    const dates = generateDateRange(30); // Last 30 days
    const prices = generatePriceHistory(basePrice, 30);
    
    return {
        symbol: symbol,
        dates: dates,
        prices: prices,
        volume: generateRandomVolume(),
        marketCap: generateMarketCap(basePrice),
        sector: getSectorForSymbol(symbol)
    };
}

/**
 * Gets base price for a stock symbol
 * @param {string} symbol - Stock symbol
 * @returns {number} - Base price
 */
function getBasePriceForSymbol(symbol) {
    const basePrices = {
        'AAPL': 175.50,
        'MSFT': 335.20,
        'GOOGL': 125.40,
        'AMZN': 145.80,
        'TSLA': 248.90,
        'META': 295.60,
        'NVDA': 485.30,
        'BRK-B': 355.40,
        'JNJ': 165.80,
        'V': 245.70,
        'JPM': 155.90,
        'PG': 145.30
    };
    
    return basePrices[symbol] || 100 + Math.random() * 200;
}

/**
 * Gets sector for a stock symbol
 * @param {string} symbol - Stock symbol
 * @returns {string} - Sector name
 */
function getSectorForSymbol(symbol) {
    const sectors = {
        'AAPL': 'Technology',
        'MSFT': 'Technology',
        'GOOGL': 'Technology',
        'AMZN': 'E-commerce',
        'TSLA': 'Automotive',
        'META': 'Social Media',
        'NVDA': 'Technology',
        'BRK-B': 'Conglomerate',
        'JNJ': 'Healthcare',
        'V': 'Financial Services',
        'JPM': 'Banking',
        'PG': 'Consumer Goods'
    };
    
    return sectors[symbol] || 'Technology';
}

/**
 * Generates a date range for the specified number of days
 * @param {number} days - Number of days
 * @returns {Array<string>} - Array of formatted dates
 */
function generateDateRange(days) {
    const dates = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }));
    }
    
    return dates;
}

/**
 * Generates realistic price history with trends and volatility
 * @param {number} basePrice - Starting price
 * @param {number} days - Number of days
 * @returns {Array<number>} - Array of prices
 */
function generatePriceHistory(basePrice, days) {
    const prices = [basePrice];
    let currentPrice = basePrice;
    
    // Generate overall trend (upward, downward, or sideways)
    const trendDirection = (Math.random() - 0.5) * 0.02; // ±1% daily trend
    
    for (let i = 1; i < days; i++) {
        // Daily volatility (random walk)
        const dailyChange = (Math.random() - 0.5) * 0.08; // ±4% daily volatility
        
        // Apply trend and volatility
        const changePercent = trendDirection + dailyChange;
        currentPrice = currentPrice * (1 + changePercent);
        
        // Ensure price doesn't go below $1
        currentPrice = Math.max(1, currentPrice);
        
        prices.push(parseFloat(currentPrice.toFixed(2)));
    }
    
    return prices;
}

/**
 * Generates random trading volume
 * @returns {number} - Trading volume
 */
function generateRandomVolume() {
    return Math.floor(Math.random() * 50000000) + 5000000; // 5M to 55M shares
}

/**
 * Generates market cap based on price
 * @param {number} price - Current stock price
 * @returns {number} - Market capitalization
 */
function generateMarketCap(price) {
    const sharesOutstanding = Math.floor(Math.random() * 5000000000) + 1000000000; // 1B to 6B shares
    return price * sharesOutstanding;
}