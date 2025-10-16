import { State } from './state.js';
import { Validators } from './validators.js';
import { Search } from './search.js';
import { Storage } from './storage.js';

// UI Controller module
export const UIController = {
    // Initialize UI
    init() {
        State.init();
        this.setupEventListeners();
        this.renderDashboard();
        this.setActiveSection('dashboard');
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    },

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.setActiveSection(section);
            });
        });

        // Transaction form
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            this.handleAddTransaction(e);
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            State.searchTerm = e.target.value;
            this.renderTransactions();
        });

        // Sorting
        document.getElementById('sort-date').addEventListener('click', () => {
            this.handleSort('date');
        });

        document.getElementById('sort-amount').addEventListener('click', () => {
            this.handleSort('amount');
        });

        document.getElementById('sort-description').addEventListener('click', () => {
            this.handleSort('description');
        });

        // Settings
        document.getElementById('save-currency').addEventListener('click', () => {
            this.saveCurrencySettings();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearData();
        });

        // Burger menu animation
        const burgerMenu = document.querySelector('.burger-menu');
        burgerMenu.addEventListener('mouseenter', function() {
            this.querySelector('.menu-items').style.transitionDelay = '0.05s';
        });
        
        burgerMenu.addEventListener('mouseleave', function() {
            this.querySelector('.menu-items').style.transitionDelay = '0s';
        });
    },

    // Set active section
    setActiveSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Update content based on section
        if (sectionId === 'dashboard') {
            this.renderDashboard();
        } else if (sectionId === 'transactions') {
            this.renderTransactions();
        } else if (sectionId === 'settings') {
            this.loadSettingsUI();
        }
    },

    // Handle adding a new transaction
    handleAddTransaction(e) {
        e.preventDefault();
        
        const transaction = {
            type: document.getElementById('transaction-type').value,
            description: document.getElementById('description').value.trim(),
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };
        
        // Validate transaction
        const validation = Validators.validateTransaction(transaction);
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }
        
        // Clear any previous errors
        this.clearValidationErrors();
        
        // Add transaction to state
        State.addTransaction(transaction);
        
        // Reset form
        e.target.reset();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
        
        // Update UI and return to dashboard
        this.renderDashboard();
        this.setActiveSection('dashboard');
        
        // Show success message
        this.showNotification('Transaction added successfully!', 'success');
    },

    // Show validation errors
    showValidationErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        });
    },

    // Clear validation errors
    clearValidationErrors() {
        document.querySelectorAll('.error-message').forEach(element => {
            element.style.display = 'none';
            element.textContent = '';
        });
    },

    // Handle sorting
    handleSort(key) {
        // Toggle direction if same key
        if (State.sortConfig.key === key) {
            State.sortConfig.direction = State.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            State.sortConfig.key = key;
            State.sortConfig.direction = 'asc';
        }
        
        // Update button text to show current sort state
        this.updateSortButtons();
        
        this.renderTransactions();
    },

    // Update sort buttons appearance
    updateSortButtons() {
        const sortButtons = {
            date: document.getElementById('sort-date'),
            description: document.getElementById('sort-description'),
            amount: document.getElementById('sort-amount')
        };

        Object.keys(sortButtons).forEach(key => {
            const button = sortButtons[key];
            if (State.sortConfig.key === key) {
                const direction = State.sortConfig.direction === 'asc' ? '↑' : '↓';
                button.textContent = `Sort by ${this.capitalizeFirstLetter(key)} ${direction}`;
                button.classList.add('active');
            } else {
                button.textContent = `Sort by ${this.capitalizeFirstLetter(key)}`;
                button.classList.remove('active');
            }
        });
    },

    // Render dashboard
    renderDashboard() {
        const stats = State.getDashboardStats();
        
        // Update stats cards
        document.getElementById('current-balance').textContent = `$${stats.balance.toFixed(2)}`;
        document.getElementById('monthly-income').textContent = `$${stats.income.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `$${stats.expenses.toFixed(2)}`;
        document.getElementById('monthly-savings').textContent = `$${stats.savings.toFixed(2)}`;
        
        // Update budget status if set
        const budgetStatus = document.getElementById('budget-status');
        if (budgetStatus) {
            budgetStatus.textContent = stats.budgetStatus;
        }
        
        // Update recent transactions
        this.renderTransactionList('recent-transactions-list', stats.recentTransactions);
    },

    // Render transactions list
    renderTransactions() {
        const transactions = State.getFilteredTransactions();
        this.renderTransactionList('transactions-list', transactions);
    },

    // Render transaction list to specified container
    renderTransactionList(containerId, transactions) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (transactions.length === 0) {
            const emptyMessage = containerId === 'recent-transactions-list' 
                ? 'No transactions yet' 
                : 'No transactions found';
                
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>${emptyMessage}</p>
                </div>
            `;
            return;
        }
        
        transactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            item.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="${State.getCategoryIcon(transaction.category)}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${this.escapeHtml(transaction.description)}</h4>
                        <p>${this.formatDate(transaction.date)} • ${transaction.category}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-actions">
                    <button class="btn-edit" onclick="UIController.editTransaction('${transaction.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="UIController.deleteTransaction('${transaction.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    },

    // Edit transaction
    editTransaction(id) {
        const transaction = State.transactions.find(t => t.id === id);
        if (!transaction) return;

        // Populate edit form
        document.getElementById('edit-id').value = transaction.id;
        document.getElementById('edit-transaction-type').value = transaction.type;
        document.getElementById('edit-description').value = transaction.description;
        document.getElementById('edit-amount').value = transaction.amount;
        document.getElementById('edit-category').value = transaction.category;
        document.getElementById('edit-date').value = transaction.date;

        // Show edit modal
        document.getElementById('edit-modal').style.display = 'flex';
    },

    // Delete transaction
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            State.deleteTransaction(id);
            this.renderDashboard();
            this.renderTransactions();
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    },

    // Save currency settings
    saveCurrencySettings() {
        const settings = {
            baseCurrency: document.getElementById('base-currency').value,
            conversionRates: {
                rate1: parseFloat(document.getElementById('conversion-rate-1').value) || 0,
                rate2: parseFloat(document.getElementById('conversion-rate-2').value) || 0
            },
            monthlyBudget: parseFloat(document.getElementById('monthly-budget').value) || 0
        };
        
        const validation = Validators.validateSettings(settings);
        if (!validation.isValid) {
            this.showNotification('Please check your settings: ' + Object.values(validation.errors).join(', '), 'error');
            return;
        }
        
        State.settings = settings;
        State.saveSettings();
        this.showNotification('Settings saved successfully!', 'success');
        
        // Update dashboard with new settings
        this.renderDashboard();
    },

    // Load settings UI with current values
    loadSettingsUI() {
        document.getElementById('base-currency').value = State.settings.baseCurrency;
        document.getElementById('conversion-rate-1').value = State.settings.conversionRates.rate1 || '';
        document.getElementById('conversion-rate-2').value = State.settings.conversionRates.rate2 || '';
        document.getElementById('monthly-budget').value = State.settings.monthlyBudget || '';
    },

    // Export data
    exportData() {
        const data = {
            transactions: State.transactions,
            settings: State.settings,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
        
        if (Storage.exportData(data, 'aluspend-wise-backup.json')) {
            this.showNotification('Data exported successfully!', 'success');
        } else {
            this.showNotification('Error exporting data. Please try again.', 'error');
        }
    },

    // Import data
    async importData() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Please select a file to import.', 'error');
            return;
        }
        
        try {
            const data = await Storage.importData(file);
            
            // Validate imported data structure
            if (!data.transactions || !Array.isArray(data.transactions)) {
                throw new Error('Invalid data format: missing transactions array');
            }
            
            if (confirm('This will replace all your current data. Continue?')) {
                State.transactions = data.transactions;
                State.settings = data.settings || State.settings;
                State.saveTransactions();
                State.saveSettings();
                
                this.renderDashboard();
                this.renderTransactions();
                this.showNotification('Data imported successfully!', 'success');
                fileInput.value = ''; // Clear file input
            }
        } catch (error) {
            this.showNotification('Error importing data: ' + error.message, 'error');
        }
    },

    // Clear data
    clearData() {
        if (confirm('This will permanently delete all your data. This action cannot be undone. Continue?')) {
            Storage.clear();
            State.transactions = [];
            State.settings = {
                baseCurrency: 'USD',
                conversionRates: {},
                monthlyBudget: 0
            };
            State.saveTransactions();
            State.saveSettings();
            
            this.renderDashboard();
            this.renderTransactions();
            this.showNotification('All data has been cleared.', 'success');
        }
    },

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
});

// Make UIController available globally for onclick handlers
window.UIController = UIController;

