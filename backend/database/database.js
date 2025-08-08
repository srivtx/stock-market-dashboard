// Mock database for development - no real database needed
const { logger } = require('../utils/logger');

let database = null;

// Initialize mock database
async function initializeDatabase() {
    try {
        logger.info('Initializing mock database...');
        
        // Mock database initialization
        database = {
            connected: true,
            initialized: new Date().toISOString(),
            tables: ['companies', 'stocks', 'predictions', 'users']
        };
        
        logger.info('Mock database initialized successfully');
        return database;
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw error;
    }
}

// Get database connection
function getDatabase() {
    if (!database) {
        throw new Error('Database not initialized');
    }
    return database;
}

// Close database connection
async function closeDatabase() {
    if (database) {
        logger.info('Closing database connection...');
        database = null;
        logger.info('Database connection closed');
    }
}

module.exports = {
    initializeDatabase,
    getDatabase,
    closeDatabase
};