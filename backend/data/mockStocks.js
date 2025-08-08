// Mock stock data for development
const mockCompanies = [
    {
        id: 'AAPL',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        marketCap: 3000000000000,
        description: 'Technology company that designs and manufactures consumer electronics'
    },
    {
        id: 'GOOGL',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        sector: 'Technology',
        marketCap: 1800000000000,
        description: 'Multinational technology company specializing in Internet services'
    },
    {
        id: 'MSFT',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        sector: 'Technology',
        marketCap: 2800000000000,
        description: 'Technology company that develops computer software and services'
    },
    {
        id: 'TSLA',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        sector: 'Automotive',
        marketCap: 800000000000,
        description: 'Electric vehicle and clean energy company'
    },
    {
        id: 'NVDA',
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        sector: 'Technology',
        marketCap: 1200000000000,
        description: 'Technology company that designs graphics processing units'
    }
];

// Generate realistic stock price data
function generatePriceHistory(basePrice, days = 30) {
    const prices = [];
    let currentPrice = basePrice;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Random price movement (-3% to +3%)
        const change = (Math.random() - 0.5) * 0.06;
        currentPrice = currentPrice * (1 + change);
        
        // Generate OHLC data
        const open = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.03);
        const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.03);
        
        prices.push({
            date: date.toISOString().split('T')[0],
            timestamp: date.getTime(),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(currentPrice.toFixed(2)),
            volume: Math.floor(Math.random() * 50000000) + 10000000
        });
    }
    
    return prices;
}

// Generate mock stock data
const mockStockData = {
    AAPL: {
        ...mockCompanies.find(c => c.symbol === 'AAPL'),
        currentPrice: 185.50,
        change: 2.30,
        changePercent: 1.26,
        volume: 45230000,
        weekHigh: 199.62,
        weekLow: 164.08,
        priceHistory: generatePriceHistory(185.50)
    },
    GOOGL: {
        ...mockCompanies.find(c => c.symbol === 'GOOGL'),
        currentPrice: 142.80,
        change: -1.20,
        changePercent: -0.83,
        volume: 28450000,
        weekHigh: 153.78,
        weekLow: 129.40,
        priceHistory: generatePriceHistory(142.80)
    },
    MSFT: {
        ...mockCompanies.find(c => c.symbol === 'MSFT'),
        currentPrice: 378.90,
        change: 4.50,
        changePercent: 1.20,
        volume: 32100000,
        weekHigh: 384.30,
        weekLow: 309.45,
        priceHistory: generatePriceHistory(378.90)
    },
    TSLA: {
        ...mockCompanies.find(c => c.symbol === 'TSLA'),
        currentPrice: 245.60,
        change: -8.40,
        changePercent: -3.31,
        volume: 89450000,
        weekHigh: 299.29,
        weekLow: 138.80,
        priceHistory: generatePriceHistory(245.60)
    },
    NVDA: {
        ...mockCompanies.find(c => c.symbol === 'NVDA'),
        currentPrice: 875.30,
        change: 12.80,
        changePercent: 1.48,
        volume: 56780000,
        weekHigh: 974.00,
        weekLow: 394.75,
        priceHistory: generatePriceHistory(875.30)
    }
};

// AI prediction mock data
const mockPredictions = {
    AAPL: {
        prediction: 'bullish',
        confidence: 0.78,
        targetPrice: 195.00,
        timeframe: '30 days',
        factors: ['Strong earnings', 'New product launches', 'Market sentiment'],
        analysis: 'Technical indicators suggest upward momentum with strong support levels.'
    },
    GOOGL: {
        prediction: 'neutral',
        confidence: 0.65,
        targetPrice: 148.50,
        timeframe: '30 days',
        factors: ['Market volatility', 'Regulatory concerns', 'Ad revenue growth'],
        analysis: 'Mixed signals from technical and fundamental analysis.'
    },
    MSFT: {
        prediction: 'bullish',
        confidence: 0.82,
        targetPrice: 395.00,
        timeframe: '30 days',
        factors: ['Cloud growth', 'AI integration', 'Strong fundamentals'],
        analysis: 'Strong fundamentals and cloud business growth support bullish outlook.'
    },
    TSLA: {
        prediction: 'bearish',
        confidence: 0.71,
        targetPrice: 220.00,
        timeframe: '30 days',
        factors: ['Production concerns', 'Competition', 'Market correction'],
        analysis: 'Recent volatility and increased competition pose risks.'
    },
    NVDA: {
        prediction: 'bullish',
        confidence: 0.85,
        targetPrice: 920.00,
        timeframe: '30 days',
        factors: ['AI demand', 'Data center growth', 'Technical breakout'],
        analysis: 'AI boom and strong technical patterns indicate continued growth.'
    }
};

// Function to update prices with random movements
function updateRealTimePrices() {
    Object.keys(mockStockData).forEach(symbol => {
        const stock = mockStockData[symbol];
        const changePercent = (Math.random() - 0.5) * 0.02; // -1% to +1%
        const newPrice = stock.currentPrice * (1 + changePercent);
        const priceChange = newPrice - stock.currentPrice;
        
        stock.currentPrice = parseFloat(newPrice.toFixed(2));
        stock.change = parseFloat(priceChange.toFixed(2));
        stock.changePercent = parseFloat(((priceChange / (newPrice - priceChange)) * 100).toFixed(2));
        
        // Add to price history
        const now = new Date();
        stock.priceHistory.push({
            date: now.toISOString().split('T')[0],
            timestamp: now.getTime(),
            open: stock.currentPrice,
            high: stock.currentPrice * 1.01,
            low: stock.currentPrice * 0.99,
            close: stock.currentPrice,
            volume: Math.floor(Math.random() * 10000000) + 5000000
        });
        
        // Keep only last 30 days
        if (stock.priceHistory.length > 30) {
            stock.priceHistory = stock.priceHistory.slice(-30);
        }
    });
}

module.exports = {
    mockCompanies,
    mockStockData,
    mockPredictions,
    updateRealTimePrices
};