// Utility functions for Car Price Predictor Dashboard

// Toast notification system
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
}

function rememberExport(type, format, records) {
    const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
    history.unshift({
        date: new Date().toLocaleDateString(),
        type,
        format: format.toUpperCase(),
        records: String(records),
        status: 'Completed',
    });
    localStorage.setItem('exportHistory', JSON.stringify(history.slice(0, 10)));
}

function convertRowsToCsv(rows) {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escapeValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    return [headers.join(','), ...rows.map(row => headers.map(header => escapeValue(row[header])).join(','))].join('\n');
}

// Export functions
async function exportPredictions(format) {
    try {
        showToast(`Exporting predictions as ${format.toUpperCase()}...`, 'success');
        const data = await fetchJson('/api/predictions/recent?limit=50');
        const predictions = data.predictions || [];
        const exportData = format === 'csv' ? convertRowsToCsv(predictions) : predictions;
        downloadFile(exportData, `predictions.${format === 'excel' ? 'csv' : format}`, format === 'excel' ? 'csv' : format);
        rememberExport('Predictions', format, predictions.length);
        showToast('Export completed successfully!', 'success');
    } catch (error) {
        console.error('Failed to export predictions:', error);
        showToast('Failed to export predictions', 'error');
    }
}

async function exportAnalytics(format) {
    try {
        showToast(`Exporting analytics as ${format.toUpperCase()}...`, 'success');
        const analytics = await fetchJson('/api/analytics/overview');
        const exportData = format === 'excel' ? convertRowsToCsv(analytics.market_insights || []) : analytics;
        downloadFile(exportData, `analytics.${format === 'excel' ? 'csv' : format}`, format === 'excel' ? 'csv' : format);
        rememberExport('Analytics', format, (analytics.market_insights || []).length);
        showToast('Analytics exported successfully!', 'success');
    } catch (error) {
        console.error('Failed to export analytics:', error);
        showToast('Failed to export analytics', 'error');
    }
}

async function generateReport(format) {
    try {
        showToast(`Generating ${format.toUpperCase()} report...`, 'success');
        const analytics = await fetchJson('/api/analytics/overview');
        const lines = [
            'Car Price Predictor Report',
            `Generated: ${new Date().toLocaleString()}`,
            `Total Cars: ${analytics.summary?.total_cars || 0}`,
            `Companies: ${analytics.summary?.companies || 0}`,
            `Average Price: Rs ${Number(analytics.summary?.average_price || 0).toLocaleString()}`,
            `Recent Predictions: ${analytics.summary?.recent_predictions || 0}`,
            `Exact Match Rate: ${(analytics.summary?.exact_match_rate || 0).toFixed(1)}%`,
        ];
        downloadFile(lines.join('\n'), `analytics-report.${format === 'pdf' ? 'txt' : format}`, 'text');
        rememberExport('Report', format, 1);
        showToast('Report generated successfully!', 'success');
    } catch (error) {
        console.error('Failed to generate report:', error);
        showToast('Failed to generate report', 'error');
    }
}

async function exportData(format) {
    try {
        showToast(`Exporting data as ${format.toUpperCase()}...`, 'success');
        const data = await fetchJson('/api/dataset');
        const records = data.records || [];
        const exportData = format === 'json' ? records : convertRowsToCsv(records);
        downloadFile(exportData, `data.${format === 'excel' ? 'csv' : format}`, format === 'excel' ? 'csv' : format);
        rememberExport('Dataset', format, records.length);
        showToast('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Failed to export data:', error);
        showToast('Failed to export data', 'error');
    }
}

// Download helper function
function downloadFile(content, filename, format) {
    let mimeType = 'text/plain';
    let data = content;
    
    switch (format) {
        case 'csv':
            mimeType = 'text/csv';
            break;
        case 'json':
            mimeType = 'application/json';
            data = JSON.stringify(content, null, 2);
            break;
        case 'excel':
            mimeType = 'application/vnd.ms-excel';
            break;
        case 'pdf':
            mimeType = 'application/pdf';
            break;
        case 'text':
            mimeType = 'text/plain';
            break;
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Settings functions
function saveSettings() {
    showToast('Settings saved successfully!', 'success');
    
    // Save to localStorage
    const settings = {
        defaultCurrency: document.getElementById('defaultCurrency')?.value || 'INR',
        dateFormat: document.getElementById('dateFormat')?.value || 'DD/MM/YYYY',
        timeZone: document.getElementById('timeZone')?.value || 'IST',
        confidenceThreshold: document.getElementById('confidenceThreshold')?.value || 85,
        priceTolerance: document.getElementById('priceTolerance')?.value || 10,
        enableAutoSave: document.getElementById('enableAutoSave')?.checked || true,
        emailNotifications: document.getElementById('emailNotifications')?.checked || true,
        systemAlerts: document.getElementById('systemAlerts')?.checked || true,
        weeklyReports: document.getElementById('weeklyReports')?.checked || false,
        sessionTimeout: document.getElementById('sessionTimeout')?.value || 30,
        twoFactorAuth: document.getElementById('twoFactorAuth')?.checked || false,
        apiRateLimit: document.getElementById('apiRateLimit')?.checked || true
    };
    
    localStorage.setItem('carPredictorSettings', JSON.stringify(settings));
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
        localStorage.removeItem('carPredictorSettings');
        showToast('Settings reset to default values!', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

function loadSettingsValues() {
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

// Database functions
function refreshDatabase() {
    showToast('Refreshing database...', 'success');
    if (window.pageRouter) {
        window.pageRouter.loadDatabaseData().then(() => {
            showToast('Database refreshed successfully!', 'success');
        }).catch(() => {
            showToast('Failed to refresh database', 'error');
        });
    }
}

function loadDatabaseData() {
    if (window.pageRouter) {
        return window.pageRouter.loadDatabaseData();
    }
}

async function waitForPredictForm(timeoutMs = 3000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const companySelect = document.getElementById('company');
        const modelSelect = document.getElementById('car_model');
        const yearSelect = document.getElementById('year');
        const kmInput = document.getElementById('kilo_driven');
        const fuelSelect = document.getElementById('fuel_type');

        if (companySelect && modelSelect && yearSelect && kmInput && fuelSelect) {
            return { companySelect, modelSelect, yearSelect, kmInput, fuelSelect };
        }

        await new Promise(resolve => setTimeout(resolve, 50));
    }

    throw new Error('Prediction form did not load in time');
}

async function waitForPredictFormOptions(timeoutMs = 3000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const companyReady = (document.getElementById('company')?.options.length || 0) > 1;
        const yearReady = (document.getElementById('year')?.options.length || 0) > 1;
        const fuelReady = (document.getElementById('fuel_type')?.options.length || 0) > 1;

        if (companyReady && yearReady && fuelReady) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 50));
    }

    throw new Error('Prediction form options did not load in time');
}

async function predictFromDatabase(company, model, year, km, fuel) {
    if (!window.pageRouter) return;

    window.pageRouter.navigateTo('predict');

    try {
        if (window.carPricePredictor) {
            await window.carPricePredictor.loadInitialData();
        }

        const { companySelect, modelSelect, yearSelect, kmInput, fuelSelect } = await waitForPredictForm();
        await waitForPredictFormOptions();
        const form = document.getElementById('predictForm');

        companySelect.value = company;

        if (window.carPricePredictor) {
            const models = await window.carPricePredictor.loadModels(company);
            if (!models.includes(model)) {
                throw new Error(`Model "${model}" is not available for ${company}`);
            }
        }

        modelSelect.value = model;
        yearSelect.value = String(year);
        kmInput.value = km;
        fuelSelect.value = fuel;
        form?.requestSubmit();
    } catch (error) {
        console.error('Failed to prefill prediction form from database:', error);
        showToast('Failed to load this vehicle into the prediction form', 'error');
    }
}

// Reports functions
function refreshReports() {
    showToast('Refreshing reports...', 'success');
    Promise.all([
        window.chartsManager ? window.chartsManager.initializeReportsCharts() : Promise.resolve(),
        window.pageRouter ? window.pageRouter.loadReportsData() : Promise.resolve(),
    ]).then(() => {
        showToast('Reports refreshed successfully!', 'success');
    }).catch(() => {
        showToast('Failed to refresh reports', 'error');
    });
}

function loadReportsCharts() {
    if (window.chartsManager) {
        return window.chartsManager.initializeReportsCharts();
    }
}

// FAQ functions
function setupFAQHandlers() {
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

function setupHelpSearch() {
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

// Chart initialization helpers
function initializeChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#eee' }
                }
            },
            scales: type === 'bar' || type === 'line' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#eee' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#eee' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            } : {},
            ...options
        }
    });
}

// Global functions for onclick handlers
window.exportPredictions = exportPredictions;
window.exportAnalytics = exportAnalytics;
window.generateReport = generateReport;
window.exportData = exportData;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.refreshDatabase = refreshDatabase;
window.refreshReports = refreshReports;
window.predictFromDatabase = predictFromDatabase;
