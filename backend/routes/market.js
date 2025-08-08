const express = require('express');
const { mockStockData } = require('../data/mockStocks');
const router = express.Router();

// GET /api/market/overview - Get market overview
router.get('/overview', (req, res) => {
    try {
        const stocks = Object.values(mockStockData);
        
        // Calculate market metrics
        const totalValue = stocks.reduce((sum, stock) => sum + stock.currentPrice, 0);
        const gainers = stocks.filter(stock => stock.change > 0);
        const losers = stocks.filter(stock => stock.change < 0);
        const unchanged = stocks.filter(stock => stock.change === 0);

        // Market indices (mock data)
        const indices = {
            SP500: {
                name: 'S&P 500',
                value: 4150.48 + (Math.random() - 0.5) * 20,
                change: (Math.random() - 0.5) * 30,
                changePercent: null
            },
            NASDAQ: {
                name: 'NASDAQ',
                value: 12850.22 + (Math.random() - 0.5) * 50,
                change: (Math.random() - 0.5) * 40,
                changePercent: null
            },
            DOW: {
                name: 'Dow Jones',
                value: 33875.40 + (Math.random() - 0.5) * 100,
                change: (Math.random() - 0.5) * 200,
                changePercent: null
            }
        };

        // Calculate change percentages for indices
        Object.keys(indices).forEach(key => {
            const index = indices[key];
            index.changePercent = parseFloat(((index.change / (index.value - index.change)) * 100).toFixed(2));
            index.value = parseFloat(index.value.toFixed(2));
            index.change = parseFloat(index.change.toFixed(2));
        });

        const overview = {
            market: {
                isOpen: isMarketOpen(),
                nextOpen: getNextMarketOpen(),
                nextClose: getNextMarketClose()
            },
            indices,
            summary: {
                totalStocks: stocks.length,
                gainers: gainers.length,
                losers: losers.length,
                unchanged: unchanged.length,
                averageChange: parseFloat((stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length).toFixed(2))
            },
            topGainers: stocks
                .filter(stock => stock.change > 0)
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 5)
                .map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    currentPrice: stock.currentPrice,
                    change: stock.change,
                    changePercent: stock.changePercent
                })),
            topLosers: stocks
                .filter(stock => stock.change < 0)
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 5)
                .map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    currentPrice: stock.currentPrice,
                    change: stock.change,
                    changePercent: stock.changePercent
                })),
            mostActive: stocks
                .sort((a, b) => b.volume - a.volume)
                .slice(0, 5)
                .map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    volume: stock.volume,
                    currentPrice: stock.currentPrice,
                    changePercent: stock.changePercent
                }))
        };

        res.json({
            success: true,
            data: overview,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market overview',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/market/sectors - Get sector performance
router.get('/sectors', (req, res) => {
    try {
        const stocks = Object.values(mockStockData);
        
        // Group by sector
        const sectorData = {};
        stocks.forEach(stock => {
            if (!sectorData[stock.sector]) {
                sectorData[stock.sector] = {
                    sector: stock.sector,
                    stocks: [],
                    totalValue: 0,
                    totalChange: 0,
                    avgChange: 0
                };
            }
            sectorData[stock.sector].stocks.push(stock);
            sectorData[stock.sector].totalValue += stock.currentPrice;
            sectorData[stock.sector].totalChange += stock.change;
        });

        // Calculate sector performance
        const sectors = Object.values(sectorData).map(sector => {
            const avgChange = sector.totalChange / sector.stocks.length;
            const avgChangePercent = sector.stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / sector.stocks.length;
            
            return {
                sector: sector.sector,
                stockCount: sector.stocks.length,
                averagePrice: parseFloat((sector.totalValue / sector.stocks.length).toFixed(2)),
                averageChange: parseFloat(avgChange.toFixed(2)),
                averageChangePercent: parseFloat(avgChangePercent.toFixed(2)),
                topStock: sector.stocks.sort((a, b) => b.changePercent - a.changePercent)[0],
                totalMarketCap: sector.stocks.reduce((sum, stock) => sum + stock.marketCap, 0)
            };
        });

        res.json({
            success: true,
            data: sectors.sort((a, b) => b.averageChangePercent - a.averageChangePercent),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sector data',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/market/news - Get mock market news
router.get('/news', (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const mockNews = [
            {
                id: 1,
                headline: "Tech Stocks Rally on AI Optimism",
                summary: "Major technology companies see significant gains as investors bet on artificial intelligence growth.",
                source: "Market Watch",
                publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                category: "Technology",
                relatedSymbols: ["AAPL", "GOOGL", "MSFT", "NVDA"]
            },
            {
                id: 2,
                headline: "Federal Reserve Signals Potential Rate Changes",
                summary: "Fed officials hint at monetary policy adjustments in upcoming meetings amid economic data.",
                source: "Financial Times",
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                category: "Economy",
                relatedSymbols: []
            },
            {
                id: 3,
                headline: "Electric Vehicle Sales Surge in Q4",
                summary: "EV manufacturers report strong quarterly sales, boosting investor confidence in the sector.",
                source: "Auto News",
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                category: "Automotive",
                relatedSymbols: ["TSLA"]
            },
            {
                id: 4,
                headline: "Cloud Computing Revenue Growth Accelerates",
                summary: "Major cloud providers report accelerating growth in enterprise adoption and revenue.",
                source: "Tech Daily",
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                category: "Technology",
                relatedSymbols: ["MSFT", "GOOGL"]
            },
            {
                id: 5,
                headline: "Market Volatility Expected Amid Earnings Season",
                summary: "Analysts predict increased market volatility as major companies report quarterly earnings.",
                source: "Investment Weekly",
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
                category: "Markets",
                relatedSymbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]
            }
        ];

        const limitedNews = mockNews.slice(0, parseInt(limit));

        res.json({
            success: true,
            data: limitedNews,
            total: limitedNews.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market news',
            timestamp: new Date().toISOString()
        });
    }
});

// Helper functions
function isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    if (day === 0 || day === 6) return false;
    return hour >= 9 && hour < 16;
}

function getNextMarketOpen() {
    const now = new Date();
    const nextOpen = new Date(now);
    
    if (now.getDay() === 0) {
        nextOpen.setDate(now.getDate() + 1);
    } else if (now.getDay() === 6) {
        nextOpen.setDate(now.getDate() + 2);
    } else if (now.getHours() >= 16) {
        nextOpen.setDate(now.getDate() + 1);
    }
    
    nextOpen.setHours(9, 30, 0, 0);
    return nextOpen.toISOString();
}

function getNextMarketClose() {
    const now = new Date();
    const nextClose = new Date(now);
    
    if (isMarketOpen()) {
        nextClose.setHours(16, 0, 0, 0);
        return nextClose.toISOString();
    }
    
    return new Date(getNextMarketOpen()).setHours(16, 0, 0, 0);
}

module.exports = router;