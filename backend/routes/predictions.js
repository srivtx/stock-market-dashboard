const express = require('express');
const { mockPredictions, mockStockData } = require('../data/mockStocks');
const router = express.Router();

// GET /api/predictions - Get all AI predictions
router.get('/', (req, res) => {
    try {
        const predictions = Object.keys(mockPredictions).map(symbol => ({
            symbol,
            ...mockPredictions[symbol],
            currentPrice: mockStockData[symbol]?.currentPrice,
            timestamp: new Date().toISOString()
        }));

        res.json({
            success: true,
            data: predictions,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch predictions',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/predictions/:symbol - Get AI prediction for specific stock
router.get('/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        const prediction = mockPredictions[symbol.toUpperCase()];

        if (!prediction) {
            return res.status(404).json({
                success: false,
                error: 'Prediction not found for this symbol',
                timestamp: new Date().toISOString()
            });
        }

        const stock = mockStockData[symbol.toUpperCase()];
        const predictionWithStock = {
            symbol: symbol.toUpperCase(),
            ...prediction,
            currentPrice: stock?.currentPrice,
            potentialReturn: stock ? ((prediction.targetPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2) : null,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: predictionWithStock,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch prediction',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/predictions/:symbol/generate - Generate new AI prediction
router.post('/:symbol/generate', (req, res) => {
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

        // Simulate AI prediction generation
        const predictions = ['bullish', 'bearish', 'neutral'];
        const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
        const confidence = 0.6 + Math.random() * 0.3; // 60-90% confidence
        
        let targetPriceMultiplier;
        switch (randomPrediction) {
            case 'bullish':
                targetPriceMultiplier = 1 + (Math.random() * 0.2); // 0-20% increase
                break;
            case 'bearish':
                targetPriceMultiplier = 1 - (Math.random() * 0.2); // 0-20% decrease
                break;
            default:
                targetPriceMultiplier = 1 + ((Math.random() - 0.5) * 0.1); // -5% to +5%
        }

        const targetPrice = parseFloat((stock.currentPrice * targetPriceMultiplier).toFixed(2));

        const factors = {
            bullish: ['Strong earnings growth', 'Positive market sentiment', 'Technical breakout', 'Sector outperformance'],
            bearish: ['Market volatility', 'Economic concerns', 'Overbought conditions', 'Sector weakness'],
            neutral: ['Mixed signals', 'Market uncertainty', 'Consolidation phase', 'Awaiting catalysts']
        };

        const newPrediction = {
            prediction: randomPrediction,
            confidence: parseFloat(confidence.toFixed(2)),
            targetPrice,
            timeframe: '30 days',
            factors: factors[randomPrediction].slice(0, 3),
            analysis: `AI analysis suggests ${randomPrediction} outlook based on current market conditions and technical indicators.`,
            generated: true,
            generatedAt: new Date().toISOString()
        };

        // Update mock predictions
        mockPredictions[symbol.toUpperCase()] = newPrediction;

        const responseData = {
            symbol: symbol.toUpperCase(),
            ...newPrediction,
            currentPrice: stock.currentPrice,
            potentialReturn: ((targetPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2),
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: responseData,
            message: 'New AI prediction generated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate prediction',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/predictions/:symbol/accuracy - Get prediction accuracy metrics
router.get('/:symbol/accuracy', (req, res) => {
    try {
        const { symbol } = req.params;
        
        // Mock accuracy data
        const accuracy = {
            symbol: symbol.toUpperCase(),
            overallAccuracy: 0.72 + Math.random() * 0.18, // 72-90% accuracy
            last30Days: {
                total: 15,
                correct: Math.floor(10 + Math.random() * 5),
                accuracy: null
            },
            byPredictionType: {
                bullish: { total: 8, correct: Math.floor(6 + Math.random() * 2) },
                bearish: { total: 4, correct: Math.floor(2 + Math.random() * 2) },
                neutral: { total: 3, correct: Math.floor(2 + Math.random() * 1) }
            },
            averageTimeToTarget: '18 days',
            confidenceVsAccuracy: {
                high: { predictions: 8, accuracy: 0.85 },
                medium: { predictions: 5, accuracy: 0.70 },
                low: { predictions: 2, accuracy: 0.55 }
            }
        };

        // Calculate accuracy percentages
        accuracy.last30Days.accuracy = (accuracy.last30Days.correct / accuracy.last30Days.total);
        Object.keys(accuracy.byPredictionType).forEach(type => {
            const data = accuracy.byPredictionType[type];
            data.accuracy = data.correct / data.total;
        });

        res.json({
            success: true,
            data: accuracy,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch accuracy metrics',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;