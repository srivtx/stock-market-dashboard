const express = require('express');
const { mockStockData, updateRealTimePrices } = require('../data/mockStocks');
const router = express.Router();

// GET /api/stocks - Get all stock data
router.get('/', (req, res) => {
    try {
        updateRealTimePrices(); // Update prices before sending
        
        const stocks = Object.values(mockStockData).map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            currentPrice: stock.currentPrice,
            change: stock.change,
            changePercent: stock.changePercent,
            volume: stock.volume
        }));

        res.json({
            success: true,
            data: stocks,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stock data',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/stocks/:symbol - Get specific stock data
router.get('/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        const stock = mockStockData[symbol.toUpperCase()];

        if (!stock) {
            return res.status(404).json({
                success: false,
                error: 'Stock not found',
                timestamp: new Date().toISOString()
            });
        }

        updateRealTimePrices(); // Update prices before sending

        res.json({
            success: true,
            data: stock,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stock data',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/stocks/:symbol/history - Get stock price history
router.get('/:symbol/history', (req, res) => {
    try {
        const { symbol } = req.params;
        const { period = '30d', interval = '1d' } = req.query;
        
        const stock = mockStockData[symbol.toUpperCase()];

        if (!stock) {
            return res.status(404).json({
                success: false,
                error: 'Stock not found',
                timestamp: new Date().toISOString()
            });
        }

        let history = stock.priceHistory;

        // Filter by period
        const now = new Date();
        let startDate = new Date(now);
        
        switch (period) {
            case '1d':
                startDate.setDate(now.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        history = history.filter(point => 
            new Date(point.timestamp) >= startDate
        );

        res.json({
            success: true,
            data: {
                symbol: symbol.toUpperCase(),
                period,
                interval,
                history
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stock history',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/stocks/:symbol/quote - Get real-time quote
router.get('/:symbol/quote', (req, res) => {
    try {
        const { symbol } = req.params;
        const stock = mockStockData[symbol.toUpperCase()];

        if (!stock) {
            return res.status(404).json({
                success: false,
                error: 'Stock not found',
                timestamp: new Date().toISOString()
            });
        }

        updateRealTimePrices(); // Update prices for real-time quote

        const quote = {
            symbol: stock.symbol,
            name: stock.name,
            currentPrice: stock.currentPrice,
            change: stock.change,
            changePercent: stock.changePercent,
            volume: stock.volume,
            weekHigh: stock.weekHigh,
            weekLow: stock.weekLow,
            marketCap: stock.marketCap,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: quote,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stock quote',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;