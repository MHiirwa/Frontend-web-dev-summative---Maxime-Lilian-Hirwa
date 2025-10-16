// Storage management for ALUspend Wise
class StorageManager {
    constructor() {
        this.transactionsKey = 'aluspend-transactions';
        this.settingsKey = 'aluspend-settings';
    }

    // Transaction methods
    getTransactions() {
        const transactions = localStorage.getItem(this.transactionsKey);
        return transactions ? JSON.parse(transactions) : [];
    }

    saveTransactions(transactions) {
        localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.push(transaction);
        this.saveTransactions(transactions);
        return transactions;
    }

    updateTransaction(updatedTransaction) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id === updatedTransaction.id);
        if (index !== -1) {
            transactions[index] = updatedTransaction;
            this.saveTransactions(transactions);
        }
        return transactions;
    }

    deleteTransaction(transactionId) {
        const transactions = this.getTransactions();
        const filteredTransactions = transactions.filter(t => t.id !== transactionId);
        this.saveTransactions(filteredTransactions);
        return filteredTransactions;
    }

    // Settings methods
    getSettings() {
        const settings = localStorage.getItem(this.settingsKey);
        const defaultSettings = {
            baseCurrency: 'USD',
            conversionRate: 1200,
            monthlyBudget: 0,
            theme: 'light'
        };
        return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    }

    saveSettings(settings) {
        localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    }

    // Data export/import
    exportData() {
        const data = {
            transactions: this.getTransactions(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
        return data;
    }

    importData(data) {
        if (data.transactions) {
            this.saveTransactions(data.transactions);
        }
        if (data.settings) {
            this.saveSettings(data.settings);
        }
    }

    clearAllData() {
        localStorage.removeItem(this.transactionsKey);
        localStorage.removeItem(this.settingsKey);
    }
}

// Create global instance
const storage = new StorageManager();