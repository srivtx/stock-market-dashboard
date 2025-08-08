// Stock Market Dashboard Backend Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const { initializeDatabase, getDatabase } = require('./database/database');
const stockRoutes = require('./routes/stocks');
const companyRoutes = require('./routes/companies');
const predictionRoutes = require('./routes/predictions');
const marketRoutes = require('./routes/market');
const { startRealTimeUpdates } = require('./services/realTimeService');
const { scheduleDataUpdates } = require('./services/schedulerService');
const { logger } = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Environment configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
    origin: NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:8080', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Serve static files from frontend in production
if (NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../src')));
    
    // Handle React routing - return index.html for non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(__dirname, '../src/index.html'));
        }
    });
}

// API Routes
app.use('/api/companies', companyRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/market', marketRoutes);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    logger.info('New WebSocket connection established');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            logger.info('WebSocket message received:', data);
            
            // Handle different message types
            switch (data.type) {
                case 'subscribe':
                    ws.symbol = data.symbol;
                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        symbol: data.symbol,
                        message: `Subscribed to ${data.symbol} updates`
                    }));
                    break;
                    
                case 'unsubscribe':
                    ws.symbol = null;
                    ws.send(JSON.stringify({
                        type: 'unsubscribed',
                        message: 'Unsubscribed from updates'
                    }));
                    break;
                    
                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type'
                    }));
            }
        } catch (error) {
            logger.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    ws.on('close', () => {
        logger.info('WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Stock Market Dashboard API',
        timestamp: new Date().toISOString()
    }));
});

// Broadcast function for real-time updates
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            // Send to all clients or filter by subscribed symbol
            if (!client.symbol || client.symbol === data.symbol) {
                client.send(JSON.stringify(data));
            }
        }
    });
}

// Make broadcast function available globally
global.broadcast = broadcast;

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    
    // Don't leak error details in production
    const error = NODE_ENV === 'production' 
        ? { message: 'Internal server error' }
        : { message: err.message, stack: err.stack };
    
    res.status(err.status || 500).json({
        error: error,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();
        logger.info('Database initialized successfully');
        
        // Start real-time updates
        startRealTimeUpdates();
        logger.info('Real-time updates service started');
        
        // Schedule data updates
        scheduleDataUpdates();
        logger.info('Data update scheduler started');
        
        // Start server
        server.listen(PORT, () => {
            logger.info(`🚀 Stock Market Dashboard API Server running on port ${PORT}`);
            logger.info(`📊 Environment: ${NODE_ENV}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
            logger.info(`📡 WebSocket available on ws://localhost:${PORT}`);
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = { app, server, wss };
