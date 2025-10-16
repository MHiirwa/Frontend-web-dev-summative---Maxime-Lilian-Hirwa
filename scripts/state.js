import { Storage } from './storage.js';

// Application state management
export const State = {
    // Initial state
    transactions: [],
    settings: {
        baseCurrency: 'USD',
        conversionRates: {
            USD: 1,
            RWF: 1200  // Approximate exchange rate (1 USD = 1200 RWF)
        },
        monthlyBudget: 0
    },
    sortConfig: {
        key: 'date',
        direction: 'desc'
    },
    searchTerm: '',

    // Initialize state from localStorage
    init() {
        this.transactions = Storage.load('aluspendTransactions', []);
        this.settings = Storage.load('aluspendSettings', this.settings);
        
        // Add sample data if no data exists
        if (this.transactions.length === 0) {
            this.transactions = [
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
            this.saveTransactions();
        }
    },

    // Save transactions to localStorage
    saveTransactions() {
        Storage.save('aluspendTransactions', this.transactions);
    },

    // Save settings to localStorage
    saveSettings() {
        Storage.save('aluspendSettings', this.settings);
    },

    // Add a new transaction
    addTransaction(transaction) {
        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
            date: transaction.date || new Date().toISOString().split('T')[0]
        };
        
        this.transactions.push(newTransaction);
        this.saveTransactions();
        return newTransaction;
    },

    // Update a transaction
    updateTransaction(id, updates) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions[index] = {
                ...this.transactions[index],
                ...updates
            };
            this.saveTransactions();
            return this.transactions[index];
        }
        return null;
    },

    // Delete a transaction
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
    },

    // Get filtered and sorted transactions
    getFilteredTransactions() {
        let filtered = [...this.transactions];
        
        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(transaction => 
                transaction.description.toLowerCase().includes(searchLower) ||
                transaction.category.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[this.sortConfig.key];
            let bValue = b[this.sortConfig.key];
            
            if (this.sortConfig.key === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else if (this.sortConfig.key === 'amount') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            } else {
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }
            
            if (aValue < bValue) {
                return this.sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return this.sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        return filtered;
    },

    // Get dashboard statistics
    getDashboardStats() {
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
        
        return {
            balance,
            income,
            expenses,
            savings,
            recentTransactions
        };
    },

    // Get category icon
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
    },

    // Currency conversion methods
    convertAmount(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        // Convert to USD first, then to target currency
        const amountInUSD = amount / this.settings.conversionRates[fromCurrency];
        return amountInUSD * this.settings.conversionRates[toCurrency];
    },

    // Format amount with currency symbol
    formatCurrency(amount, currency = this.settings.baseCurrency) {
        const symbols = {
            'USD': '$',
            'RWF': 'RF '
        };
        
        const symbol = symbols[currency] || currency;
        return `${symbol}${amount.toFixed(2)}`;
    },

    // Get current currency symbol
    getCurrencySymbol(currency = this.settings.baseCurrency) {
        const symbols = {
            'USD': '$',
            'RWF': 'RF '
        };
        return symbols[currency] || currency;
    },

    // Update conversion rate
    updateConversionRate(currency, rate) {
        if (this.settings.conversionRates.hasOwnProperty(currency)) {
            this.settings.conversionRates[currency] = rate;
            this.saveSettings();
            return true;
        }
        return false;
    },

    // Get all supported currencies
    getSupportedCurrencies() {
        return ['USD', 'RWF'];
    },

    // Get formatted amount in current base currency
    getFormattedAmount(amount) {
        return this.formatCurrency(amount, this.settings.baseCurrency);
    },

    // Convert and format amount for display
    getDisplayAmount(amount, targetCurrency = this.settings.baseCurrency) {
        const convertedAmount = this.convertAmount(amount, this.settings.baseCurrency, targetCurrency);
        return this.formatCurrency(convertedAmount, targetCurrency);
    }
};