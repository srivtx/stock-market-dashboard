// Stock Market Dashboard Main Application
document.addEventListener('DOMContentLoaded', () => {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        showError('Chart.js library failed to load. Please check your internet connection.');
        return;
    }
    console.log('Chart.js loaded successfully, version:', Chart.version);
    
    const companyList = document.getElementById('company-list');
    const searchInput = document.getElementById('search-input');
    const selectedCompanyElement = document.getElementById('selected-company');
    const currentPriceElement = document.getElementById('current-price');
    const priceChangeElement = document.getElementById('price-change');
    const aiPredictionElement = document.getElementById('ai-prediction');
    const weekHighElement = document.getElementById('week-high');
    const weekLowElement = document.getElementById('week-low');
    const volumeElement = document.getElementById('volume');
    const marketCapElement = document.getElementById('market-cap');
    const chartArea = document.getElementById('chart-area');
    
    let companies = [];
    let currentChart = null;
    let selectedSymbol = null;

    // Load companies data
    loadCompanies();

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterCompanies(searchTerm);
    });

    async function loadCompanies() {
        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/companies`);
            const result = await response.json();
            if (result.success) {
                companies = result.data;
                displayCompanies(companies);
            } else {
                throw new Error('Failed to fetch companies from backend');
            }
        } catch (error) {
            console.error('Error loading companies:', error);
            showError('Failed to load companies data');
        }
    }

    function displayCompanies(companiesToShow) {
        companyList.innerHTML = '';
        companiesToShow.forEach(company => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${company.name}</strong><br>
                <small>${company.symbol} • ${company.sector}</small>
            `;
            listItem.dataset.symbol = company.symbol;
            listItem.addEventListener('click', () => {
                selectCompany(company);
                setActiveCompany(listItem);
            });
            companyList.appendChild(listItem);
        });
    }

    function filterCompanies(searchTerm) {
        const filtered = companies.filter(company => 
            company.name.toLowerCase().includes(searchTerm) ||
            company.symbol.toLowerCase().includes(searchTerm) ||
            company.sector.toLowerCase().includes(searchTerm)
        );
        displayCompanies(filtered);
    }

    function setActiveCompany(activeItem) {
        // Remove active class from all items
        document.querySelectorAll('.company-list li').forEach(item => {
            item.classList.remove('active');
        });
        // Add active class to selected item
        activeItem.classList.add('active');
    }

    async function selectCompany(company) {
        console.log('Selecting company:', company);
        selectedSymbol = company.symbol;
        selectedCompanyElement.textContent = company.name;
        
        // Show loading state
        showLoading();
        
        try {
            // Load stock data from backend API
            console.log('Loading stock data for:', company.symbol);
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const [stockResponse, predictionResponse] = await Promise.all([
                fetch(`${apiUrl}/api/stocks/${company.symbol}`),
                fetch(`${apiUrl}/api/predictions/${company.symbol}`)
            ]);
            
            const stockResult = await stockResponse.json();
            const predictionResult = await predictionResponse.json();
            
            if (!stockResult.success) {
                throw new Error('Failed to fetch stock data from backend');
            }
            
            const stockData = stockResult.data;
            console.log('Stock data loaded:', stockData);
            
            // Transform backend data for chart
            const chartData = {
                dates: stockData.priceHistory.map(h => h.date),
                prices: stockData.priceHistory.map(h => h.close),
                volume: stockData.volume,
                marketCap: stockData.marketCap
            };
            
            updateStockInfo(stockData);
            renderChart(chartData, company.name);
            
            // Display AI prediction from backend
            if (predictionResult.success) {
                displayBackendAIPrediction(predictionResult.data);
            } else {
                console.warn('AI prediction not available:', predictionResult.error);
            }
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            showError('Failed to load stock data for ' + company.name);
        }
    }

    function updateStockInfo(stockData) {
        currentPriceElement.textContent = `$${stockData.currentPrice.toFixed(2)}`;
        
        const changeText = `${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)`;
        priceChangeElement.textContent = changeText;
        priceChangeElement.className = `price-change ${stockData.change >= 0 ? 'positive' : 'negative'}`;
        
        // Update additional metrics
        weekHighElement.textContent = `$${stockData.weekHigh.toFixed(2)}`;
        weekLowElement.textContent = `$${stockData.weekLow.toFixed(2)}`;
        volumeElement.textContent = formatNumber(stockData.volume);
        marketCapElement.textContent = formatNumber(stockData.marketCap);
    }

    function renderChart(stockData, companyName) {
        console.log('Rendering chart for:', companyName, 'with data:', stockData);
        
        // Remove any overlays and empty state
        const chartContainer = document.querySelector('.chart-container');
        const existingOverlay = chartContainer.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const emptyStateOverlay = chartContainer.querySelector('.empty-state-overlay');
        if (emptyStateOverlay) {
            emptyStateOverlay.remove();
        }
        
        // Ensure canvas exists and is visible
        let canvas = document.getElementById('chart-area');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        // Show and size the canvas properly
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
        
        try {
            // Create new chart
            currentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: stockData.dates,
                    datasets: [{
                        label: `${companyName} Stock Price`,
                        data: stockData.prices,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.1,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: `${companyName} - 30 Day Price History`,
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Price (USD)'
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(2);
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            
            console.log('Chart created successfully:', currentChart);
        } catch (error) {
            console.error('Error creating chart:', error);
            showError('Failed to create chart: ' + error.message);
        }
    }

    function generateAIPrediction(stockData) {
        // Simple AI prediction simulation
        const prices = stockData.prices;
        const recentPrices = prices.slice(-5); // Last 5 days
        const trend = calculateTrend(recentPrices);
        const volatility = calculateVolatility(prices);
        
        // Simple prediction logic
        const lastPrice = prices[prices.length - 1];
        const randomFactor = (Math.random() - 0.5) * 0.1; // ±5% random factor
        const trendFactor = trend * 0.3; // 30% influence from trend
        const prediction = lastPrice * (1 + trendFactor + randomFactor);
        
        return {
            nextDayPrice: prediction,
            confidence: Math.max(0.6, 1 - volatility),
            direction: prediction > lastPrice ? 'up' : 'down'
        };
    }

    function displayAIPrediction(prediction) {
        const direction = prediction.direction === 'up' ? '↗' : '↘';
        const confidence = (prediction.confidence * 100).toFixed(0);
        aiPredictionElement.textContent = 
            `AI Prediction: $${prediction.nextDayPrice.toFixed(2)} ${direction} (${confidence}% confidence)`;
    }

    function displayBackendAIPrediction(prediction) {
        const direction = prediction.prediction === 'bullish' ? '↗' : prediction.prediction === 'bearish' ? '↘' : '→';
        const confidence = (prediction.confidence * 100).toFixed(0);
        aiPredictionElement.textContent = 
            `AI Prediction: $${prediction.targetPrice.toFixed(2)} ${direction} (${confidence}% confidence)`;
    }

    function formatNumber(num) {
        if (num >= 1e12) {
            return (num / 1e12).toFixed(2) + 'T';
        } else if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toString();
    }

    function showLoading() {
        // Clear the chart instead of replacing the entire container
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
        
        // Add loading overlay
        const chartContainer = document.querySelector('.chart-container');
        const existingOverlay = chartContainer.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading">Loading stock data...</div>';
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(250, 251, 252, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            z-index: 10;
        `;
        chartContainer.appendChild(loadingOverlay);
    }

    function showError(message) {
        // Clear the chart instead of replacing the entire container
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
        
        // Add error overlay
        const chartContainer = document.querySelector('.chart-container');
        const existingOverlay = chartContainer.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'loading-overlay';
        errorOverlay.innerHTML = `<div class="error">${message}</div>`;
        errorOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(250, 251, 252, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            z-index: 10;
        `;
        chartContainer.appendChild(errorOverlay);
    }

    // Initialize with empty state
    function initializeEmptyState() {
        const chartContainer = document.querySelector('.chart-container');
        
        // Only add empty state if no canvas exists or it's empty
        if (!chartContainer.querySelector('#chart-area')) {
            console.error('Canvas element missing from HTML!');
            return;
        }
        
        // Hide canvas initially
        const canvas = document.getElementById('chart-area');
        canvas.style.display = 'none';
        
        // Add empty state overlay
        const emptyStateOverlay = document.createElement('div');
        emptyStateOverlay.className = 'empty-state-overlay';
        emptyStateOverlay.innerHTML = `
            <div class="empty-state">
                <h3>Welcome to Stock Market Dashboard</h3>
                <p>Select a company from the list to view its stock data and AI predictions</p>
            </div>
        `;
        emptyStateOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #fafbfc;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            z-index: 5;
        `;
        chartContainer.appendChild(emptyStateOverlay);
    }

    // Initialize empty state on load
    initializeEmptyState();
});