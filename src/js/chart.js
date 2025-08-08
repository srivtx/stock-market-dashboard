// Chart.js Configuration and Management for Stock Market Dashboard

/**
 * Chart configuration and theme settings
 */
const chartConfig = {
    defaultColors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    },
    
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#667eea',
                borderWidth: 1,
                cornerRadius: 6,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `Price: $${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)',
                    borderDash: [5, 5]
                },
                ticks: {
                    maxTicksLimit: 10
                }
            },
            y: {
                grid: {
                    color: 'rgba(0,0,0,0.1)',
                    borderDash: [5, 5]
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
        },
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    }
};

/**
 * Creates a line chart for stock prices
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} stockData - Stock data object
 * @param {string} companyName - Company name for chart title
 * @returns {Chart} - Chart.js instance
 */
function createStockChart(canvas, stockData, companyName) {
    const ctx = canvas.getContext('2d');
    
    const config = {
        type: 'line',
        data: {
            labels: stockData.dates,
            datasets: [{
                label: `${companyName} Stock Price`,
                data: stockData.prices,
                borderColor: chartConfig.defaultColors.primary,
                backgroundColor: hexToRgba(chartConfig.defaultColors.primary, 0.1),
                borderWidth: 2,
                fill: true,
                tension: 0.1,
                pointBackgroundColor: chartConfig.defaultColors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: chartConfig.defaultColors.primary,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            ...chartConfig.defaultOptions,
            plugins: {
                ...chartConfig.defaultOptions.plugins,
                title: {
                    display: true,
                    text: `${companyName} - Stock Price History`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    };
    
    return new Chart(ctx, config);
}

/**
 * Creates a candlestick chart (simplified using line chart)
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} ohlcData - OHLC data object
 * @param {string} companyName - Company name for chart title
 * @returns {Chart} - Chart.js instance
 */
function createCandlestickChart(canvas, ohlcData, companyName) {
    const ctx = canvas.getContext('2d');
    
    const config = {
        type: 'line',
        data: {
            labels: ohlcData.dates,
            datasets: [
                {
                    label: 'High',
                    data: ohlcData.high,
                    borderColor: chartConfig.defaultColors.success,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 2,
                    fill: false
                },
                {
                    label: 'Low',
                    data: ohlcData.low,
                    borderColor: chartConfig.defaultColors.danger,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 2,
                    fill: false
                },
                {
                    label: 'Close',
                    data: ohlcData.close,
                    borderColor: chartConfig.defaultColors.primary,
                    backgroundColor: hexToRgba(chartConfig.defaultColors.primary, 0.1),
                    borderWidth: 2,
                    pointRadius: 3,
                    fill: '+1'
                }
            ]
        },
        options: {
            ...chartConfig.defaultOptions,
            plugins: {
                ...chartConfig.defaultOptions.plugins,
                title: {
                    display: true,
                    text: `${companyName} - OHLC Chart`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    };
    
    return new Chart(ctx, config);
}

/**
 * Creates a volume chart
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} volumeData - Volume data object
 * @param {string} companyName - Company name for chart title
 * @returns {Chart} - Chart.js instance
 */
function createVolumeChart(canvas, volumeData, companyName) {
    const ctx = canvas.getContext('2d');
    
    const config = {
        type: 'bar',
        data: {
            labels: volumeData.dates,
            datasets: [{
                label: 'Trading Volume',
                data: volumeData.volumes,
                backgroundColor: chartConfig.defaultColors.info,
                borderColor: chartConfig.defaultColors.info,
                borderWidth: 1,
                borderRadius: 2
            }]
        },
        options: {
            ...chartConfig.defaultOptions,
            plugins: {
                ...chartConfig.defaultOptions.plugins,
                title: {
                    display: true,
                    text: `${companyName} - Trading Volume`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    ...chartConfig.defaultOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `Volume: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                ...chartConfig.defaultOptions.scales,
                y: {
                    ...chartConfig.defaultOptions.scales.y,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    };
    
    return new Chart(ctx, config);
}

/**
 * Updates chart data with new stock data
 * @param {Chart} chart - Chart.js instance
 * @param {Object} newData - New stock data
 */
function updateChartData(chart, newData) {
    chart.data.labels = newData.dates;
    chart.data.datasets[0].data = newData.prices;
    chart.update('active');
}

/**
 * Adds real-time data point to chart
 * @param {Chart} chart - Chart.js instance
 * @param {string} date - Date label
 * @param {number} price - Price value
 */
function addRealTimeDataPoint(chart, date, price) {
    chart.data.labels.push(date);
    chart.data.datasets[0].data.push(price);
    
    // Keep only last 30 data points
    if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    
    chart.update('none'); // No animation for real-time updates
}

/**
 * Changes chart theme
 * @param {Chart} chart - Chart.js instance
 * @param {string} theme - Theme name ('light', 'dark')
 */
function changeChartTheme(chart, theme) {
    if (theme === 'dark') {
        chart.options.plugins.legend.labels.color = '#ffffff';
        chart.options.scales.x.ticks.color = '#ffffff';
        chart.options.scales.y.ticks.color = '#ffffff';
        chart.options.scales.x.grid.color = 'rgba(255,255,255,0.1)';
        chart.options.scales.y.grid.color = 'rgba(255,255,255,0.1)';
    } else {
        chart.options.plugins.legend.labels.color = '#666';
        chart.options.scales.x.ticks.color = '#666';
        chart.options.scales.y.ticks.color = '#666';
        chart.options.scales.x.grid.color = 'rgba(0,0,0,0.1)';
        chart.options.scales.y.grid.color = 'rgba(0,0,0,0.1)';
    }
    
    chart.update();
}

/**
 * Exports chart as image
 * @param {Chart} chart - Chart.js instance
 * @param {string} filename - Filename for download
 */
function exportChart(chart, filename = 'stock-chart.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = chart.toBase64Image();
    link.click();
}

/**
 * Destroys chart instance safely
 * @param {Chart} chart - Chart.js instance
 */
function destroyChart(chart) {
    if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
    }
}

// Chart animation presets
const chartAnimations = {
    fadeIn: {
        duration: 1000,
        easing: 'easeInOutQuart',
        from: { opacity: 0 },
        to: { opacity: 1 }
    },
    
    slideUp: {
        duration: 800,
        easing: 'easeOutBounce',
        from: { y: 100 },
        to: { y: 0 }
    },
    
    scaleIn: {
        duration: 600,
        easing: 'easeInOutBack',
        from: { scale: 0 },
        to: { scale: 1 }
    }
};

// Export functions and objects
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        chartConfig,
        createStockChart,
        createCandlestickChart,
        createVolumeChart,
        updateChartData,
        addRealTimeDataPoint,
        changeChartTheme,
        exportChart,
        destroyChart,
        chartAnimations
    };
}