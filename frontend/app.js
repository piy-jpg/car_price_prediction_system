// Car Price Predictor Frontend Application
class CarPricePredictor {
    constructor() {
        this.apiBase = '/api';
        this.handleCompanyChange = this.handleCompanyChange.bind(this);
        this.handlePredictionSubmit = this.handlePrediction.bind(this);
        this.initialDataPromise = null;
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.loadInitialData();
            this.setupEventListeners();
            this.showAppReady();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load application data');
        }
    }

    async loadInitialData() {
        if (!this.initialDataPromise) {
            this.initialDataPromise = (async () => {
                const [companiesResponse, yearsResponse, fuelResponse] = await Promise.all([
                    fetch(`${this.apiBase}/companies`),
                    fetch(`${this.apiBase}/years`),
                    fetch(`${this.apiBase}/fuel_types`)
                ]);

                const [companiesData, yearsData, fuelData] = await Promise.all([
                    companiesResponse.json(),
                    yearsResponse.json(),
                    fuelResponse.json()
                ]);

                this.populateSelect('company', companiesData.companies || []);
                this.populateSelect('year', yearsData.years || []);
                this.populateSelect('fuel_type', fuelData.fuel_types || []);
                this.resetModelSelect();
            })().catch((error) => {
                this.initialDataPromise = null;
                throw error;
            });
        }

        await this.initialDataPromise;
    }

    populateSelect(elementId, options) {
        const select = document.getElementById(elementId);
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    setupEventListeners() {
        const companySelect = document.getElementById('company');
        if (companySelect) {
            companySelect.removeEventListener('change', this.handleCompanyChange);
            companySelect.addEventListener('change', this.handleCompanyChange);
        }

        const form = document.getElementById('predictForm');
        if (form) {
            form.removeEventListener('submit', this.handlePredictionSubmit);
            form.addEventListener('submit', this.handlePredictionSubmit);
        }
    }

    handleCompanyChange(event) {
        this.loadModels(event.target.value);
    }

    resetModelSelect(message = 'Select model') {
        const modelSelect = document.getElementById('car_model');
        if (!modelSelect) return;

        modelSelect.innerHTML = `<option value="">${message}</option>`;
        modelSelect.disabled = true;
    }

    async loadModels(company) {
        const modelSelect = document.getElementById('car_model');
        if (!modelSelect) return [];

        if (!company) {
            this.resetModelSelect();
            return [];
        }

        this.resetModelSelect('Loading models...');

        try {
            const response = await fetch(`${this.apiBase}/models?company=${encodeURIComponent(company)}`);
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const data = await response.json();
            const models = Array.isArray(data.models) ? data.models : [];

            this.resetModelSelect(models.length ? 'Select model' : 'No models available');
            this.populateSelect('car_model', models);
            modelSelect.disabled = models.length === 0;
            return models;
        } catch (error) {
            console.error('Failed to load models:', error);
            this.resetModelSelect('Unable to load models');
            this.showError('Failed to load models for the selected company');
            return [];
        }
    }

    async handlePrediction(event) {
        event.preventDefault();
        
        const form = event.target;
        const btn = form.querySelector('.btn-predict');
        if (!btn) return;
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        
        // Show loading state
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        btn.disabled = true;
        
        try {
            const formData = new FormData(event.target);
            const data = {
                company: formData.get('company'),
                car_model: formData.get('car_model'),
                year: formData.get('year'),
                kilo_driven: formData.get('kilo_driven'),
                fuel_type: formData.get('fuel_type')
            };

            const response = await fetch(`${this.apiBase}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                this.storeRecentPrediction(result);
                this.showResult(result);
            } else {
                this.showError(result.error || 'Prediction failed');
            }
            
        } catch (error) {
            console.error('Prediction error:', error);
            this.showError('Failed to connect to prediction service');
        } finally {
            // Hide loading state
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            btn.disabled = false;
        }
    }

    showResult(result) {
        const resultCard = document.getElementById('predictionResult');
        const priceDisplay = document.getElementById('resultPrice');
        const priceDescription = document.getElementById('resultDetails');
        const placeholder = resultCard ? resultCard.querySelector('.result-placeholder') : null;
        const content = resultCard ? resultCard.querySelector('.result-content') : null;
        const confidence = result.recent_entry?.confidence;
        const matchType = String(result.match_type || 'estimate').replace(/_/g, ' ');
        
        if (priceDisplay) {
            priceDisplay.textContent = result.predicted_price;
        }
        if (priceDescription) {
            priceDescription.textContent = confidence
                ? `Estimated market value: ${result.actual_price} • ${confidence}% confidence • ${matchType}`
                : `Estimated market value: ${result.actual_price}`;
        }
        
        if (resultCard) {
            resultCard.classList.add('has-result');
            if (placeholder) placeholder.style.display = '';
            if (content) content.style.display = '';
            resultCard.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showError(message) {
        // Create or update error display
        let errorDiv = document.getElementById('errorDisplay');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorDisplay';
            errorDiv.className = 'alert alert-danger';
            errorDiv.style.marginTop = '20px';
            const form = document.getElementById('predictForm');
            if (form) {
                form.parentNode.insertBefore(errorDiv, form.nextSibling);
            }
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    showAppReady() {
        console.log('Car Price Predictor frontend ready!');
        // Hide any loading indicators
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.style.display = 'none');
    }

    storeRecentPrediction(result) {
        const entry = result.recent_entry || {
            timestamp: new Date().toISOString(),
            company: result.input_data.company,
            model: result.input_data.model,
            year: result.input_data.year,
            kilometers: result.input_data.kilometers_driven,
            fuel_type: result.input_data.fuel_type,
            predicted_price: result.predicted_price,
            actual_price: result.actual_price,
            confidence: 95,
            match_type: result.match_type || 'fallback',
        };

        const existing = JSON.parse(localStorage.getItem('recentPredictions') || '[]');
        existing.unshift(entry);
        localStorage.setItem('recentPredictions', JSON.stringify(existing.slice(0, 25)));
    }
}

class MobileNavigation {
    constructor() {
        this.breakpoint = window.matchMedia('(max-width: 768px)');
        this.body = document.body;
        this.toggleButton = document.getElementById('menuToggle');
        this.backdrop = document.getElementById('sidebarBackdrop');
        this.sidebar = document.getElementById('sidebarNav');
        this.isOpen = false;
        this.initialize();
    }

    initialize() {
        if (!this.toggleButton || !this.sidebar || !this.backdrop) return;

        this.toggleButton.addEventListener('click', () => this.toggle());
        this.backdrop.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });

        document.addEventListener('click', (event) => {
            if (!this.breakpoint.matches || !this.isOpen) return;
            if (this.sidebar.contains(event.target) || this.toggleButton.contains(event.target)) return;
            this.close();
        });

        this.breakpoint.addEventListener('change', (event) => {
            if (!event.matches) {
                this.close({ force: true });
            }
        });
    }

    open() {
        if (!this.breakpoint.matches) return;
        this.isOpen = true;
        this.body.classList.add('nav-open');
        this.body.style.overflow = 'hidden';
        this.toggleButton.setAttribute('aria-expanded', 'true');
        this.toggleButton.setAttribute('aria-label', 'Close navigation menu');
    }

    close({ force = false } = {}) {
        if (!this.isOpen && !force) return;
        this.isOpen = false;
        this.body.classList.remove('nav-open');
        this.body.style.overflow = '';
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.toggleButton.setAttribute('aria-label', 'Open navigation menu');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileNavigation = new MobileNavigation();
    window.carPricePredictor = new CarPricePredictor();
});

// Utility functions for charts and analytics
class AnalyticsCharts {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.charts = {};
    }

    async initializeCharts() {
        try {
            await this.loadDatasetStats();
            this.createPriceDistributionChart();
            this.createBrandDistributionChart();
        } catch (error) {
            console.error('Failed to initialize charts:', error);
        }
    }

    async loadDatasetStats() {
        const response = await fetch(`${this.apiBase}/stats`);
        this.stats = await response.json();
    }

    createPriceDistributionChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        // Sample price distribution data
        const data = {
            labels: ['<2L', '2-4L', '4-6L', '6-8L', '8-10L', '10L+'],
            datasets: [{
                label: 'Number of Cars',
                data: [450, 680, 520, 380, 290, 150],
                backgroundColor: 'rgba(255, 107, 53, 0.6)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 1
            }]
        };

        this.charts.priceChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
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

    createBrandDistributionChart() {
        const ctx = document.getElementById('brandChart');
        if (!ctx) return;

        const data = {
            labels: ['Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Others'],
            datasets: [{
                data: [35, 20, 15, 10, 8, 12],
                backgroundColor: [
                    '#FF6B35',
                    '#F7931E',
                    '#FFD23F',
                    '#6BCF7F',
                    '#4A90E2',
                    '#9B59B6'
                ]
            }]
        };

        this.charts.brandChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#eee' }
                    }
                }
            }
        });
    }
}

// Initialize charts when Chart.js is loaded
if (typeof Chart !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new AnalyticsCharts('/api').initializeCharts();
    });
}
