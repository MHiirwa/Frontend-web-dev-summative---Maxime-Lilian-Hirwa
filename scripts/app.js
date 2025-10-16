// Simple Finance Tracker App
class ALUSpendWise {
    constructor() {
        this.transactions = this.loadTransactions();
        this.settings = this.loadSettings();
        this.currentSort = { key: 'date', direction: 'desc' };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDashboard();
        this.setCurrentDate();
    }

    // Data Management
    loadTransactions() {
        const saved = localStorage.getItem('aluspendTransactions');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Sample data
        return [
            {
                id: '1',
                description: 'Grocery Shopping',
                amount: 85.30,
                type: 'expense',
                category: 'Food',
                date: '2023-05-15'
            },
            {
                id: '2',
                description: 'Salary Deposit',
                amount: 2450.00,
                type: 'income',
                category: 'Income',
                date: '2023-05-10'
            },
            {
                id: '3',
                description: 'Restaurant Dinner',
                amount: 64.20,
                type: 'expense',
                category: 'Food',
                date: '2023-05-08'
            },
            {
                id: '4',
                description: 'Netflix Subscription',
                amount: 15.99,
                type: 'expense',
                category: 'Entertainment',
                date: '2023-05-05'
            }
        ];
    }

    loadSettings() {
        const saved = localStorage.getItem('aluspendSettings');
        return saved ? JSON.parse(saved) : { currency: 'USD', monthlyBudget: 0 };
    }

    saveTransactions() {
        localStorage.setItem('aluspendTransactions', JSON.stringify(this.transactions));
    }

    saveSettings() {
        localStorage.setItem('aluspendSettings', JSON.stringify(this.settings));
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(item.dataset.section);
            });
        });

        // Transaction Form
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTransaction();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Sorting
        document.getElementById('sort-date').addEventListener('click', () => {
            this.handleSort('date');
        });

        document.getElementById('sort-amount').addEventListener('click', () => {
            this.handleSort('amount');
        });

        // Settings
        document.getElementById('save-budget').addEventListener('click', () => {
            this.handleSaveBudget();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.handleExportData();
        });

        document.getElementById('clear-data').addEventListener('click', () => {
            this.handleClearData();
        });

        // Burger menu animation
        const burgerMenu = document.querySelector('.burger-menu');
        burgerMenu.addEventListener('mouseenter', () => {
            burgerMenu.querySelector('.menu-items').style.transitionDelay = '0.05s';
        });
        
        burgerMenu.addEventListener('mouseleave', () => {
            burgerMenu.querySelector('.menu-items').style.transitionDelay = '0s';
        });
    }

    // Navigation
    handleNavigation(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Show selected section
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        // Update content based on section
        if (section === 'dashboard') {
            this.renderDashboard();
        } else if (section === 'transactions') {
            this.renderTransactions();
        }
    }

    // Transaction Management
    handleAddTransaction() {
        const form = document.getElementById('transaction-form');
        const formData = new FormData(form);

        const transaction = {
            id: Date.now().toString(),
            type: document.getElementById('transaction-type').value,
            description: document.getElementById('description').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };

        // Basic validation
        if (!transaction.description || !transaction.amount || !transaction.category) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        if (transaction.amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }

        this.transactions.push(transaction);
        this.saveTransactions();
        
        // Reset form
        form.reset();
        this.setCurrentDate();
        
        // Show success and navigate to dashboard
        this.showNotification('Transaction added successfully!');
        this.handleNavigation('dashboard');
    }

    handleSearch(query) {
        this.renderTransactions(query);
    }

    handleSort(key) {
        // Update active sort button
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`sort-${key}`).classList.add('active');

        // Toggle direction if same key
        if (this.currentSort.key === key) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.key = key;
            this.currentSort.direction = 'desc';
        }

        this.renderTransactions();
    }

    // Settings
    handleSaveBudget() {
        const budget = parseFloat(document.getElementById('monthly-budget').value);
        if (budget && budget > 0) {
            this.settings.monthlyBudget = budget;
            this.saveSettings();
            this.showNotification('Budget saved successfully!');
        } else {
            this.showNotification('Please enter a valid budget amount', 'error');
        }
    }

    handleExportData() {
        const data = {
            transactions: this.transactions,
            settings: this.settings,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'aluspend-wise-backup.json';
        link.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!');
    }

    handleClearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            this.transactions = [];
            this.settings = { currency: 'USD', monthlyBudget: 0 };
            localStorage.removeItem('aluspendTransactions');
            localStorage.removeItem('aluspendSettings');
            this.renderDashboard();
            this.showNotification('All data cleared successfully!');
        }
    }

    // Rendering
    renderDashboard() {
        const stats = this.calculateStats();
        
        // Update stats cards
        document.getElementById('current-balance').textContent = `$${stats.balance.toFixed(2)}`;
        document.getElementById('monthly-income').textContent = `$${stats.income.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `$${stats.expenses.toFixed(2)}`;
        document.getElementById('monthly-savings').textContent = `$${stats.savings.toFixed(2)}`;
        
        // Update recent transactions
        this.renderTransactionList('recent-transactions-list', stats.recentTransactions);
    }

    renderTransactions(searchQuery = '') {
        let transactions = [...this.transactions];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            transactions = transactions.filter(t => 
                t.description.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        transactions.sort((a, b) => {
            let aValue = a[this.currentSort.key];
            let bValue = b[this.currentSort.key];

            if (this.currentSort.key === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (aValue < bValue) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderTransactionList('transactions-list', transactions);
    }

    renderTransactionList(containerId, transactions) {
        const container = document.getElementById(containerId);
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="${this.getCategoryIcon(transaction.category)}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${this.formatDate(transaction.date)} • ${transaction.category}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    // Utilities
    calculateStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });
        
        const income = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = income - expenses;
        const savings = Math.max(0, balance);
        
        // Get recent transactions (last 5)
        const recentTransactions = this.transactions
            .slice(-5)
            .reverse();
        
        return { balance, income, expenses, savings, recentTransactions };
    }

    getCategoryIcon(category) {
        const icons = {
            'Food': 'fas fa-utensils',
            'Entertainment': 'fas fa-film',
            'Transportation': 'fas fa-car',
            'Education': 'fas fa-graduation-cap',
            'Housing': 'fas fa-home',
            'Income': 'fas fa-money-check-alt',
            'Other': 'fas fa-receipt'
        };
        return icons[category] || 'fas fa-receipt';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ALUSpendWise();
});

