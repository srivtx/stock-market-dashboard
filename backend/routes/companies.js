const express = require('express');
const { mockCompanies, mockStockData } = require('../data/mockStocks');
const router = express.Router();

// GET /api/companies - Get all companies
router.get('/', (req, res) => {
    try {
        const { search, sector } = req.query;
        let companies = mockCompanies;

        // Filter by search term
        if (search) {
            const searchTerm = search.toLowerCase();
            companies = companies.filter(company =>
                company.name.toLowerCase().includes(searchTerm) ||
                company.symbol.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by sector
        if (sector) {
            companies = companies.filter(company =>
                company.sector.toLowerCase() === sector.toLowerCase()
            );
        }

        // Add current price data
        const companiesWithPrices = companies.map(company => ({
            ...company,
            currentPrice: mockStockData[company.symbol]?.currentPrice,
            change: mockStockData[company.symbol]?.change,
            changePercent: mockStockData[company.symbol]?.changePercent
        }));

        res.json({
            success: true,
            data: companiesWithPrices,
            total: companiesWithPrices.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch companies',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/companies/:symbol - Get specific company
router.get('/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        const company = mockCompanies.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());

        if (!company) {
            return res.status(404).json({
                success: false,
                error: 'Company not found',
                timestamp: new Date().toISOString()
            });
        }

        // Add current stock data
        const stockData = mockStockData[company.symbol];
        const companyWithStock = {
            ...company,
            ...stockData
        };

        res.json({
            success: true,
            data: companyWithStock,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company data',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;