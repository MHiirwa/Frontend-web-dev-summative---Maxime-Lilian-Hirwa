// Transaction management functionality
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentSort = { field: 'date', direction: 'desc' };
    }

    init() {
        this.transactions = storage.getTransactions();
        this.filteredTransactions = [...this.transactions];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Transaction form
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTransaction();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Sort buttons
        document.getElementById('sort-date').addEventListener('click', () => {
            this.sortTransactions('date');
        });

        document.getElementById('sort-amount').addEventListener('click', () => {
            this.sortTransactions('amount');
        });

        // Edit form
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditTransaction();
        });

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeEditModal();
        });

        // Modal backdrop click
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('edit-modal')) {
                this.closeEditModal();
            }
        });
    }

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

        this.transactions = storage.addTransaction(transaction);
        this.filteredTransactions = [...this.transactions];
        
        // Update UI
        ui.updateDashboard();
        ui.updateTransactionsList(this.filteredTransactions);
        
        // Reset form and show notification
        form.reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        ui.showNotification('Transaction added successfully!');
        
        // Switch to transactions view
        ui.switchSection('transactions');
    }

    handleEditTransaction() {
        const transactionId = document.getElementById('edit-id').value;
        const updatedTransaction = {
            id: transactionId,
            type: document.getElementById('edit-transaction-type').value,
            description: document.getElementById('edit-description').value,
            amount: parseFloat(document.getElementById('edit-amount').value),
            category: document.getElementById('edit-category').value,
            date: document.getElementById('edit-date').value
        };

        this.transactions = storage.updateTransaction(updatedTransaction);
        this.filteredTransactions = [...this.transactions];
        
        // Update UI
        ui.updateDashboard();
        ui.updateTransactionsList(this.filteredTransactions);
        
        // Close modal and show notification
        this.closeEditModal();
        ui.showNotification('Transaction updated successfully!');
    }

    openEditModal(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
            document.getElementById('edit-id').value = transaction.id;
            document.getElementById('edit-transaction-type').value = transaction.type;
            document.getElementById('edit-description').value = transaction.description;
            document.getElementById('edit-amount').value = transaction.amount;
            document.getElementById('edit-category').value = transaction.category;
            document.getElementById('edit-date').value = transaction.date;
            
            document.getElementById('edit-modal').style.display = 'flex';
        }
    }

    closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
    }

    deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = storage.deleteTransaction(transactionId);
            this.filteredTransactions = [...this.transactions];
            
            // Update UI
            ui.updateDashboard();
            ui.updateTransactionsList(this.filteredTransactions);
            ui.showNotification('Transaction deleted successfully!');
        }
    }

    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredTransactions = this.transactions.filter(transaction => 
            transaction.description.toLowerCase().includes(term) ||
            transaction.category.toLowerCase().includes(term)
        );
        
        this.sortTransactions(this.currentSort.field);
        ui.updateTransactionsList(this.filteredTransactions);
    }

    sortTransactions(field) {
        // Toggle direction if same field
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'desc';
        }

        // Update button states
        document.getElementById('sort-date').classList.toggle('active', field === 'date');
        document.getElementById('sort-amount').classList.toggle('active', field === 'amount');

        // Sort transactions
        this.filteredTransactions.sort((a, b) => {
            let aValue, bValue;
            
            if (field === 'date') {
                aValue = new Date(a.date);
                bValue = new Date(b.date);
            } else {
                aValue = a.amount;
                bValue = b.amount;
            }
            
            if (this.currentSort.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        ui.updateTransactionsList(this.filteredTransactions);
    }

    getMonthlyStats() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });
        
        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const monthlyExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            currentBalance: totalIncome - totalExpenses,
            monthlyIncome,
            monthlyExpenses,
            monthlySavings: monthlyIncome - monthlyExpenses
        };
    }

    getRecentTransactions(limit = 5) {
        return [...this.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
}

// Create global instance
const transactionManager = new TransactionManager();