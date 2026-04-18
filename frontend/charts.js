// Charts Implementation for Car Price Predictor Dashboard
class ChartsManager {
    constructor() {
        this.charts = {};
        this.apiBase = '/api';
    }

    async fetchAnalytics() {
        const response = await fetch(`${this.apiBase}/analytics/overview`);
        return response.json();
    }

    // Dashboard Charts
    async initializeDashboardCharts() {
        await this.loadDashboardPriceChart();
        await this.loadDashboardCompanyChart();
    }

    async loadDashboardPriceChart() {
        try {
            const analytics = await this.fetchAnalytics();
            const priceRanges = analytics.price_distribution || [];

            const ctx = document.getElementById('dashboardPriceChart');
            if (!ctx) return;

            if (this.charts.dashboardPrice) {
                this.charts.dashboardPrice.destroy();
            }

            this.charts.dashboardPrice = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: priceRanges.map(item => item.label),
                    datasets: [{
                        label: 'Number of Vehicles',
                        data: priceRanges.map(item => item.count),
                        backgroundColor: 'rgba(232, 168, 56, 0.6)',
                        borderColor: 'rgba(232, 168, 56, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#eee' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#eee' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#eee' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load dashboard price chart:', error);
        }
    }

    async loadDashboardCompanyChart() {
        try {
            const analytics = await this.fetchAnalytics();
            const companyDistribution = analytics.company_distribution || [];

            const ctx = document.getElementById('dashboardCompanyChart');
            if (!ctx) return;

            if (this.charts.dashboardCompany) {
                this.charts.dashboardCompany.destroy();
            }

            this.charts.dashboardCompany = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: companyDistribution.map(item => item.label),
                    datasets: [{
                        data: companyDistribution.map(item => item.count),
                        backgroundColor: [
                            'rgba(232, 168, 56, 0.8)',
                            'rgba(52, 211, 153, 0.8)',
                            'rgba(96, 165, 250, 0.8)',
                            'rgba(248, 113, 113, 0.8)',
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(251, 146, 60, 0.8)',
                            'rgba(22, 163, 74, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(99, 102, 241, 0.8)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: '#eee' }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load dashboard company chart:', error);
        }
    }

    // Market Trends Charts
    async initializeMarketTrendsCharts() {
        await this.loadPriceTrendsChart();
        await this.loadFuelDistributionChart();
        await this.loadYearPriceChart();
    }

    async loadPriceTrendsChart() {
        try {
            const analytics = await this.fetchAnalytics();
            const yearlyAveragePrices = analytics.yearly_average_prices || [];

            const ctx = document.getElementById('priceTrendsChart');
            if (!ctx) return;

            if (this.charts.priceTrends) {
                this.charts.priceTrends.destroy();
            }

            this.charts.priceTrends = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: yearlyAveragePrices.map(item => item.year),
                    datasets: [{
                        label: 'Average Price (Rs)',
                        data: yearlyAveragePrices.map(item => item.average_price),
                        borderColor: 'rgba(232, 168, 56, 1)',
                        backgroundColor: 'rgba(232, 168, 56, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#eee' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: { color: '#eee', callback: value => `Rs ${(value/100000).toFixed(1)}L` },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#eee' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load price trends chart:', error);
        }
    }

    async loadFuelDistributionChart() {
        try {
            const analytics = await this.fetchAnalytics();
            const fuelDistribution = analytics.fuel_distribution || [];

            const ctx = document.getElementById('fuelDistributionChart');
            if (!ctx) return;

            if (this.charts.fuelDistribution) {
                this.charts.fuelDistribution.destroy();
            }

            this.charts.fuelDistribution = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: fuelDistribution.map(item => item.label),
                    datasets: [{
                        data: fuelDistribution.map(item => item.count),
                        backgroundColor: [
                            'rgba(232, 168, 56, 0.8)',
                            'rgba(52, 211, 153, 0.8)',
                            'rgba(96, 165, 250, 0.8)',
                            'rgba(248, 113, 113, 0.8)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: '#eee' }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load fuel distribution chart:', error);
        }
    }

    async loadYearPriceChart() {
        try {
            const analytics = await this.fetchAnalytics();
            const yearlyAveragePrices = analytics.yearly_average_prices || [];

            const ctx = document.getElementById('yearPriceChart');
            if (!ctx) return;

            if (this.charts.yearPrice) {
                this.charts.yearPrice.destroy();
            }

            this.charts.yearPrice = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: yearlyAveragePrices.map(item => item.year),
                    datasets: [{
                        label: 'Average Price (Rs)',
                        data: yearlyAveragePrices.map(item => item.average_price),
                        backgroundColor: 'rgba(96, 165, 250, 0.6)',
                        borderColor: 'rgba(96, 165, 250, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#eee' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: { color: '#eee', callback: value => `Rs ${(value/100000).toFixed(1)}L` },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#eee' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load year price chart:', error);
        }
    }

    // Reports Charts
    async initializeReportsCharts() {
        await this.loadAccuracyChart();
        await this.loadPredictionsChart();
        await this.loadResponseChart();
    }

    async loadAccuracyChart() {
        const ctx = document.getElementById('accuracyChart');
        if (!ctx) return;

        const analytics = await this.fetchAnalytics();
        const recentPredictions = analytics.recent_predictions || [];
        const buckets = recentPredictions.slice(0, 6).reverse();
        const labels = buckets.length ? buckets.map(item => new Date(item.timestamp).toLocaleDateString()) : ['Now'];
        const accuracyData = buckets.length
            ? buckets.map(item => item.confidence || 0)
            : [0];

        if (this.charts.accuracy) {
            this.charts.accuracy.destroy();
        }

        this.charts.accuracy = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Accuracy %',
                    data: accuracyData,
                    borderColor: 'rgba(52, 211, 153, 1)',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#eee' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 85,
                        max: 100,
                        ticks: { color: '#eee', callback: value => `${value}%` },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#eee' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    async loadPredictionsChart() {
        const ctx = document.getElementById('predictionsChart');
        if (!ctx) return;

        const analytics = await this.fetchAnalytics();
        const recentPredictions = analytics.recent_predictions || [];
        const grouped = new Map();
        recentPredictions.forEach(item => {
            const label = new Date(item.timestamp).toLocaleDateString(undefined, { weekday: 'short' });
            grouped.set(label, (grouped.get(label) || 0) + 1);
        });
        const labels = [...grouped.keys()];
        const predictionsData = [...grouped.values()];

        if (this.charts.predictions) {
            this.charts.predictions.destroy();
        }

        this.charts.predictions = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Predictions',
                    data: predictionsData.length ? predictionsData : [0],
                    backgroundColor: 'rgba(96, 165, 250, 0.6)',
                    borderColor: 'rgba(96, 165, 250, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#eee' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#eee' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#eee' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    async loadResponseChart() {
        const ctx = document.getElementById('responseChart');
        if (!ctx) return;

        const analytics = await this.fetchAnalytics();
        const recentPredictions = (analytics.recent_predictions || []).slice(0, 6).reverse();
        const labels = recentPredictions.length
            ? recentPredictions.map(item => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            : ['No Data'];
        const responseTimes = recentPredictions.length
            ? recentPredictions.map(item => (item.response_time_ms || 0) / 1000)
            : [0];

        if (this.charts.response) {
            this.charts.response.destroy();
        }

        this.charts.response = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Response Time (s)',
                    data: responseTimes,
                    borderColor: 'rgba(248, 113, 113, 1)',
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#eee' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#eee', callback: value => `${value.toFixed(1)}s` },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#eee' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    // Update chart data
    updateChart(chartId, newData) {
        if (this.charts[chartId]) {
            this.charts[chartId].data = newData;
            this.charts[chartId].update();
        }
    }
}

// Global charts manager instance
window.chartsManager = new ChartsManager();
