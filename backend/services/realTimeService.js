const { updateRealTimePrices, mockStockData } = require('../data/mockStocks');
const { logger } = require('../utils/logger');

let intervalId = null;

function startRealTimeUpdates() {
    logger.info('Starting real-time stock updates...');
    
    // Update stock prices every 5 seconds
    intervalId = setInterval(() => {
        updateRealTimePrices();
        
        // Broadcast updates to WebSocket clients if available
        if (global.broadcast) {
            Object.keys(mockStockData).forEach(symbol => {
                const stock = mockStockData[symbol];
                global.broadcast({
                    type: 'priceUpdate',
                    symbol: symbol,
                    data: {
                        currentPrice: stock.currentPrice,
                        change: stock.change,
                        changePercent: stock.changePercent,
                        volume: stock.volume,
                        timestamp: new Date().toISOString()
                    }
                });
            });
        }
    }, 5000);
    
    logger.info('Real-time updates started (5-second intervals)');
}

function stopRealTimeUpdates() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        logger.info('Real-time updates stopped');
    }
}

module.exports = {
    startRealTimeUpdates,
    stopRealTimeUpdates
};