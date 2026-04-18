// Page Router for Car Price Predictor Dashboard
class PageRouter {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {};
        this.apiBase = '/api';
        this.selectedVehicles = [];
        this.databaseRecords = [];
        this.filteredDatabaseRecords = [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadInitialPage();
        this.setupBrowserNavigation();
    }

    setupNavigation() {
        // Add click handlers to all menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    window.mobileNavigation?.close();
                    this.navigateTo(page);
                }
            });
        });
    }

    setupBrowserNavigation() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });
    }

    navigateTo(pageName) {
        if (this.currentPage === pageName) return;
        
        // Update browser history
        history.pushState({ page: pageName }, '', `#${pageName}`);
        
        // Load the page
        this.loadPage(pageName, true);
    }

    async loadPage(pageName, updateHistory = true) {
        try {
            // Show loading state
            this.showLoading();
            
            // Update active menu item
            this.updateActiveMenuItem(pageName);
            
            // Load page content
            const content = await this.getPageContent(pageName);
            
            // Update page title
            this.updatePageTitle(pageName);
            
            // Render page content
            this.renderPageContent(content, pageName);
            
            // Initialize page-specific functionality
            this.initializePage(pageName);
            
            // Update current page
            this.currentPage = pageName;
            
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showError('Failed to load page');
        }
    }

    async getPageContent(pageName) {
        // Return page content based on page name
        switch (pageName) {
            case 'dashboard':
                return this.getDashboardContent();
            case 'predict':
                return this.getPredictContent();
            case 'market':
                return this.getMarketTrendsContent();
            case 'compare':
                return this.getCompareContent();
            case 'database':
                return this.getDatabaseContent();
            case 'exports':
                return this.getExportsContent();
            case 'reports':
                return this.getReportsContent();
            case 'settings':
                return this.getSettingsContent();
            case 'help':
                return this.getHelpCenterContent();
            default:
                return this.getDashboardContent();
        }
    }

    updateActiveMenuItem(pageName) {
        // Remove active class from all menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current page menu item
        const activeItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    updatePageTitle(pageName) {
        const titleElement = document.getElementById('pageTitle');
        const titles = {
            dashboard: { title: 'Dashboard', subtitle: 'Overview of your car price prediction system' },
            predict: { title: 'Predict Price', subtitle: 'Get accurate price predictions for any vehicle' },
            market: { title: 'Market Trends', subtitle: 'Analyze market trends and price patterns' },
            compare: { title: 'Compare Vehicles', subtitle: 'Compare multiple vehicles side by side' },
            database: { title: 'Vehicle Database', subtitle: 'Browse and manage vehicle data' },
            exports: { title: 'Data Exports', subtitle: 'Export predictions and analytics data' },
            reports: { title: 'Analytics Reports', subtitle: 'Detailed reports and insights' },
            settings: { title: 'Settings', subtitle: 'Configure system preferences' },
            help: { title: 'Help Center', subtitle: 'Documentation and support resources' }
        };
        
        const pageConfig = titles[pageName] || titles.dashboard;
        titleElement.innerHTML = `
            <h1>${pageConfig.title}</h1>
            <p>${pageConfig.subtitle}</p>
        `;
    }

    renderPageContent(content, pageName) {
        const container = document.getElementById('pageContent');
        container.innerHTML = content;
        container.style.display = 'block';
    }

    initializePage(pageName) {
        // Initialize page-specific functionality
        switch (pageName) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'predict':
                this.initializePredictPage();
                break;
            case 'market':
                this.initializeMarketTrends();
                break;
            case 'compare':
                this.initializeCompare();
                break;
            case 'database':
                this.initializeDatabase();
                break;
            case 'exports':
                this.initializeExports();
                break;
            case 'reports':
                this.initializeReports();
                break;
            case 'settings':
                this.initializeSettings();
                break;
            case 'help':
                this.initializeHelpCenter();
                break;
        }
    }

    showLoading() {
        const container = document.getElementById('pageContent');
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <span>Loading page...</span>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('pageContent');
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-predict">Reload</button>
            </div>
        `;
    }

    loadInitialPage() {
        // Load page from hash or default to dashboard
        const hash = window.location.hash.substring(1);
        const page = hash || 'dashboard';
        this.loadPage(page, false);
    }

    // Page content generators
    getDashboardContent() {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon amber"><i class="fas fa-car"></i></div>
                    <div class="stat-content">
                        <h3 id="totalCars">3,540</h3>
                        <p>Vehicles Analyzed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-bullseye"></i></div>
                    <div class="stat-content">
                        <h3 id="companiesCount">33</h3>
                        <p>Car Companies</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fas fa-brain"></i></div>
                    <div class="stat-content">
                        <h3>ML</h3>
                        <p>Model Active</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fas fa-clock"></i></div>
                    <div class="stat-content">
                        <h3>API</h3>
                        <p>Backend Ready</p>
                    </div>
                </div>
            </div>

            <div class="charts-section">
                <div class="section-title">Market Overview</div>
                <div class="charts-grid">
                    <div class="chart-card">
                        <h3><span class="dot" style="background:var(--accent)"></span> Price Distribution</h3>
                        <div class="chart-wrapper">
                            <canvas id="dashboardPriceChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3><span class="dot" style="background:var(--success)"></span> Company Distribution</h3>
                        <div class="chart-wrapper">
                            <canvas id="dashboardCompanyChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-card">
                <div class="table-header">
                    <h3>Recent Predictions</h3>
                    <div class="count">Last 10</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Year</th>
                            <th>KM Driven</th>
                            <th>Predicted Price</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody id="recentPredictionsTable">
                        <tr><td colspan="5" style="text-align:center; color:var(--fg-dim);">No recent predictions</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getPredictContent() {
        return `
            <div class="two-col">
                <div class="predictor-panel">
                    <div class="panel-title"><i class="fas fa-sliders-h"></i> Configure Vehicle</div>
                    <form id="predictForm">
                        <div class="form-group">
                            <label>Company</label>
                            <select id="company" name="company" required>
                                <option value="">Select manufacturer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Model</label>
                            <select id="car_model" name="car_model" required>
                                <option value="">Select model</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Year</label>
                                <select id="year" name="year" required>
                                    <option value="">Select year</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Kilometers Driven</label>
                                <input type="number" id="kilo_driven" name="kilo_driven" placeholder="e.g. 45000" min="0" max="300000" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Fuel Type</label>
                            <select id="fuel_type" name="fuel_type" required>
                                <option value="">Select fuel type</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-predict" id="predictBtn">
                            <span class="btn-text">Predict Price</span>
                            <div class="spinner"></div>
                        </button>
                    </form>
                </div>

                <div class="prediction-result" id="predictionResult">
                    <div class="result-placeholder">
                        <i class="fas fa-car-side"></i>
                        <p>Configure a vehicle and click<br>"Predict Price" to get an estimate</p>
                    </div>
                    <div class="result-content">
                        <div class="result-label">Estimated Market Value</div>
                        <div class="result-price" id="resultPrice">-</div>
                        <div class="result-range">
                            <span id="resultDetails">-</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMarketTrendsContent() {
        return `
            <div class="charts-section">
                <div class="section-title">Market Analysis</div>
                <div class="charts-grid">
                    <div class="chart-card full-width">
                        <h3><span class="dot" style="background:var(--accent)"></span> Price Trends Over Years</h3>
                        <div class="chart-wrapper">
                            <canvas id="priceTrendsChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3><span class="dot" style="background:var(--success)"></span> Fuel Type Distribution</h3>
                        <div class="chart-wrapper">
                            <canvas id="fuelDistributionChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3><span class="dot" style="background:var(--info)"></span> Year vs Price Analysis</h3>
                        <div class="chart-wrapper">
                            <canvas id="yearPriceChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-card">
                <div class="table-header">
                    <h3>Market Insights</h3>
                    <div class="count">Live Data</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                            <th>Trend</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    <tbody id="marketInsightsTable">
                        <tr><td colspan="4" style="text-align:center; color:var(--fg-dim);">Loading market insights...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getCompareContent() {
        return `
            <div class="compare-container">
                <div class="compare-header">
                    <h3>Vehicle Comparison Tool</h3>
                    <p>Select up to 3 vehicles to compare side by side</p>
                </div>
                
                <div class="compare-vehicles">
                    <div class="vehicle-slot" id="vehicle1">
                        <div class="vehicle-card">
                            <div class="add-vehicle">
                                <i class="fas fa-plus"></i>
                                <span>Add Vehicle</span>
                            </div>
                        </div>
                    </div>
                    <div class="vehicle-slot" id="vehicle2">
                        <div class="vehicle-card">
                            <div class="add-vehicle">
                                <i class="fas fa-plus"></i>
                                <span>Add Vehicle</span>
                            </div>
                        </div>
                    </div>
                    <div class="vehicle-slot" id="vehicle3">
                        <div class="vehicle-card">
                            <div class="add-vehicle">
                                <i class="fas fa-plus"></i>
                                <span>Add Vehicle</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="comparison-results" id="comparisonResults" style="display: none;">
                    <div class="section-title">Comparison Results</div>
                    <div class="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th>Vehicle 1</th>
                                    <th>Vehicle 2</th>
                                    <th>Vehicle 3</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Company</td>
                                    <td id="comp1-company">-</td>
                                    <td id="comp2-company">-</td>
                                    <td id="comp3-company">-</td>
                                </tr>
                                <tr>
                                    <td>Model</td>
                                    <td id="comp1-model">-</td>
                                    <td id="comp2-model">-</td>
                                    <td id="comp3-model">-</td>
                                </tr>
                                <tr>
                                    <td>Year</td>
                                    <td id="comp1-year">-</td>
                                    <td id="comp2-year">-</td>
                                    <td id="comp3-year">-</td>
                                </tr>
                                <tr>
                                    <td>Predicted Price</td>
                                    <td class="price-cell" id="comp1-price">-</td>
                                    <td class="price-cell" id="comp2-price">-</td>
                                    <td class="price-cell" id="comp3-price">-</td>
                                </tr>
                                <tr>
                                    <td>Value Score</td>
                                    <td id="comp1-score">-</td>
                                    <td id="comp2-score">-</td>
                                    <td id="comp3-score">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getDatabaseContent() {
        return `
            <div class="database-container">
                <div class="database-header">
                    <div class="database-controls">
                        <div class="search-box">
                            <input type="text" id="databaseSearch" placeholder="Search vehicles...">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="filter-controls">
                            <select id="companyFilter">
                                <option value="">All Companies</option>
                            </select>
                            <select id="yearFilter">
                                <option value="">All Years</option>
                            </select>
                            <select id="fuelFilter">
                                <option value="">All Fuel Types</option>
                            </select>
                        </div>
                        <button class="btn-predict" onclick="window.pageRouter.loadDatabaseData()">Refresh</button>
                    </div>
                </div>

                <div class="table-card">
                    <div class="table-header">
                        <h3>Vehicle Database</h3>
                        <div class="count" id="recordCount">Loading...</div>
                    </div>
                    <div class="table-wrapper" style="max-height: 600px; overflow-y: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Model</th>
                                    <th>Year</th>
                                    <th>KM Driven</th>
                                    <th>Fuel Type</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="databaseTableBody">
                                <tr><td colspan="7" style="text-align:center; color:var(--fg-dim);">Loading database...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getExportsContent() {
        return `
            <div class="exports-container">
                <div class="exports-header">
                    <h3>Data Export Center</h3>
                    <p>Export your predictions and analytics data in various formats</p>
                </div>

                <div class="export-options">
                    <div class="export-card">
                        <div class="export-icon">
                            <i class="fas fa-file-csv"></i>
                        </div>
                        <div class="export-content">
                            <h4>Export Predictions</h4>
                            <p>Download all prediction history as CSV</p>
                            <button class="btn-predict" onclick="exportPredictions('csv')">Export CSV</button>
                        </div>
                    </div>

                    <div class="export-card">
                        <div class="export-icon">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <div class="export-content">
                            <h4>Export Analytics</h4>
                            <p>Download market analytics as Excel</p>
                            <button class="btn-predict" onclick="exportAnalytics('excel')">Export Excel</button>
                        </div>
                    </div>

                    <div class="export-card">
                        <div class="export-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="export-content">
                            <h4>Generate Report</h4>
                            <p>Create PDF report with insights</p>
                            <button class="btn-predict" onclick="generateReport('pdf')">Generate PDF</button>
                        </div>
                    </div>

                    <div class="export-card">
                        <div class="export-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="export-content">
                            <h4>Export API Data</h4>
                            <p>Export raw data as JSON</p>
                            <button class="btn-predict" onclick="exportData('json')">Export JSON</button>
                        </div>
                    </div>
                </div>

                <div class="export-history">
                    <div class="section-title">Export History</div>
                    <div class="table-card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Format</th>
                                    <th>Records</th>
                                    <th>Status</th>
                                    <th>Download</th>
                                </tr>
                            </thead>
                            <tbody id="exportHistoryTable">
                                <tr><td colspan="6" style="text-align:center; color:var(--fg-dim);">No export history</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getReportsContent() {
        return `
            <div class="reports-container">
                <div class="reports-header">
                    <h3>Analytics Reports</h3>
                    <div class="report-filters">
                        <select id="reportPeriod">
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last Year</option>
                        </select>
                        <button class="btn-predict" onclick="refreshReports()">Refresh</button>
                    </div>
                </div>

                <div class="reports-grid">
                    <div class="report-card">
                        <div class="report-header">
                            <h4>Prediction Accuracy</h4>
                            <span class="report-badge success">High</span>
                        </div>
                        <div class="report-metric">
                            <div class="metric-value" id="reportAccuracyValue">0%</div>
                            <div class="metric-change positive" id="reportAccuracyChange">No activity</div>
                        </div>
                        <div class="report-chart">
                            <canvas id="accuracyChart"></canvas>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-header">
                            <h4>Total Predictions</h4>
                            <span class="report-badge info">Active</span>
                        </div>
                        <div class="report-metric">
                            <div class="metric-value" id="reportPredictionsValue">0</div>
                            <div class="metric-change positive" id="reportPredictionsChange">No activity</div>
                        </div>
                        <div class="report-chart">
                            <canvas id="predictionsChart"></canvas>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-header">
                            <h4>Avg. Response Time</h4>
                            <span class="report-badge success">Fast</span>
                        </div>
                        <div class="report-metric">
                            <div class="metric-value" id="reportResponseValue">0.00s</div>
                            <div class="metric-change negative" id="reportResponseChange">No activity</div>
                        </div>
                        <div class="report-chart">
                            <canvas id="responseChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="table-card">
                    <div class="table-header">
                        <h3>Detailed Analytics</h3>
                        <div class="count">Live Data</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Current</th>
                                <th>Previous</th>
                                <th>Change</th>
                                <th>Trend</th>
                            </tr>
                        </thead>
                        <tbody id="reportsDetailTable">
                            <tr><td colspan="5" style="text-align:center; color:var(--fg-dim);">Loading report metrics...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    getSettingsContent() {
        return `
            <div class="settings-container">
                <div class="settings-header">
                    <h3>System Settings</h3>
                    <p>Configure your prediction system preferences</p>
                </div>

                <div class="settings-grid">
                    <div class="settings-section">
                        <h4><i class="fas fa-cog"></i> General Settings</h4>
                        <div class="setting-item">
                            <label>Default Currency</label>
                            <select id="defaultCurrency">
                                <option value="INR">Indian Rupee (INR)</option>
                                <option value="USD">US Dollar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label>Date Format</label>
                            <select id="dateFormat">
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label>Time Zone</label>
                            <select id="timeZone">
                                <option value="IST">Indian Standard Time</option>
                                <option value="UTC">UTC</option>
                                <option value="EST">Eastern Time</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4><i class="fas fa-chart-line"></i> Prediction Settings</h4>
                        <div class="setting-item">
                            <label>Confidence Threshold</label>
                            <input type="range" id="confidenceThreshold" min="70" max="95" value="85">
                            <span class="setting-value">85%</span>
                        </div>
                        <div class="setting-item">
                            <label>Price Range Tolerance</label>
                            <input type="range" id="priceTolerance" min="5" max="20" value="10">
                            <span class="setting-value">10%</span>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="enableAutoSave" checked>
                                Auto-save predictions
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4><i class="fas fa-bell"></i> Notification Settings</h4>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="emailNotifications" checked>
                                Email notifications
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="systemAlerts" checked>
                                System alerts
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="weeklyReports">
                                Weekly reports
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4><i class="fas fa-shield-alt"></i> Security Settings</h4>
                        <div class="setting-item">
                            <label>Session Timeout (minutes)</label>
                            <input type="number" id="sessionTimeout" value="30" min="5" max="120">
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="twoFactorAuth">
                                Enable two-factor authentication
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="apiRateLimit" checked>
                                API rate limiting
                            </label>
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button class="btn-predict" onclick="saveSettings()">Save Settings</button>
                    <button class="btn-predict" style="background: var(--danger);" onclick="resetSettings()">Reset to Default</button>
                </div>
            </div>
        `;
    }

    getHelpCenterContent() {
        return `
            <div class="help-container">
                <div class="help-header">
                    <h3>Help Center</h3>
                    <div class="help-search">
                        <input type="text" id="helpSearch" placeholder="Search for help...">
                        <i class="fas fa-search"></i>
                    </div>
                </div>

                <div class="help-grid">
                    <div class="help-section">
                        <h4><i class="fas fa-book"></i> Getting Started</h4>
                        <div class="help-links">
                            <a href="#" class="help-link">
                                <i class="fas fa-play-circle"></i>
                                <span>Quick Start Guide</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-video"></i>
                                <span>Video Tutorials</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-map"></i>
                                <span>Feature Overview</span>
                            </a>
                        </div>
                    </div>

                    <div class="help-section">
                        <h4><i class="fas fa-calculator"></i> Prediction Guide</h4>
                        <div class="help-links">
                            <a href="#" class="help-link">
                                <i class="fas fa-question-circle"></i>
                                <span>How to Predict Prices</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-chart-line"></i>
                                <span>Understanding Results</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-exchange-alt"></i>
                                <span>Comparing Vehicles</span>
                            </a>
                        </div>
                    </div>

                    <div class="help-section">
                        <h4><i class="fas fa-database"></i> Data Management</h4>
                        <div class="help-links">
                            <a href="#" class="help-link">
                                <i class="fas fa-upload"></i>
                                <span>Importing Data</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-download"></i>
                                <span>Exporting Results</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-filter"></i>
                                <span>Filtering & Search</span>
                            </a>
                        </div>
                    </div>

                    <div class="help-section">
                        <h4><i class="fas fa-cog"></i> Troubleshooting</h4>
                        <div class="help-links">
                            <a href="#" class="help-link">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Common Issues</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-tools"></i>
                                <span>System Diagnostics</span>
                            </a>
                            <a href="#" class="help-link">
                                <i class="fas fa-sync"></i>
                                <span>Reset Procedures</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="faq-section">
                    <div class="section-title">Frequently Asked Questions</div>
                    <div class="faq-list">
                        <div class="faq-item">
                            <div class="faq-question">
                                <i class="fas fa-chevron-right"></i>
                                <span>How accurate are the price predictions?</span>
                            </div>
                            <div class="faq-answer">
                                <p>Our ML model achieves 95% accuracy on historical data. Predictions are based on market trends, vehicle condition, and various other factors.</p>
                            </div>
                        </div>
                        <div class="faq-item">
                            <div class="faq-question">
                                <i class="fas fa-chevron-right"></i>
                                <span>What data sources are used for predictions?</span>
                            </div>
                            <div class="faq-answer">
                                <p>We use a comprehensive dataset of 3,540 vehicles across 33 manufacturers, updated regularly with market data.</p>
                            </div>
                        </div>
                        <div class="faq-item">
                            <div class="faq-question">
                                <i class="fas fa-chevron-right"></i>
                                <span>Can I export prediction data?</span>
                            </div>
                            <div class="faq-answer">
                                <p>Yes, you can export predictions in CSV, Excel, PDF, and JSON formats through the Exports page.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="contact-section">
                    <div class="section-title">Need More Help?</div>
                    <div class="contact-options">
                        <div class="contact-card">
                            <i class="fas fa-envelope"></i>
                            <h4>Email Support</h4>
                            <p>support@carpricepredictor.com</p>
                            <button class="btn-predict">Send Email</button>
                        </div>
                        <div class="contact-card">
                            <i class="fas fa-comments"></i>
                            <h4>Live Chat</h4>
                            <p>Available 9 AM - 6 PM IST</p>
                            <button class="btn-predict">Start Chat</button>
                        </div>
                        <div class="contact-card">
                            <i class="fas fa-phone"></i>
                            <h4>Phone Support</h4>
                            <p>+91 98765 43210</p>
                            <button class="btn-predict">Call Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Page initialization methods
    initializeDashboard() {
        // Initialize charts with real data
        if (window.chartsManager) {
            window.chartsManager.initializeDashboardCharts();
        }
        this.loadRecentPredictions();
        this.updateDashboardStats();
    }

    initializePredictPage() {
        if (window.carPricePredictor) {
            window.carPricePredictor.loadInitialData();
            window.carPricePredictor.setupEventListeners();
        }
    }

    initializeMarketTrends() {
        // Initialize market trends charts with real data
        if (window.chartsManager) {
            window.chartsManager.initializeMarketTrendsCharts();
        }
        this.loadMarketInsights();
    }

    initializeCompare() {
        this.setupComparisonTool();
    }

    initializeDatabase() {
        this.loadDatabaseData();
        this.setupDatabaseFilters();
    }

    initializeExports() {
        this.loadExportHistory();
    }

    initializeReports() {
        // Initialize reports charts with real data
        if (window.chartsManager) {
            window.chartsManager.initializeReportsCharts();
        }
        this.loadReportsData();
    }

    initializeSettings() {
        this.loadSettingsValues();
        this.setupSettingsHandlers();
    }

    initializeHelpCenter() {
        this.setupFAQHandlers();
        this.setupHelpSearch();
    }

    // Additional helper methods for page-specific functionality
    async updateDashboardStats() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            const stats = await response.json();
            
            // Update dashboard stats with real data
            const totalCarsElement = document.getElementById('totalCars');
            const companiesCountElement = document.getElementById('companiesCount');
            
            const totalVehicles = stats.total_cars ?? stats.total_vehicles ?? 0;
            if (totalCarsElement) totalCarsElement.textContent = totalVehicles.toLocaleString();
            if (companiesCountElement) companiesCountElement.textContent = stats.companies;
        } catch (error) {
            console.error('Failed to update dashboard stats:', error);
        }
    }

    loadRecentPredictions() {
        const tbody = document.getElementById('recentPredictionsTable');
        if (!tbody) return;

        fetch(`${this.apiBase}/predictions/recent?limit=10`)
            .then(response => response.json())
            .then(data => {
                const recentPredictions = data.predictions || [];
                if (!recentPredictions.length) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--fg-dim);">No recent predictions</td></tr>';
                    return;
                }

                tbody.innerHTML = recentPredictions.map(pred => `
                    <tr>
                        <td>${pred.company} ${pred.model}</td>
                        <td>${pred.year}</td>
                        <td>${Number(pred.kilometers).toLocaleString()}</td>
                        <td class="price-cell">${pred.predicted_price}</td>
                        <td><span class="confidence-badge high">${pred.confidence || 0}%</span></td>
                    </tr>
                `).join('');
            })
            .catch((error) => {
                console.error('Failed to load recent predictions:', error);
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--fg-dim);">Unable to load predictions.</td></tr>';
            });
    }

    async loadMarketInsights() {
        try {
            const response = await fetch(`${this.apiBase}/analytics/overview`);
            const analytics = await response.json();
            const tbody = document.getElementById('marketInsightsTable');
            if (!tbody) return;

            tbody.innerHTML = (analytics.market_insights || []).map(item => `
                <tr>
                    <td>${item.metric}</td>
                    <td class="price-cell">${item.value}</td>
                    <td><span class="confidence-badge medium">${item.trend}</span></td>
                    <td>${item.change}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load market insights:', error);
        }
    }

    setupComparisonTool() {
        const vehicleSlots = document.querySelectorAll('.vehicle-slot');
        let selectedVehicles = [];
        
        vehicleSlots.forEach((slot, index) => {
            const card = slot.querySelector('.vehicle-card');
            if (card) {
                card.addEventListener('click', () => {
                    this.openVehicleSelector(index);
                });
            }
        });
    }

    openVehicleSelector(slotIndex) {
        // Create a simple vehicle selector modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Select Vehicle for Comparison</h3>
                <div class="vehicle-selector">
                    <select id="compare-company">
                        <option value="">Select Company</option>
                    </select>
                    <select id="compare-model">
                        <option value="">Select Model</option>
                    </select>
                    <select id="compare-year">
                        <option value="">Select Year</option>
                    </select>
                    <input type="number" id="compare-km" placeholder="Kilometers">
                    <select id="compare-fuel">
                        <option value="">Select Fuel Type</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-predict" onclick="window.pageRouter.selectVehicle(${slotIndex})">Select</button>
                    <button class="btn-predict" style="background: var(--danger);" onclick="window.pageRouter.closeModal()">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.loadComparisonData();
    }

    async loadComparisonData() {
        try {
            // Load companies
            const companiesResponse = await fetch(`${this.apiBase}/companies`);
            const companiesData = await companiesResponse.json();
            const companySelect = document.getElementById('compare-company');
            if (companySelect) {
                companiesData.companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company;
                    option.textContent = company;
                    companySelect.appendChild(option);
                });
                companySelect.addEventListener('change', (event) => {
                    this.loadComparisonModels(event.target.value);
                });
            }
            
            // Load years and fuel types
            const yearsResponse = await fetch(`${this.apiBase}/years`);
            const yearsData = await yearsResponse.json();
            const yearSelect = document.getElementById('compare-year');
            if (yearSelect) {
                yearsData.years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });
            }
            
            const fuelResponse = await fetch(`${this.apiBase}/fuel_types`);
            const fuelData = await fuelResponse.json();
            const fuelSelect = document.getElementById('compare-fuel');
            if (fuelSelect) {
                fuelData.fuel_types.forEach(fuel => {
                    const option = document.createElement('option');
                    option.value = fuel;
                    option.textContent = fuel;
                    fuelSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load comparison data:', error);
        }
    }

    async loadComparisonModels(company) {
        const modelSelect = document.getElementById('compare-model');
        if (!modelSelect) return;

        modelSelect.innerHTML = '<option value="">Select Model</option>';
        if (!company) return;

        try {
            const response = await fetch(`${this.apiBase}/models?company=${encodeURIComponent(company)}`);
            const data = await response.json();
            (data.models || []).forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load comparison models:', error);
        }
    }

    selectVehicle(slotIndex) {
        const company = document.getElementById('compare-company')?.value || '';
        const model = document.getElementById('compare-model')?.value || '';
        const year = document.getElementById('compare-year')?.value || '';
        const km = document.getElementById('compare-km')?.value || '';
        const fuel = document.getElementById('compare-fuel')?.value || '';

        if (!company || !model || !year || !km || !fuel) {
            if (typeof showToast === 'function') {
                showToast('Please complete all vehicle details before comparing.', 'error');
            }
            return;
        }

        this.selectedVehicles[slotIndex] = { company, model, year, km, fuel };
        this.renderVehicleSelection(slotIndex);
        this.closeModal();
    }

    renderVehicleSelection(slotIndex) {
        const vehicle = this.selectedVehicles[slotIndex];
        const slot = document.getElementById(`vehicle${slotIndex + 1}`);
        const results = document.getElementById('comparisonResults');

        if (!vehicle || !slot) return;

        slot.innerHTML = `
            <div class="vehicle-card">
                <div>
                    <h4>${vehicle.company}</h4>
                    <p>${vehicle.model}</p>
                    <p>${vehicle.year} • ${Number(vehicle.km).toLocaleString()} km</p>
                    <p>${vehicle.fuel}</p>
                </div>
            </div>
        `;

        const predictionTarget = document.getElementById(`comp${slotIndex + 1}-price`);
        document.getElementById(`comp${slotIndex + 1}-company`).textContent = vehicle.company;
        document.getElementById(`comp${slotIndex + 1}-model`).textContent = vehicle.model;
        document.getElementById(`comp${slotIndex + 1}-year`).textContent = vehicle.year;
        document.getElementById(`comp${slotIndex + 1}-score`).textContent = 'Pending';
        if (predictionTarget) predictionTarget.textContent = 'Loading...';
        if (results) results.style.display = 'block';

        this.fetchComparisonPrediction(slotIndex, vehicle);
        slot.querySelector('.vehicle-card')?.addEventListener('click', () => this.openVehicleSelector(slotIndex));
    }

    async fetchComparisonPrediction(slotIndex, vehicle) {
        try {
            const response = await fetch(`${this.apiBase}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company: vehicle.company,
                    car_model: vehicle.model,
                    year: vehicle.year,
                    kilo_driven: vehicle.km,
                    fuel_type: vehicle.fuel,
                }),
            });
            const result = await response.json();
            const score = result.recent_entry?.confidence
                ? `${result.recent_entry.confidence}%`
                : (result.match_type ? String(result.match_type).replace(/_/g, ' ') : 'Ready');

            document.getElementById(`comp${slotIndex + 1}-price`).textContent =
                result.predicted_price || 'Unavailable';
            document.getElementById(`comp${slotIndex + 1}-score`).textContent =
                result.success ? score : 'Error';
        } catch (error) {
            console.error('Failed to fetch comparison prediction:', error);
            document.getElementById(`comp${slotIndex + 1}-price`).textContent = 'Unavailable';
            document.getElementById(`comp${slotIndex + 1}-score`).textContent = 'Error';
        }
    }

    closeModal() {
        document.querySelector('.modal')?.remove();
    }

    async loadDatabaseData() {
        try {
            const response = await fetch(`${this.apiBase}/dataset`);
            if (!response.ok) {
                throw new Error(`Dataset request failed with status ${response.status}`);
            }
            const data = await response.json();
            const records = Array.isArray(data.records)
                ? data.records
                : Array.isArray(data.sample)
                    ? data.sample
                    : [];

            this.databaseRecords = records;
            this.filteredDatabaseRecords = [...this.databaseRecords];
            this.populateDatabaseFilters();
            this.renderDatabaseRows(this.filteredDatabaseRecords);
        } catch (error) {
            console.error('Failed to load database data:', error);
            this.databaseRecords = [];
            this.filteredDatabaseRecords = [];
            this.renderDatabaseRows([]);
        }
    }

    setupDatabaseFilters() {
        const searchInput = document.getElementById('databaseSearch');
        const companyFilter = document.getElementById('companyFilter');
        const yearFilter = document.getElementById('yearFilter');
        const fuelFilter = document.getElementById('fuelFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterDatabase());
        }
        if (companyFilter) {
            companyFilter.addEventListener('change', () => this.filterDatabase());
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', () => this.filterDatabase());
        }
        if (fuelFilter) {
            fuelFilter.addEventListener('change', () => this.filterDatabase());
        }
    }

    filterDatabase() {
        const searchTerm = (document.getElementById('databaseSearch')?.value || '').trim().toLowerCase();
        const company = document.getElementById('companyFilter')?.value || '';
        const year = document.getElementById('yearFilter')?.value || '';
        const fuel = document.getElementById('fuelFilter')?.value || '';

        this.filteredDatabaseRecords = this.databaseRecords.filter((item) => {
            const matchesSearch = !searchTerm || [
                item.company,
                item.name,
                item.fuel_type,
                String(item.year),
            ].some(value => String(value).toLowerCase().includes(searchTerm));

            const matchesCompany = !company || item.company === company;
            const matchesYear = !year || String(item.year) === String(year);
            const matchesFuel = !fuel || item.fuel_type === fuel;

            return matchesSearch && matchesCompany && matchesYear && matchesFuel;
        });

        this.renderDatabaseRows(this.filteredDatabaseRecords);
    }

    populateDatabaseFilters() {
        const companyFilter = document.getElementById('companyFilter');
        const yearFilter = document.getElementById('yearFilter');
        const fuelFilter = document.getElementById('fuelFilter');

        if (companyFilter) {
            companyFilter.innerHTML = '<option value="">All Companies</option>';
            [...new Set(this.databaseRecords.map(item => item.company))].sort().forEach(company => {
                const option = document.createElement('option');
                option.value = company;
                option.textContent = company;
                companyFilter.appendChild(option);
            });
        }

        if (yearFilter) {
            yearFilter.innerHTML = '<option value="">All Years</option>';
            [...new Set(this.databaseRecords.map(item => item.year))].sort((a, b) => b - a).forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            });
        }

        if (fuelFilter) {
            fuelFilter.innerHTML = '<option value="">All Fuel Types</option>';
            [...new Set(this.databaseRecords.map(item => item.fuel_type))].sort().forEach(fuel => {
                const option = document.createElement('option');
                option.value = fuel;
                option.textContent = fuel;
                fuelFilter.appendChild(option);
            });
        }
    }

    renderDatabaseRows(records) {
        const tbody = document.getElementById('databaseTableBody');
        if (!tbody) return;

        if (!records.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--fg-dim);">No vehicles match the current filters.</td></tr>';
        } else {
            tbody.innerHTML = records.map(item => `
                <tr>
                    <td>${item.company}</td>
                    <td>${item.name}</td>
                    <td>${item.year}</td>
                    <td>${Number(item.kms_driven).toLocaleString()}</td>
                    <td>${item.fuel_type}</td>
                    <td class="price-cell">Rs ${(Number(item.Price) / 100000).toFixed(1)}L</td>
                    <td>
                        <button
                            class="btn-predict database-predict-btn"
                            style="padding: 6px 12px; font-size: 11px;"
                            data-company="${this.escapeAttribute(item.company)}"
                            data-model="${this.escapeAttribute(item.name)}"
                            data-year="${item.year}"
                            data-km="${item.kms_driven}"
                            data-fuel="${this.escapeAttribute(item.fuel_type)}"
                        >
                            Predict
                        </button>
                    </td>
                </tr>
            `).join('');
            this.attachDatabasePredictionButtons();
        }

        const countElement = document.getElementById('recordCount');
        if (countElement) {
            countElement.textContent = `${records.length} of ${this.databaseRecords.length} records`;
        }
    }

    attachDatabasePredictionButtons() {
        document.querySelectorAll('.database-predict-btn').forEach((button) => {
            button.addEventListener('click', () => {
                predictFromDatabase(
                    button.dataset.company || '',
                    button.dataset.model || '',
                    button.dataset.year || '',
                    button.dataset.km || '',
                    button.dataset.fuel || '',
                );
            });
        });
    }

    escapeAttribute(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    loadExportHistory() {
        const tbody = document.getElementById('exportHistoryTable');
        if (tbody) {
            const exportHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]');
            if (!exportHistory.length) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--fg-dim);">No export history</td></tr>';
                return;
            }

            tbody.innerHTML = exportHistory.map(item => `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.type}</td>
                    <td>${item.format}</td>
                    <td>${item.records}</td>
                    <td><span class="confidence-badge high">${item.status}</span></td>
                    <td><button class="btn-predict" style="padding: 4px 8px; font-size: 10px;" disabled>Saved</button></td>
                </tr>
            `).join('');
        }
    }

    async loadReportsData() {
        try {
            const response = await fetch(`${this.apiBase}/analytics/overview`);
            const analytics = await response.json();
            const summary = analytics.summary || {};
            const details = analytics.report_metrics || [];

            const accuracyValue = document.getElementById('reportAccuracyValue');
            const accuracyChange = document.getElementById('reportAccuracyChange');
            const predictionsValue = document.getElementById('reportPredictionsValue');
            const predictionsChange = document.getElementById('reportPredictionsChange');
            const responseValue = document.getElementById('reportResponseValue');
            const responseChange = document.getElementById('reportResponseChange');
            const detailsTable = document.getElementById('reportsDetailTable');

            if (accuracyValue) accuracyValue.textContent = `${(summary.exact_match_rate || 0).toFixed(1)}%`;
            if (accuracyChange) accuracyChange.textContent = `${summary.recent_predictions || 0} recent checks`;
            if (predictionsValue) predictionsValue.textContent = String(summary.recent_predictions || 0);
            if (predictionsChange) predictionsChange.textContent = `${summary.total_cars || 0} cars in dataset`;
            if (responseValue) responseValue.textContent = `${((summary.avg_response_time_ms || 0) / 1000).toFixed(2)}s`;
            if (responseChange) responseChange.textContent = 'Live API timing';

            if (detailsTable) {
                detailsTable.innerHTML = details.map(item => `
                    <tr>
                        <td>${item.metric}</td>
                        <td>${item.current}</td>
                        <td>${item.previous}</td>
                        <td>${item.change}</td>
                        <td><span class="confidence-badge high">${item.trend}</span></td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load reports data:', error);
        }
    }

    loadSettingsValues() {
        // Load settings from localStorage
        const saved = localStorage.getItem('carPredictorSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            
            // Apply saved settings
            Object.keys(settings).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = settings[key];
                    } else {
                        element.value = settings[key];
                    }
                }
            });
        }
        
        // Setup range slider value displays
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            const valueDisplay = input.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('setting-value')) {
                input.addEventListener('input', () => {
                    valueDisplay.textContent = input.value + (input.id.includes('Threshold') ? '%' : '%');
                });
            }
        });
    }

    setupSettingsHandlers() {
        // Settings handlers are already implemented in utils.js
        console.log('Settings handlers setup complete');
    }

    setupFAQHandlers() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all FAQ items
                    faqItems.forEach(faqItem => {
                        faqItem.classList.remove('active');
                    });
                    
                    // Open clicked item if it wasn't active
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    setupHelpSearch() {
        const searchInput = document.getElementById('helpSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const helpLinks = document.querySelectorAll('.help-link');
                
                helpLinks.forEach(link => {
                    const text = link.textContent.toLowerCase();
                    const parentSection = link.closest('.help-section');
                    
                    if (text.includes(searchTerm) || searchTerm === '') {
                        parentSection.style.display = 'block';
                    } else {
                        parentSection.style.display = 'none';
                    }
                });
            });
        }
    }

}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pageRouter = new PageRouter();
});
